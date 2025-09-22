"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function crearUsuarioAction(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const nombre = formData.get("nombre") as string;
        const rol = formData.get("rol") as string;

        // Validaciones básicas
        if (!email || !password || !nombre || !rol) {
            return { success: false, error: "Todos los campos son requeridos" };
        }

        if (password.length < 6) {
            return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
        }

        // Verificar si el email ya existe en Auth (más confiable)
        // Intentamos crear el usuario y manejamos el error específico

        // 1️⃣ Crear usuario en Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                nombre,
                rol
            }
        });

        if (authError || !authUser.user) {
            console.error("Error en Auth:", authError);

            // Manejar error específico de email duplicado
            if (authError?.code === 'email_exists' || authError?.message?.includes('already been registered')) {
                return {
                    success: false,
                    error: "Ya existe un usuario registrado con este email"
                };
            }

            return {
                success: false,
                error: authError?.message || "Error al crear usuario en Auth"
            };
        }

        // 2️⃣ Insertar en tabla `usuarios`
        const { error: dbError } = await supabaseAdmin.from("usuarios").insert([
            {
                id: authUser.user.id,
                nombre,
                email,
                rol,
                created_at: new Date().toISOString(),
            },
        ]);

        if (dbError) {
            console.error("Error en DB:", dbError);

            // Si falla la inserción en la tabla, eliminar el usuario de Auth
            try {
                await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            } catch (cleanupError) {
                console.error("Error al limpiar usuario de Auth:", cleanupError);
            }

            return {
                success: false,
                error: `Error en base de datos: ${dbError.message}`
            };
        }

        return {
            success: true,
            user: {
                id: authUser.user.id,
                nombre,
                email,
                rol,
                created_at: new Date().toISOString()
            },
        };

    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}