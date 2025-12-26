"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { actualizarEstadoOrdenAction } from "@/src/modules/admin/ordenes/actions/actualizarEstadoOrdenAction";

interface TomarOrdenParams {
    ordenId: string;
    usuarioId: string;
}

export async function tomarOrdenAction({ ordenId, usuarioId }: TomarOrdenParams) {
    try {
        if (!ordenId || !usuarioId) {
            return { success: false, error: "Faltan datos requeridos (ordenId o usuarioId)" };
        }

        // 1. Actualizar la orden con el usuario_entregador_id y cambiar estado a 'en_camino'
        const { error: updateError } = await supabaseAdmin
            .from("ordenes")
            .update({
                usuario_entregador_id: usuarioId,
                estado: "en_camino",
                updated_at: new Date().toISOString()
            })
            .eq("id", ordenId);

        if (updateError) {
            console.error("Error al asignar repartidor:", updateError);
            return { success: false, error: `Error al tomar la orden: ${updateError.message}` };
        }

        // 2. Registrar en historial (reutilizando la lógica si es posible, o manual)
        try {
            await supabaseAdmin
                .from("orden_historial")
                .insert({
                    orden_id: ordenId,
                    estado_anterior: "lista",
                    estado_nuevo: "en_camino",
                    usuario_id: usuarioId,
                    notas: "Orden tomada por el repartidor"
                });
        } catch (hError) {
            console.warn("No se pudo guardar el historial:", hError);
        }

        return { success: true, message: "Orden tomada exitosamente" };

    } catch (error) {
        console.error("Error inesperado en tomarOrdenAction:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
