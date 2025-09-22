"use server";

import { supabase } from "@/src/lib/supabaseClient";
import type { LoginResult } from "@/src/types/auth";

function getErrorMessage(errorMessage: string): string {
    switch (errorMessage) {
        case "Invalid login credentials":
            return "Email o contraseña incorrectos";
        case "Email not confirmed":
            return "Por favor confirma tu email antes de iniciar sesión";
        case "Too many requests":
            return "Demasiados intentos. Espera un momento antes de intentar nuevamente";
        default:
            return "Error de autenticación. Verifica tus credenciales.";
    }
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        // autenticar con supabase
        const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

        if (authError) {
            return { success: false, error: getErrorMessage(authError.message) };
        }

        if (!authData.user) {
            return { success: false, error: "No se pudo autenticar el usuario" };
        }

        // buscar datos del usuario en la tabla `usuarios`
        const { data: usuarioData, error: rolError } = await supabase
            .from("usuarios")
            .select("rol, nombre, email")
            .eq("id", authData.user.id)
            .single();

        if (rolError || !usuarioData) {
            return {
                success: false,
                error:
                    "Tu cuenta fue autenticada pero necesita configuración. Contacta al administrador.",
            };
        }

        return {
            success: true,
            rol: usuarioData.rol as LoginResult["rol"],
            user: {
                id: authData.user.id,
                email: usuarioData.email ?? authData.user.email ?? "",
                nombre: usuarioData.nombre ?? null,
            },
        };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Error inesperado. Intenta nuevamente." };
    }
}
