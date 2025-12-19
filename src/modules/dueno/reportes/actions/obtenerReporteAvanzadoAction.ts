"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Interfaces simplificadas
interface ReporteDatosSimplificado {
    // Métricas financieras principales
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    promedioTicket: number;
    totalCostosDomicilio: number;

    // Desglose por tipo
    ventasPorTipoOrden: Array<{
        tipo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;

    // Métodos de pago
    ventasPorMetodoPago: Array<{
        metodo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;

    // Estados (para monitorear eficiencia)
    estadisticasEstados: Array<{
        estado: string;
        cantidad: number;
        porcentaje: number;
    }>;

    // Top productos (solo los que más venden)
    topProductos: Array<{
        nombre: string;
        cantidad: number;
        ingresos: number;
        precioPromedio: number;
    }>;

    // Ventas por empleado
    ventasPorUsuario: Array<{
        id: string;
        nombre: string;
        rol: string;
        totalVentas: number;
        pedidos: number;
        promedioTicket: number;
        propinasRecibidas: number;
    }>;

    // Análisis temporal
    ventasPorDia: Array<{
        fecha: string;
        ventas: number;
        pedidos: number;
    }>;

    ventasPorHora: Array<{
        hora: number;
        ventas: number;
        pedidos: number;
    }>;

    // Estadísticas de domicilio (resumidas)
    domicilios: {
        total: number;
        ingresosTotales: number;
        costoPromedio: number;
        distanciaPromedio: number;
    };
}

interface FiltroReporte {
    fechaInicio: string;
    fechaFin: string;
    usuarioId?: string;
    estado?: string;
    tipoOrden?: string;
}

const toNumber = (value: string | number | null): number => {
    if (value === null) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
};

export async function obtenerReporteSimplificadoAction(filtro: FiltroReporte) {
    try {
        const { fechaInicio, fechaFin, usuarioId, estado, tipoOrden } = filtro;

        const inicioDay = new Date(`${fechaInicio}T00:00:00`);
        const finDay = new Date(`${fechaFin}T23:59:59`);

        // Query principal de órdenes
        let queryOrdenes = supabaseAdmin
            .from("ordenes")
            .select(`
                *,
                usuario_vendedor:usuarios!ordenes_usuario_vendedor_id_fkey(id, nombre, rol),
                usuario_entregador:usuarios!ordenes_usuario_entregador_id_fkey(id, nombre, rol)
            `)
            .gte("created_at", inicioDay.toISOString())
            .lte("created_at", finDay.toISOString());

        if (usuarioId) {
            queryOrdenes = queryOrdenes.or(`usuario_vendedor_id.eq.${usuarioId},usuario_entregador_id.eq.${usuarioId}`);
        }
        if (estado) queryOrdenes = queryOrdenes.eq("estado", estado);
        if (tipoOrden) queryOrdenes = queryOrdenes.eq("tipo_orden", tipoOrden);

        const { data: ordenes, error: errorOrdenes } = await queryOrdenes;
        if (errorOrdenes) throw errorOrdenes;
        if (!ordenes || ordenes.length === 0) {
            return { success: true, datos: null };
        }

        const ordenIds = ordenes.map(o => o.id);

        // Obtener datos relacionados
        const [
            { data: detalles },
            { data: pagos }
        ] = await Promise.all([
            supabaseAdmin
                .from("orden_detalles")
                .select("orden_id, producto_nombre, cantidad, subtotal, precio_unitario")
                .in("orden_id", ordenIds),
            supabaseAdmin
                .from("pagos")
                .select(`
                    orden_id, 
                    metodo_pago, 
                    monto,
                    propinas(monto)
                `)
                .in("orden_id", ordenIds)
        ]);

        // CÁLCULOS PRINCIPALES
        const totalVentas = ordenes.reduce((sum, o) => sum + toNumber(o.total_final || o.total), 0);
        const totalPropinas = (pagos || []).reduce((sum, p) =>
            sum + (p.propinas || []).reduce((s, pr) => s + toNumber(pr.monto), 0), 0
        );
        const totalPedidos = ordenes.length;
        const promedioTicket = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
        const totalCostosDomicilio = ordenes.reduce((sum, o) => sum + toNumber(o.costo_domicilio), 0);

        // Ventas por tipo de orden
        const tipoMap = new Map();
        ordenes.forEach(o => {
            const tipo = o.tipo_orden;
            const actual = tipoMap.get(tipo) || { cantidad: 0, monto: 0 };
            actual.cantidad += 1;
            actual.monto += toNumber(o.total_final || o.total);
            tipoMap.set(tipo, actual);
        });
        const totalMontoTipos = Array.from(tipoMap.values()).reduce((s, t) => s + t.monto, 0);
        const ventasPorTipoOrden = Array.from(tipoMap.entries()).map(([tipo, datos]) => ({
            tipo,
            ...datos,
            porcentaje: totalMontoTipos > 0 ? (datos.monto / totalMontoTipos) * 100 : 0
        }));

        // Métodos de pago
        const metodosMap = new Map();
        (pagos || []).forEach(p => {
            const actual = metodosMap.get(p.metodo_pago) || { cantidad: 0, monto: 0 };
            actual.cantidad += 1;
            actual.monto += toNumber(p.monto);
            metodosMap.set(p.metodo_pago, actual);
        });
        const totalMontoMetodos = Array.from(metodosMap.values()).reduce((s, m) => s + m.monto, 0);
        const ventasPorMetodoPago = Array.from(metodosMap.entries()).map(([metodo, datos]) => ({
            metodo,
            ...datos,
            porcentaje: totalMontoMetodos > 0 ? (datos.monto / totalMontoMetodos) * 100 : 0
        }));

        // Estados
        const estadosMap = new Map();
        ordenes.forEach(o => {
            const count = estadosMap.get(o.estado) || 0;
            estadosMap.set(o.estado, count + 1);
        });
        const estadisticasEstados = Array.from(estadosMap.entries()).map(([estado, cantidad]) => ({
            estado,
            cantidad,
            porcentaje: (cantidad / totalPedidos) * 100
        }));

        // Top productos
        const productosMap = new Map();
        (detalles || []).forEach(d => {
            const actual = productosMap.get(d.producto_nombre) || { cantidad: 0, ingresos: 0 };
            actual.cantidad += d.cantidad;
            actual.ingresos += toNumber(d.subtotal);
            productosMap.set(d.producto_nombre, actual);
        });
        const topProductos = Array.from(productosMap.entries())
            .map(([nombre, datos]) => ({
                nombre,
                ...datos,
                precioPromedio: datos.cantidad > 0 ? datos.ingresos / datos.cantidad : 0
            }))
            .sort((a, b) => b.ingresos - a.ingresos)
            .slice(0, 10);

        // Ventas por usuario
        const usuariosMap = new Map();
        ordenes.forEach(o => {
            if (o.usuario_vendedor) {
                const id = o.usuario_vendedor.id;
                const actual = usuariosMap.get(id) || {
                    id,
                    nombre: o.usuario_vendedor.nombre || 'Sin nombre',
                    rol: o.usuario_vendedor.rol,
                    totalVentas: 0,
                    pedidos: 0,
                    propinasRecibidas: 0
                };
                actual.totalVentas += toNumber(o.total_final || o.total);
                actual.pedidos += 1;

                // Sumar propinas de esta orden
                const propinasOrden = (pagos || [])
                    .filter(p => p.orden_id === o.id)
                    .reduce((sum, p) => sum + (p.propinas || []).reduce((s, pr) => s + toNumber(pr.monto), 0), 0);
                actual.propinasRecibidas += propinasOrden;

                usuariosMap.set(id, actual);
            }
        });
        const ventasPorUsuario = Array.from(usuariosMap.values()).map(u => ({
            ...u,
            promedioTicket: u.pedidos > 0 ? u.totalVentas / u.pedidos : 0
        }));

        // Ventas por día
        const diasMap = new Map();
        ordenes.forEach(o => {
            const fecha = new Date(o.created_at).toISOString().split('T')[0];
            const actual = diasMap.get(fecha) || { ventas: 0, pedidos: 0 };
            actual.ventas += toNumber(o.total_final || o.total);
            actual.pedidos += 1;
            diasMap.set(fecha, actual);
        });
        const ventasPorDia = Array.from(diasMap.entries())
            .map(([fecha, datos]) => ({ fecha, ...datos }))
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        // Ventas por hora
        const horasMap = new Map();
        ordenes.forEach(o => {
            const hora = new Date(o.created_at).getHours();
            const actual = horasMap.get(hora) || { ventas: 0, pedidos: 0 };
            actual.ventas += toNumber(o.total_final || o.total);
            actual.pedidos += 1;
            horasMap.set(hora, actual);
        });
        const ventasPorHora = Array.from(horasMap.entries())
            .map(([hora, datos]) => ({ hora, ...datos }))
            .sort((a, b) => a.hora - b.hora);

        // Estadísticas de domicilio
        const domiciliosData = ordenes.filter(o => o.tipo_orden === 'domicilio');
        const domicilios = {
            total: domiciliosData.length,
            ingresosTotales: domiciliosData.reduce((s, o) => s + toNumber(o.total_final || o.total), 0),
            costoPromedio: domiciliosData.length > 0
                ? domiciliosData.reduce((s, o) => s + toNumber(o.costo_domicilio), 0) / domiciliosData.length
                : 0,
            distanciaPromedio: domiciliosData.length > 0
                ? domiciliosData.reduce((s, o) => s + toNumber(o.distancia_km), 0) / domiciliosData.length
                : 0
        };

        const datosSimplificados: ReporteDatosSimplificado = {
            totalVentas,
            totalPropinas,
            totalPedidos,
            promedioTicket,
            totalCostosDomicilio,
            ventasPorTipoOrden,
            ventasPorMetodoPago,
            estadisticasEstados,
            topProductos,
            ventasPorUsuario,
            ventasPorDia,
            ventasPorHora,
            domicilios
        };

        return {
            success: true,
            datos: datosSimplificados
        };

    } catch (error) {
        console.error("Error obteniendo reporte:", error);
        return {
            success: false,
            error: "No se pudo obtener el reporte",
            details: error instanceof Error ? error.message : String(error)
        };
    }
}