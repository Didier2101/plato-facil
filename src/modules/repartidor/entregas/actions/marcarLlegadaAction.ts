"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface MarcarLlegadaParams {
    ordenId: string;
    usuarioId: string;
}

export async function marcarLlegadaAction({ ordenId, usuarioId }: MarcarLlegadaParams) {
    try {
        if (!ordenId || !usuarioId) {
            return { success: false, error: "Faltan datos requeridos" };
        }

        const { error: updateError } = await supabaseAdmin
            .from("ordenes")
            .update({
                estado: "llegue_a_destino",
                updated_at: new Date().toISOString()
            })
            .eq("id", ordenId);

        if (updateError) {
            console.error("Error al marcar llegada:", updateError);
            return { success: false, error: `Error: ${updateError.message}` };
        }

        try {
            await supabaseAdmin
                .from("orden_historial")
                .insert({
                    orden_id: ordenId,
                    estado_anterior: "en_camino",
                    estado_nuevo: "llegue_a_destino",
                    usuario_id: usuarioId,
                    notas: "Repartidor llegó a destino"
                });
        } catch (hError) {
            console.warn("No se pudo guardar el historial:", hError);
        }

        return { success: true, message: "Llegada marcada exitosamente" };

    } catch (error) {
        console.error("Error inesperado en marcarLlegadaAction:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
