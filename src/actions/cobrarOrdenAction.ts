"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function cobrarOrdenAction(
    ordenId: string,
    usuarioId: string,
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
) {
    try {
        // Obtener datos de la orden
        const { data: orden, error: errorOrden } = await supabaseAdmin
            .from("ordenes")
            .select("total, estado, usuario_entregador_id, tipo_orden")
            .eq("id", ordenId)
            .single();

        if (errorOrden || !orden) {
            console.error("Error obteniendo orden:", errorOrden);
            return {
                success: false,
                error: "Orden no encontrada"
            };
        }

        // Verificar que la orden esté en el estado correcto según el tipo
        if (orden.tipo_orden === 'domicilio') {
            // Para órdenes de domicilio, debe estar en 'llegue_a_destino'
            if (orden.estado !== 'llegue_a_destino') {
                return {
                    success: false,
                    error: `Las órdenes de domicilio deben estar en estado "llegue_a_destino" para ser cobradas. Estado actual: ${orden.estado}`
                };
            }
        } else if (orden.tipo_orden === 'establecimiento') {
            // Para órdenes de establecimiento, debe estar en 'lista'
            if (orden.estado !== 'lista') {
                return {
                    success: false,
                    error: `Las órdenes de establecimiento deben estar en estado "lista" para ser cobradas. Estado actual: ${orden.estado}`
                };
            }
        } else {
            return {
                success: false,
                error: "Tipo de orden no válido"
            };
        }

        // Crear el registro de pago
        const { data: pagoData, error: errorPago } = await supabaseAdmin
            .from("pagos")
            .insert({
                orden_id: ordenId,
                usuario_id: usuarioId,
                metodo_pago: metodoPago,
                monto: orden.total,
                created_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (errorPago) {
            console.error("Error creando pago:", errorPago);
            return {
                success: false,
                error: "Error al registrar el pago"
            };
        }

        // Actualizar el estado de la orden a 'entregada'
        const { error: errorActualizar } = await supabaseAdmin
            .from("ordenes")
            .update({
                estado: 'entregada',
                metodo_pago: metodoPago,
                fecha_entrega: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                usuario_entregador_id: usuarioId // Asegurar que el entregador esté registrado
            })
            .eq("id", ordenId);

        if (errorActualizar) {
            console.error("Error actualizando orden:", errorActualizar);
            return {
                success: false,
                error: "Error al actualizar el estado de la orden"
            };
        }

        // Registrar en el historial
        const estadoAnterior = orden.tipo_orden === 'domicilio' ? 'llegue_a_destino' : 'lista';
        await supabaseAdmin
            .from("orden_historial")
            .insert({
                orden_id: ordenId,
                estado_anterior: estadoAnterior,
                estado_nuevo: 'entregada',
                usuario_id: usuarioId,
                notas: `Orden cobrada y entregada. Método de pago: ${metodoPago}. Monto: ${Number(orden.total).toLocaleString('es-CO')} (${orden.tipo_orden})`,
                created_at: new Date().toISOString()
            });

        return {
            success: true,
            pagoId: pagoData.id,
            message: "Orden cobrada y entregada exitosamente"
        };

    } catch (error) {
        console.error("Error procesando cobro:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error interno al procesar el cobro'
        };
    }
}