// src/actions/login/actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { APP_ROUTES, UserRole } from '@/src/constants/app-routes';


export type LoginResult = {
    success: boolean;
    error?: string;
    user?: {
        id: string;
        email: string;
        nombre?: string | null;
        rol: UserRole;
    };
};

export async function loginAction(formData: FormData): Promise<LoginResult> {
    try {
        const email = String(formData.get('email') ?? '').trim().toLowerCase();
        const password = String(formData.get('password') ?? '');

        // Validación básica
        if (!email || !password) {
            return {
                success: false,
                error: 'Email y contraseña son requeridos',
            };
        }

        // Validación de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                error: 'Formato de email inválido',
            };
        }

        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch (error) {
                            console.error('Error setting cookies:', error);
                        }
                    },
                },
            }
        );

        // Intentar autenticación
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('Error de autenticación:', {
                code: authError.code,
                message: authError.message,
                status: authError.status,
            });

            if (
                authError.message.includes('Invalid login credentials') ||
                authError.code === 'invalid_credentials'
            ) {
                return {
                    success: false,
                    error: 'Correo electrónico o contraseña incorrectos',
                };
            }

            if (authError.message.includes('banned') || authError.code === 'user_banned') {
                return {
                    success: false,
                    error: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
                };
            }

            return {
                success: false,
                error: 'Error al iniciar sesión. Por favor, intenta de nuevo.',
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'No se pudo obtener información del usuario',
            };
        }

        // Obtener información adicional del usuario
        const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id, email, nombre, rol, activo')
            .eq('id', authData.user.id)
            .single();

        if (usuarioError || !usuario) {
            console.error('Error obteniendo usuario:', usuarioError);
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Usuario no encontrado en el sistema',
            };
        }

        // Validar que el usuario esté activo
        if (!usuario.activo) {
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Tu cuenta está desactivada. Contacta al administrador.',
            };
        }

        // Validar que el rol sea válido
        const rolesValidos = Object.keys(APP_ROUTES.ROLE_DASHBOARDS) as UserRole[];
        if (!rolesValidos.includes(usuario.rol as UserRole)) {
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Tu cuenta no tiene un rol válido asignado',
            };
        }

        // Retornar éxito
        return {
            success: true,
            user: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre ?? null,
                rol: usuario.rol as UserRole,
            },
        };

    } catch (error) {
        console.error('Error inesperado en loginAction:', error);
        return {
            success: false,
            error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        };
    }
}