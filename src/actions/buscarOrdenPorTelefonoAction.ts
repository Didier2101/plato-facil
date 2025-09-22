"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface BuscarOrdenSimpleParams {
    telefono: string;
}

interface CancelarOrdenParams {
    ordenId: string;
    motivo?: string;
}

interface ProductoOrden {
    nombre: string;
    cantidad: number;
    personalizaciones?: string[];
}

interface OrdenEncontrada {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: 'orden_tomada' | 'lista' | 'entregada' | 'cancelada';
    tipo_orden: 'establecimiento' | 'domicilio';
    created_at: string;
    updated_at: string;
    productos: ProductoOrden[];
    puede_cancelar: boolean;
}

// Función para limpiar número de teléfono (quitar espacios, guiones, etc.)
function limpiarTelefono(telefono: string): string {
    return telefono.replace(/\D/g, '');
}

export async function buscarOrdenPorTelefonoAction(params: BuscarOrdenSimpleParams) {
    try {
        const { telefono } = params;

        if (!telefono?.trim()) {
            return {
                success: false,
                error: "El teléfono es requerido"
            };
        }

        const telefonoLimpio = limpiarTelefono(telefono);

        // Buscar la orden más reciente por teléfono
        const { data: ordenes, error } = await supabaseAdmin
            .from("ordenes")
            .select(`
                id,
                cliente_nombre,
                cliente_telefono,
                cliente_direccion,
                total,
                estado,
                tipo_orden,
                created_at,
                updated_at,
                orden_detalles(
                    producto_nombre,
                    cantidad,
                    notas_personalizacion,
                    orden_personalizaciones(
                        ingrediente_nombre,
                        incluido,
                        obligatorio
                    )
                )
            `)
            .or(`cliente_telefono.eq.${telefono},cliente_telefono.eq.${telefonoLimpio}`)
            .order('created_at', { ascending: false })
            .limit(1); // Solo la más reciente

        if (error) {
            console.error("Error buscando órdenes:", error);
            return {
                success: false,
                error: "Error al buscar la orden"
            };
        }

        if (!ordenes || ordenes.length === 0) {
            return {
                success: false,
                error: "No se encontró ninguna orden con ese teléfono"
            };
        }

        const orden = ordenes[0]; // La más reciente

        // Procesar productos con personalizaciones
        const productos: ProductoOrden[] = orden.orden_detalles?.map(detalle => {
            const ingredientesExcluidos = detalle.orden_personalizaciones
                ?.filter(pers => !pers.incluido && !pers.obligatorio)
                .map(pers => `Sin ${pers.ingrediente_nombre}`) || [];

            const personalizaciones = [
                ...ingredientesExcluidos,
                ...(detalle.notas_personalizacion ? [detalle.notas_personalizacion] : [])
            ];

            return {
                nombre: detalle.producto_nombre,
                cantidad: detalle.cantidad,
                personalizaciones: personalizaciones.length > 0 ? personalizaciones : undefined
            };
        }) || [];

        // Determinar si se puede cancelar (orden_tomada y menos de 15 minutos)
        const ahora = new Date();
        const fechaCreacion = new Date(orden.created_at);
        const minutosTranscurridos = (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60);
        const puedeCancel = orden.estado === 'orden_tomada' && minutosTranscurridos <= 15;

        const ordenProcessed: OrdenEncontrada = {
            id: orden.id,
            cliente_nombre: orden.cliente_nombre,
            cliente_telefono: orden.cliente_telefono,
            cliente_direccion: orden.cliente_direccion,
            total: Number(orden.total),
            estado: orden.estado,
            tipo_orden: orden.tipo_orden,
            created_at: orden.created_at,
            updated_at: orden.updated_at,
            productos,
            puede_cancelar: puedeCancel
        };

        return {
            success: true,
            orden: ordenProcessed
        };

    } catch (error) {
        console.error("Error en buscarOrdenPorTelefonoAction:", error);
        return {
            success: false,
            error: "Error inesperado al buscar la orden"
        };
    }
}

export async function cancelarOrdenAction(params: CancelarOrdenParams) {
    try {
        const { ordenId, motivo } = params;

        if (!ordenId?.trim()) {
            return {
                success: false,
                error: "El ID de la orden es requerido"
            };
        }

        // Verificar que la orden existe y se puede cancelar
        const { data: ordenActual, error: errorBuscar } = await supabaseAdmin
            .from("ordenes")
            .select("id, estado, created_at, cliente_nombre")
            .eq("id", ordenId.trim())
            .single();

        if (errorBuscar || !ordenActual) {
            return {
                success: false,
                error: "No se encontró la orden especificada"
            };
        }

        if (ordenActual.estado !== 'orden_tomada') {
            const estadoTexto = {
                'lista': 'ya está lista',
                'entregada': 'ya fue entregada',
                'cancelada': 'ya está cancelada'
            };

            return {
                success: false,
                error: `No se puede cancelar esta orden porque ${estadoTexto[ordenActual.estado as keyof typeof estadoTexto] || 'no está disponible'}`
            };
        }

        // Verificar límite de tiempo (15 minutos)
        const ahora = new Date();
        const fechaCreacion = new Date(ordenActual.created_at);
        const minutosTranscurridos = (ahora.getTime() - fechaCreacion.getTime()) / (1000 * 60);

        if (minutosTranscurridos > 15) {
            return {
                success: false,
                error: "Solo puedes cancelar órdenes dentro de los primeros 15 minutos"
            };
        }

        // Cancelar la orden
        const { error: errorActualizar } = await supabaseAdmin
            .from("ordenes")
            .update({
                estado: 'cancelada',
                updated_at: new Date().toISOString()
            })
            .eq("id", ordenId.trim());

        if (errorActualizar) {
            console.error("Error cancelando orden:", errorActualizar);
            return {
                success: false,
                error: "Error al cancelar la orden"
            };
        }

        // Registrar en historial
        await supabaseAdmin
            .from("orden_historial")
            .insert({
                orden_id: ordenId.trim(),
                estado_anterior: 'orden_tomada',
                estado_nuevo: 'cancelada',
                usuario_id: '00000000-0000-0000-0000-000000000000',
                notas: motivo ? `Cancelada por el cliente: ${motivo}` : 'Cancelada por el cliente'
            });

        return {
            success: true,
            message: "La orden ha sido cancelada exitosamente"
        };

    } catch (error) {
        console.error("Error en cancelarOrdenAction:", error);
        return {
            success: false,
            error: "Error inesperado al cancelar la orden"
        };
    }
}