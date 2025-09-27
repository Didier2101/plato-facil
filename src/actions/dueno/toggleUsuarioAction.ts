"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function toggleUsuarioAction(id: string, activo: boolean) {
    try {
        // Validaciones básicas
        if (!id) {
            return { success: false, error: "ID de usuario es requerido" };
        }

        // 1️⃣ Actualizar en la tabla usuarios
        const { error: dbError } = await supabaseAdmin
            .from("usuarios")
            .update({
                activo,
                updated_at: new Date().toISOString()
            })
            .eq("id", id);

        if (dbError) {
            console.error("Error actualizando estado del usuario:", dbError);
            return {
                success: false,
                error: `Error al actualizar estado: ${dbError.message}`
            };
        }

        // 2️⃣ Actualizar en Auth si es necesario (desactivar/activar usuario)
        try {
            if (activo) {
                // Activar usuario en Auth
                await supabaseAdmin.auth.admin.updateUserById(id, {
                    ban_duration: "none" // Quitar restricción
                });
            } else {
                // Desactivar usuario en Auth (opcional: agregar restricción)
                await supabaseAdmin.auth.admin.updateUserById(id, {
                    ban_duration: "24h" // O usar otro método de desactivación
                });
            }
        } catch (authError) {
            console.warn("No se pudo actualizar en Auth:", authError);
            // No fallar la operación si la actualización en Auth falla
        }

        return {
            success: true,
            id,
            activo
        };

    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}