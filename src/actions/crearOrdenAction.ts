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
    // NUEVO: datos de personalización
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

interface OrdenData {
    cliente: DatosCliente;
    productos: ProductoOrden[];
    total: number;
    estado: string;
    tipo_orden: "establecimiento" | "domicilio";
}

export async function crearOrdenAction(ordenData: OrdenData) {
    try {
        // Iniciar inserción de la orden
        const { data: orden, error: ordenError } = await supabaseAdmin
            .from("ordenes")
            .insert({
                cliente_nombre: ordenData.cliente.nombre,
                cliente_telefono: ordenData.cliente.telefono || null,
                cliente_direccion: ordenData.tipo_orden === "domicilio"
                    ? ordenData.cliente.direccion || null
                    : "En establecimiento",
                cliente_notas: ordenData.cliente.notas || null,
                total: ordenData.total,
                estado: ordenData.estado,
                tipo_orden: ordenData.tipo_orden,
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
            notas_personalizacion: producto.notas || null // NUEVO: notas específicas del producto
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

        // CORREGIDO: Crear registros de personalización SOLO para ingredientes EXCLUIDOS
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
                estado: orden.estado,
                tipo_orden: orden.tipo_orden,
                created_at: orden.created_at,
                productos_personalizados: personalizacionesData.length // Info adicional
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