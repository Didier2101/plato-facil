// src/actions/obtenerOrdenesListasAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";

export async function obtenerOrdenesListasAction() {
    try {
        const { data: ordenes, error } = await supabaseAdmin
            .from("ordenes")
            .select(`
                *,
                orden_detalles (
                    *,
                    orden_personalizaciones (
                        ingrediente_id,
                        ingrediente_nombre,
                        incluido,
                        obligatorio
                    )
                )
            `)
            .eq("estado", "lista") // Solo órdenes en estado 'lista' (preparadas, listas para cobro)
            .order("created_at", { ascending: true }); // Más antiguas primero (FIFO)

        if (error) {
            console.error("Error obteniendo órdenes listas:", error);
            return {
                success: false,
                error: `Error al obtener órdenes: ${error.message}`
            };
        }

        return {
            success: true,
            ordenes: ordenes as OrdenCompleta[]
        };

    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}