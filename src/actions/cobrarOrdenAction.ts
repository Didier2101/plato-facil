"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function cobrarOrdenAction(
    ordenId: string,
    usuarioId: string,
    metodoPago: "efectivo" | "tarjeta" | "transferencia"
) {
    try {
        // Verificar que la orden existe y está en estado "lista"
        const { data: orden, error: ordenError } = await supabaseAdmin
            .from("ordenes")
            .select("id, total, estado")
            .eq("id", ordenId)
            .eq("estado", "lista")
            .single();

        if (ordenError || !orden) {
            return {
                success: false,
                error: "Orden no encontrada o no está lista para cobrar"
            };
        }

        // Verificar que no existe ya un pago para esta orden
        const { data: pagoExistente } = await supabaseAdmin
            .from("pagos")
            .select("id")
            .eq("orden_id", ordenId)
            .single();

        if (pagoExistente) {
            return {
                success: false,
                error: "Esta orden ya fue cobrada"
            };
        }

        // Insertar pago (aquí se registra quién hizo el cobro)
        const { data: pago, error: pagoError } = await supabaseAdmin
            .from("pagos")
            .insert({
                orden_id: ordenId,
                usuario_id: usuarioId, // Registro de quién cobró
                metodo_pago: metodoPago,
                monto: orden.total,
            })
            .select("id")
            .single();

        if (pagoError || !pago) {
            console.error("Error al registrar pago:", pagoError);
            return {
                success: false,
                error: "No se pudo registrar el pago",
                details: pagoError?.message
            };
        }

        // Actualizar estado de la orden a entregada
        const { error: updateError } = await supabaseAdmin
            .from("ordenes")
            .update({
                estado: "entregada",
                fecha_entrega: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("id", ordenId);

        if (updateError) {
            console.error("Error actualizando orden:", updateError);
            return {
                success: false,
                error: "No se pudo actualizar el estado de la orden",
                details: updateError.message
            };
        }

        // Registrar en el historial para trazabilidad completa
        await supabaseAdmin
            .from("orden_historial")
            .insert({
                orden_id: ordenId,
                estado_anterior: "lista",
                estado_nuevo: "entregada",
                usuario_id: usuarioId,
                notas: `Orden cobrada - Método: ${metodoPago}`
            });

        return {
            success: true,
            pagoId: pago.id,
            total: orden.total
        };

    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor",
            details: error instanceof Error ? error.message : String(error)
        };
    }
}