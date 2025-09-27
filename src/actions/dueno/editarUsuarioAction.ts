"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function editarUsuarioAction(formData: FormData) {
    try {
        const id = formData.get("id") as string;
        const nombre = formData.get("nombre") as string;
        const email = formData.get("email") as string;
        const rol = formData.get("rol") as string;

        if (!id || !nombre || !email || !rol) {
            return { success: false, error: "Todos los campos son requeridos" };
        }

        // 1️⃣ Actualizar en la tabla usuarios
        const { error: dbError } = await supabaseAdmin
            .from("usuarios")
            .update({
                nombre,
                email,
                rol,
                updated_at: new Date().toISOString()
            })
            .eq("id", id);

        if (dbError) {
            console.error("Error actualizando usuario:", dbError);
            return {
                success: false,
                error: `Error al actualizar usuario: ${dbError.message}`
            };
        }

        // 2️⃣ Actualizar email en Auth si es necesario
        try {
            await supabaseAdmin.auth.admin.updateUserById(id, {
                email,
                user_metadata: { nombre, rol }
            });
        } catch (authError: unknown) {
            if (authError instanceof Error) {
                console.warn("No se pudo actualizar en Auth:", authError.message);
            } else {
                console.warn("No se pudo actualizar en Auth:", authError);
            }
        }

        return {
            success: true,
            user: { id, nombre, email, rol }
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error inesperado:", error.message);
        } else {
            console.error("Error inesperado:", error);
        }
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}
