// src/actions/login/actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return {
            success: false,
            error: 'Email y contraseña son requeridos'
        };
    }

    try {
        // ✅ PASO 1: Await cookies()
        const cookieStore = await cookies();

        // ✅ PASO 2: Crear cliente de Supabase con @supabase/ssr
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

        // ✅ PASO 3: Hacer login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // ✅ Manejo específico de errores de autenticación
        if (authError) {
            console.error('Error de autenticación:', authError);

            // Detectar si el usuario está baneado
            if (authError.message.includes('banned') || authError.code === 'user_banned') {
                return {
                    success: false,
                    error: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.'
                };
            }

            // Detectar credenciales inválidas
            if (authError.message.includes('Invalid login credentials')) {
                return {
                    success: false,
                    error: 'Correo electrónico o contraseña incorrectos'
                };
            }

            // Error genérico
            return {
                success: false,
                error: 'Error al iniciar sesión. Intenta de nuevo.'
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'No se pudo obtener información del usuario'
            };
        }

        // ✅ PASO 4: Obtener datos del usuario desde la tabla usuarios
        const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id, email, nombre, rol, activo')
            .eq('id', authData.user.id)
            .single();

        if (usuarioError || !usuario) {
            console.error('Error obteniendo usuario:', usuarioError);

            // Cerrar sesión si no se encuentra el usuario
            await supabase.auth.signOut();

            return {
                success: false,
                error: 'Usuario no encontrado en el sistema'
            };
        }

        // ✅ PASO 5: Verificar si el usuario está activo en la base de datos
        if (!usuario.activo) {
            // Cerrar sesión de Supabase Auth
            await supabase.auth.signOut();

            return {
                success: false,
                error: 'Tu cuenta está desactivada. Contacta al administrador del sistema.'
            };
        }

        // ✅ PASO 6: Validar que tenga un rol válido
        const rolesValidos = ['dueno', 'admin', 'repartidor'];
        if (!rolesValidos.includes(usuario.rol)) {
            await supabase.auth.signOut();

            return {
                success: false,
                error: 'Tu cuenta no tiene un rol válido asignado'
            };
        }

        // ✅ PASO 7: Devolver datos del usuario autenticado
        return {
            success: true,
            user: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
            },
            rol: usuario.rol
        };

    } catch (error) {
        console.error('Error inesperado en login:', error);
        return {
            success: false,
            error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
        };
    }
}

// ✅ NUEVA FUNCIÓN: Login con redirect automático
export async function loginWithRedirect(formData: FormData) {
    const result = await loginAction(formData);

    if (!result.success) {
        return result;
    }

    // Hacer redirect en el servidor según el rol
    const { redirect } = await import('next/navigation');

    switch (result.rol) {
        case "dueno":
            redirect("/dueno/reportes");
        case "admin":
            redirect("/admin/caja");
        case "repartidor":
            redirect("/repartidor/ordenes-listas");
        default:
            return {
                success: false,
                error: `Rol no reconocido: ${result.rol}`
            };
    }
}