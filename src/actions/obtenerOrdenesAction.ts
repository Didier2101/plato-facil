// src/actions/obtenerOrdenesAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import type { OrdenCompleta } from "@/src/types/orden";

export async function obtenerOrdenesAction() {
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
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error obteniendo órdenes:", error);
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