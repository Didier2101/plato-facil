// src/actions/eliminarOrdenAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function eliminarOrdenAction(ordenId: string) {
    try {
        // Verificar que la orden existe y está en estado orden_tomada
        const { data: ordenExistente, error: verificacionError } = await supabaseAdmin
            .from("ordenes")
            .select("id, estado, cliente_nombre")
            .eq("id", ordenId)
            .eq("estado", "orden_tomada")
            .single();

        if (verificacionError || !ordenExistente) {
            return {
                success: false,
                error: "No se encontró la orden o ya fue procesada"
            };
        }

        // Eliminar en orden correcto debido a las foreign keys

        // 1. Eliminar personalizaciones de ingredientes
        const { error: personalizacionesError } = await supabaseAdmin
            .from("orden_personalizaciones")
            .delete()
            .in("orden_detalle_id",
                // Subquery para obtener los IDs de orden_detalles
                await supabaseAdmin
                    .from("orden_detalles")
                    .select("id")
                    .eq("orden_id", ordenId)
                    .then(result => result.data?.map(d => d.id) || [])
            );

        if (personalizacionesError) {
            console.error("Error eliminando personalizaciones:", personalizacionesError);
            return {
                success: false,
                error: "Error al eliminar personalizaciones de la orden"
            };
        }

        // 2. Eliminar historial de orden
        const { error: historialError } = await supabaseAdmin
            .from("orden_historial")
            .delete()
            .eq("orden_id", ordenId);

        if (historialError) {
            console.error("Error eliminando historial:", historialError);
            // No fallar por esto, continuar
        }

        // 3. Eliminar pagos y propinas si existen
        const { error: propinasError } = await supabaseAdmin
            .from("propinas")
            .delete()
            .in("pago_id",
                await supabaseAdmin
                    .from("pagos")
                    .select("id")
                    .eq("orden_id", ordenId)
                    .then(result => result.data?.map(p => p.id) || [])
            );

        if (propinasError) {
            console.error("Error eliminando propinas:", propinasError);
            // No fallar por esto, continuar
        }

        const { error: pagosError } = await supabaseAdmin
            .from("pagos")
            .delete()
            .eq("orden_id", ordenId);

        if (pagosError) {
            console.error("Error eliminando pagos:", pagosError);
            // No fallar por esto, continuar
        }

        // 4. Eliminar detalles de orden
        const { error: detallesError } = await supabaseAdmin
            .from("orden_detalles")
            .delete()
            .eq("orden_id", ordenId);

        if (detallesError) {
            console.error("Error eliminando detalles de orden:", detallesError);
            return {
                success: false,
                error: "Error al eliminar detalles de la orden"
            };
        }

        // 5. Finalmente, eliminar la orden principal
        const { error: ordenError } = await supabaseAdmin
            .from("ordenes")
            .delete()
            .eq("id", ordenId);

        if (ordenError) {
            console.error("Error eliminando orden:", ordenError);
            return {
                success: false,
                error: "Error al eliminar la orden principal"
            };
        }

        return {
            success: true,
            message: `Orden #${ordenId.slice(-6)} eliminada completamente`
        };

    } catch (error) {
        console.error("Error inesperado eliminando orden:", error);
        return {
            success: false,
            error: "Error interno del servidor al eliminar la orden"
        };
    }
}