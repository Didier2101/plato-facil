// src/actions/crearOrdenAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Ingrediente personalizado
interface IngredientePersonalizado {
    ingrediente_id: string;
    nombre: string;
    incluido: boolean;
    obligatorio: boolean;
}

// Producto con personalización expandida
interface ProductoOrden {
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    ingredientes_personalizados?: IngredientePersonalizado[];
    notas?: string;
    personalizacion_id?: string;
}

interface DatosCliente {
    nombre: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
}

// Datos de domicilio
interface DatosDomicilio {
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    direccion_formateada?: string;
}

interface OrdenData {
    cliente: DatosCliente;
    productos: ProductoOrden[];
    total: number;
    estado: string;
    tipo_orden: "establecimiento" | "domicilio";
    domicilio?: DatosDomicilio;
    metodo_pago?: "efectivo" | "tarjeta" | "transferencia";
    monto_entregado?: number;
}

export async function crearOrdenAction(ordenData: OrdenData) {
    try {
        // Validar domicilio si es necesario
        if (ordenData.tipo_orden === "domicilio") {
            if (!ordenData.domicilio) {
                return {
                    success: false,
                    error: "Debe calcular el costo de domicilio antes de crear la orden"
                };
            }

            if (!ordenData.cliente.direccion?.trim()) {
                return {
                    success: false,
                    error: "La dirección es requerida para pedidos a domicilio"
                };
            }

            // Verificar que el domicilio esté activo
            const { data: config } = await supabaseAdmin
                .from('configuracion_restaurante')
                .select('domicilio_activo')
                .single();

            if (!config?.domicilio_activo) {
                return {
                    success: false,
                    error: "El servicio de domicilio está desactivado actualmente"
                };
            }
        }

        // Calcular total final incluyendo domicilio
        const totalFinal = ordenData.total + (ordenData.domicilio?.costo_domicilio || 0);

        // ✅ SOLO UNA inserción de la orden - guardar método de pago como referencia
        const { data: orden, error: ordenError } = await supabaseAdmin
            .from("ordenes")
            .insert({
                cliente_nombre: ordenData.cliente.nombre,
                cliente_telefono: ordenData.cliente.telefono || null,
                cliente_direccion: ordenData.tipo_orden === "domicilio"
                    ? (ordenData.domicilio?.direccion_formateada || ordenData.cliente.direccion)
                    : "En establecimiento",
                cliente_notas: ordenData.cliente.notas || null,
                total: totalFinal,
                estado: ordenData.estado,
                tipo_orden: ordenData.tipo_orden,
                // ✅ Solo guardar método de pago como referencia, sin crear registro de pago
                metodo_pago: ordenData.metodo_pago || null,
                monto_entregado: ordenData.monto_entregado || null,
                costo_domicilio: ordenData.domicilio?.costo_domicilio || 0,
                distancia_km: ordenData.domicilio?.distancia_km || null,
                duracion_estimada: ordenData.domicilio?.duracion_estimada || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (ordenError) {
            console.error("Error creando orden:", ordenError);
            return {
                success: false,
                error: `Error al crear la orden: ${ordenError.message}`
            };
        }

        // Crear los detalles de la orden (incluyendo notas de personalización)
        const detallesOrden = ordenData.productos.map(producto => ({
            orden_id: orden.id,
            producto_id: producto.producto_id,
            producto_nombre: producto.nombre,
            precio_unitario: producto.precio,
            cantidad: producto.cantidad,
            subtotal: producto.subtotal,
            notas_personalizacion: producto.notas || null
        }));

        const { data: detallesCreados, error: detallesError } = await supabaseAdmin
            .from("orden_detalles")
            .insert(detallesOrden)
            .select();

        if (detallesError) {
            console.error("Error creando detalles de orden:", detallesError);
            // Rollback - eliminar la orden creada
            await supabaseAdmin.from("ordenes").delete().eq("id", orden.id);
            return {
                success: false,
                error: `Error al crear los detalles de la orden: ${detallesError.message}`
            };
        }

        // Crear registros de personalización SOLO para ingredientes EXCLUIDOS
        interface PersonalizacionIngrediente {
            orden_detalle_id: string;
            ingrediente_id: string;
            ingrediente_nombre: string;
            incluido: boolean;
            obligatorio: boolean;
        }
        const personalizacionesData: PersonalizacionIngrediente[] = [];

        ordenData.productos.forEach((producto, index) => {
            if (producto.ingredientes_personalizados && producto.ingredientes_personalizados.length > 0) {
                const ordenDetalleId = detallesCreados[index].id;

                // SOLO GUARDAR INGREDIENTES EXCLUIDOS (incluido = false y no obligatorios)
                producto.ingredientes_personalizados
                    .filter(ingrediente => !ingrediente.incluido && !ingrediente.obligatorio)
                    .forEach(ingrediente => {
                        personalizacionesData.push({
                            orden_detalle_id: ordenDetalleId,
                            ingrediente_id: ingrediente.ingrediente_id,
                            ingrediente_nombre: ingrediente.nombre,
                            incluido: false, // Siempre false para ingredientes excluidos
                            obligatorio: ingrediente.obligatorio
                        });
                    });
            }
        });

        // Insertar personalizaciones si existen
        if (personalizacionesData.length > 0) {
            const { error: personalizacionError } = await supabaseAdmin
                .from("orden_personalizaciones")
                .insert(personalizacionesData);

            if (personalizacionError) {
                console.error("Error creando personalizaciones:", personalizacionError);

                // Rollback completo
                await supabaseAdmin.from("orden_detalles").delete().eq("orden_id", orden.id);
                await supabaseAdmin.from("ordenes").delete().eq("id", orden.id);

                return {
                    success: false,
                    error: `Error al guardar personalización de ingredientes: ${personalizacionError.message}`
                };
            }
        }

        return {
            success: true,
            orden: {
                id: orden.id,
                total: orden.total,
                total_productos: ordenData.total,
                costo_domicilio: ordenData.domicilio?.costo_domicilio || 0,
                distancia_km: ordenData.domicilio?.distancia_km,
                estado: orden.estado,
                tipo_orden: orden.tipo_orden,
                created_at: orden.created_at,
                productos_personalizados: personalizacionesData.length,
                // Información adicional útil
                metodo_pago: ordenData.metodo_pago,
                cambio_a_devolver: ordenData.metodo_pago === "efectivo" && ordenData.monto_entregado
                    ? ordenData.monto_entregado - totalFinal
                    : null
            }
        };

    } catch (error) {
        console.error("Error inesperado creando orden:", error);
        return {
            success: false,
            error: "Error interno del servidor al crear la orden"
        };
    }
}