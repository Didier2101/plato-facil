"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import type {
    FiltroReporte,
    ReporteResponse,
    Usuario,
    VentaUsuarioMap,
    ProductoMap,
    VentaCategoriaMap,
    VentaHoraMap,
    VentaMetodoPagoMap
} from "../../types/reportes";

export async function obtenerReporteAvanzadoAction(filtro: FiltroReporte): Promise<ReporteResponse> {
    try {
        const { fechaInicio, fechaFin, usuarioId, estado } = filtro;

        // ✅ SOLUCIÓN: Crear fechas locales sin conversión de zona horaria
        const inicioDay = new Date(`${fechaInicio}T00:00:00`);
        const finDay = new Date(`${fechaFin}T23:59:59`);

        // 1️⃣ Obtener todas las órdenes con información detallada
        let queryOrdenes = supabaseAdmin
            .from("ordenes")
            .select(`
                id,
                cliente_nombre,
                cliente_telefono,
                cliente_direccion,
                cliente_notas,
                total,
                estado,
                tipo_orden,
                created_at,
                updated_at,
                fecha_entrega,
                usuario_vendedor_id,
                usuario_entregador_id
            `)
            .gte("created_at", inicioDay.toISOString())
            .lte("created_at", finDay.toISOString());

        if (usuarioId) {
            queryOrdenes = queryOrdenes.or(`usuario_vendedor_id.eq.${usuarioId},usuario_entregador_id.eq.${usuarioId}`);
        }

        if (estado) {
            queryOrdenes = queryOrdenes.eq("estado", estado);
        }

        const { data: ordenes, error: errorOrdenes } = await queryOrdenes.order("created_at", { ascending: false });
        if (errorOrdenes) throw errorOrdenes;

        if (!ordenes || ordenes.length === 0) {
            return {
                success: true,
                datos: {
                    totalVentas: 0,
                    totalPropinas: 0,
                    totalPedidos: 0,
                    promedioVenta: 0,
                    ventasPorUsuario: [],
                    masVendidos: [],
                    menosVendidos: [],
                    ventasPorCategoria: [],
                    ventasPorHora: [],
                    ordenesDetalladas: [],
                    ventasPorMetodoPago: [],
                    estadisticasEstados: [],
                    ventasPorTipoOrden: []
                }
            };
        }

        const ordenIds = ordenes.map(o => o.id);

        // Obtener todos los usuarios involucrados (vendedores, entregadores y cajeros)
        const vendedorIds = ordenes.map(o => o.usuario_vendedor_id).filter(Boolean);
        const entregadorIds = ordenes.map(o => o.usuario_entregador_id).filter(Boolean);

        // Primero obtener los pagos para saber quién cobró
        const { data: pagosTemp } = await supabaseAdmin
            .from("pagos")
            .select("orden_id, usuario_id")
            .in("orden_id", ordenIds);

        const cajeroIds = (pagosTemp || []).map(p => p.usuario_id).filter(Boolean);

        // Combinar todos los IDs únicos
        const userIds = [...new Set([...vendedorIds, ...entregadorIds, ...cajeroIds])];

        // 2️⃣ Obtener información de usuarios
        const { data: usuarios } = await supabaseAdmin
            .from("usuarios")
            .select("id, nombre, rol, email")
            .in("id", userIds);

        const usuariosMap = (usuarios || []).reduce((acc: Record<string, Usuario>, u: Usuario) => {
            acc[u.id] = u;
            return acc;
        }, {});

        // 3️⃣ Obtener pagos con propinas
        const { data: pagos } = await supabaseAdmin
            .from("pagos")
            .select(`
                id,
                orden_id,
                usuario_id,
                metodo_pago,
                monto,
                created_at,
                propinas(
                    id,
                    monto,
                    porcentaje,
                    created_at
                )
            `)
            .in("orden_id", ordenIds);

        // 4️⃣ Obtener detalles de productos con información de categorías
        const { data: detalles } = await supabaseAdmin
            .from("orden_detalles")
            .select(`
                orden_id,
                producto_id,
                producto_nombre,
                precio_unitario,
                cantidad,
                subtotal,
                notas_personalizacion
            `)
            .in("orden_id", ordenIds);

        // Obtener información de productos para categorías
        const productosIds = [...new Set((detalles || []).map(d => d.producto_id))];
        const { data: productosDB } = await supabaseAdmin
            .from("productos")
            .select(`
                id,
                nombre,
                categoria_id,
                categorias(
                    id,
                    nombre
                )
            `)
            .in("id", productosIds);

        interface ProductoRaw {
            id: number;
            nombre: string;
            categoria_id: number;
            categorias: { id: number; nombre: string }[];
        }

        const productosCategoriasMap = (productosDB || []).reduce((acc: Record<number, string>, p: ProductoRaw) => {
            const categoria = p.categorias?.[0];
            acc[p.id] = categoria?.nombre || 'Sin categoría';
            return acc;
        }, {});

        // 5️⃣ Procesar datos para el reporte

        interface PagoConPropina {
            id: string;
            orden_id: string;
            usuario_id: string;
            cajero_nombre: string;
            metodo_pago: string;
            monto: number;
            created_at: string;
            propina: number;
        }

        interface DetalleConCategoria {
            orden_id: string;
            producto_nombre: string;
            precio_unitario: number;
            cantidad: number;
            subtotal: number;
            categoria: string;
        }

        interface PagoRaw {
            id: string;
            orden_id: string;
            usuario_id: string;
            metodo_pago: string;
            monto: string | number;
            created_at: string;
            propinas?: { monto: string | number }[];
        }

        // Mapear pagos por orden
        const pagosMap = (pagos || []).reduce((acc: Record<string, PagoConPropina[]>, p: PagoRaw) => {
            if (!acc[p.orden_id]) acc[p.orden_id] = [];
            const totalPropina = p.propinas ? p.propinas.reduce((sum, prop) => sum + Number(prop.monto), 0) : 0;

            // Agregar información del cajero
            const cajero = usuariosMap[p.usuario_id];

            acc[p.orden_id].push({
                id: p.id,
                orden_id: p.orden_id,
                usuario_id: p.usuario_id,
                cajero_nombre: cajero?.nombre || 'Usuario desconocido',
                metodo_pago: p.metodo_pago,
                created_at: p.created_at,
                monto: Number(p.monto),
                propina: totalPropina
            });
            return acc;
        }, {});

        // Mapear detalles por orden con categorías
        const detallesMap = (detalles || []).reduce((acc: Record<string, DetalleConCategoria[]>, detalle) => {
            if (!acc[detalle.orden_id]) acc[detalle.orden_id] = [];

            acc[detalle.orden_id].push({
                orden_id: detalle.orden_id,
                producto_nombre: detalle.producto_nombre,
                precio_unitario: Number(detalle.precio_unitario),
                cantidad: Number(detalle.cantidad),
                subtotal: Number(detalle.subtotal),
                categoria: productosCategoriasMap[detalle.producto_id] || 'Sin categoría'
            });
            return acc;
        }, {});

        // Totales generales
        const totalVentas = ordenes.reduce((acc, o) => acc + Number(o.total), 0);
        const totalPropinas = Object.values(pagosMap).flat().reduce((acc, p) => acc + p.propina, 0);
        const totalPedidos = ordenes.length;
        const promedioVenta = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

        // Ventas por usuario (vendedores y entregadores)
        const ventasPorUsuarioMap: Record<string, VentaUsuarioMap> = {};

        ordenes.forEach(orden => {
            // Contar ventas para vendedores
            const vendedorId = orden.usuario_vendedor_id;
            if (vendedorId && usuariosMap[vendedorId]) {
                const usuario = usuariosMap[vendedorId];
                if (!ventasPorUsuarioMap[vendedorId]) {
                    ventasPorUsuarioMap[vendedorId] = {
                        nombre: usuario.nombre,
                        rol: usuario.rol,
                        totalVentas: 0,
                        pedidos: 0
                    };
                }
                ventasPorUsuarioMap[vendedorId].totalVentas += Number(orden.total);
                ventasPorUsuarioMap[vendedorId].pedidos += 1;
            }

            // Contar entregas para entregadores
            const entregadorId = orden.usuario_entregador_id;
            if (entregadorId && usuariosMap[entregadorId]) {
                const usuario = usuariosMap[entregadorId];
                if (!ventasPorUsuarioMap[entregadorId]) {
                    ventasPorUsuarioMap[entregadorId] = {
                        nombre: usuario.nombre,
                        rol: usuario.rol,
                        totalVentas: 0,
                        pedidos: 0
                    };
                }
                // Para entregadores, contamos las órdenes entregadas
                if (orden.estado === 'entregada') {
                    ventasPorUsuarioMap[entregadorId].pedidos += 1;
                }
            }
        });

        const ventasPorUsuario = Object.entries(ventasPorUsuarioMap).map(([id, data]) => ({
            id,
            ...data,
            promedioVenta: data.pedidos > 0 ? data.totalVentas / data.pedidos : 0
        }));

        // Análisis de productos
        const productosMap: Record<string, ProductoMap> = {};
        Object.values(detallesMap).flat().forEach(detalle => {
            if (!productosMap[detalle.producto_nombre]) {
                productosMap[detalle.producto_nombre] = {
                    cantidad: 0,
                    ingresos: 0,
                    categoria: detalle.categoria
                };
            }
            productosMap[detalle.producto_nombre].cantidad += detalle.cantidad;
            productosMap[detalle.producto_nombre].ingresos += detalle.subtotal;
        });

        const productos = Object.entries(productosMap).map(([nombre, data]) => ({
            nombre,
            ...data
        }));

        const masVendidos = [...productos].sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
        const menosVendidos = [...productos].sort((a, b) => a.cantidad - b.cantidad).slice(0, 5);

        // Ventas por categoría
        const ventasPorCategoriaMap: Record<string, VentaCategoriaMap> = {};
        productos.forEach(p => {
            if (!ventasPorCategoriaMap[p.categoria]) {
                ventasPorCategoriaMap[p.categoria] = { cantidad: 0, ingresos: 0 };
            }
            ventasPorCategoriaMap[p.categoria].cantidad += p.cantidad;
            ventasPorCategoriaMap[p.categoria].ingresos += p.ingresos;
        });

        const ventasPorCategoria = Object.entries(ventasPorCategoriaMap).map(([nombre, data]) => ({
            nombre,
            categoria: nombre,
            ...data
        }));

        // Ventas por hora
        const ventasPorHoraMap: Record<number, VentaHoraMap> = {};
        ordenes.forEach(orden => {
            // ✅ Crear fecha local para obtener la hora correcta
            const fechaLocal = new Date(orden.created_at);
            const hora = fechaLocal.getHours();

            if (!ventasPorHoraMap[hora]) {
                ventasPorHoraMap[hora] = { ventas: 0, pedidos: 0 };
            }
            ventasPorHoraMap[hora].ventas += Number(orden.total);
            ventasPorHoraMap[hora].pedidos += 1;
        });

        const ventasPorHora = Object.entries(ventasPorHoraMap).map(([hora, data]) => ({
            hora: parseInt(hora),
            ...data
        })).sort((a, b) => a.hora - b.hora);

        // Órdenes detalladas (primeras 50)
        const ordenesDetalladas = ordenes.slice(0, 50).map(orden => {
            const pagoOrden = pagosMap[orden.id]?.[0];
            return {
                id: orden.id,
                cliente_nombre: orden.cliente_nombre,
                cliente_telefono: orden.cliente_telefono || '',
                cliente_direccion: orden.cliente_direccion || '',
                total: Number(orden.total),
                estado: orden.estado,
                tipo_orden: orden.tipo_orden,
                vendedor: orden.usuario_vendedor_id ? usuariosMap[orden.usuario_vendedor_id]?.nombre || 'Usuario no encontrado' : 'Sin asignar',
                entregador: orden.usuario_entregador_id ? usuariosMap[orden.usuario_entregador_id]?.nombre : undefined,
                cajero: pagoOrden?.cajero_nombre || undefined,
                created_at: orden.created_at,
                fecha_entrega: orden.fecha_entrega,
                metodo_pago: pagoOrden?.metodo_pago || 'N/A',
                propina: pagoOrden?.propina || undefined
            };
        });

        // Ventas por método de pago
        const ventasPorMetodoPagoMap: Record<string, VentaMetodoPagoMap> = {};
        Object.values(pagosMap).flat().forEach(pago => {
            if (!ventasPorMetodoPagoMap[pago.metodo_pago]) {
                ventasPorMetodoPagoMap[pago.metodo_pago] = { cantidad: 0, monto: 0 };
            }
            ventasPorMetodoPagoMap[pago.metodo_pago].cantidad += 1;
            ventasPorMetodoPagoMap[pago.metodo_pago].monto += pago.monto;
        });

        const ventasPorMetodoPago = Object.entries(ventasPorMetodoPagoMap).map(([metodo, data]) => ({
            metodo,
            ...data
        }));

        // Estadísticas de estados
        const estadisticasEstadosMap: Record<string, number> = {};
        ordenes.forEach(orden => {
            estadisticasEstadosMap[orden.estado] = (estadisticasEstadosMap[orden.estado] || 0) + 1;
        });

        const estadisticasEstados = Object.entries(estadisticasEstadosMap).map(([estado, cantidad]) => ({
            estado,
            cantidad,
            porcentaje: (cantidad / totalPedidos) * 100
        }));

        // Ventas por tipo de orden (establecimiento vs domicilio)
        const ventasPorTipoOrdenMap: Record<string, { cantidad: number; monto: number }> = {};
        ordenes.forEach(orden => {
            if (!ventasPorTipoOrdenMap[orden.tipo_orden]) {
                ventasPorTipoOrdenMap[orden.tipo_orden] = { cantidad: 0, monto: 0 };
            }
            ventasPorTipoOrdenMap[orden.tipo_orden].cantidad += 1;
            ventasPorTipoOrdenMap[orden.tipo_orden].monto += Number(orden.total);
        });

        const ventasPorTipoOrden = Object.entries(ventasPorTipoOrdenMap).map(([tipo, data]) => ({
            tipo,
            ...data
        }));

        return {
            success: true,
            datos: {
                totalVentas,
                totalPropinas,
                totalPedidos,
                promedioVenta,
                ventasPorUsuario,
                masVendidos,
                menosVendidos,
                ventasPorCategoria,
                ventasPorHora,
                ordenesDetalladas,
                ventasPorMetodoPago,
                estadisticasEstados,
                ventasPorTipoOrden
            }
        };

    } catch (error) {
        console.error("Error obteniendo reporte avanzado:", error);
        return {
            success: false,
            error: "No se pudo obtener el reporte avanzado",
            details: error instanceof Error ? error.message : String(error)
        };
    }
}