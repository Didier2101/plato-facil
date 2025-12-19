// src/modules/auth/actions/loginActions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import type { Rol } from '@/src/shared/types/rol';

export interface AuthUser {
    id: string;
    email: string;
    nombre?: string | null;
    rol: Rol;
    activo: boolean;
    created_at?: string;
}

export type LoginResult = {
    success: boolean;
    error?: string;
    user?: AuthUser;
};

export async function loginAction(formData: FormData): Promise<LoginResult> {
    try {
        const email = String(formData.get('email') ?? '').trim().toLowerCase();
        const password = String(formData.get('password') ?? '');

        // Validaciones básicas
        if (!email || !password) {
            return {
                success: false,
                error: 'Email y contraseña son requeridos',
            };
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

        // Autenticación
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            console.error('Auth error:', authError.message);

            if (authError.message.includes('Invalid login credentials')) {
                return {
                    success: false,
                    error: 'Credenciales incorrectas',
                };
            }

            if (authError.message.includes('Email not confirmed')) {
                return {
                    success: false,
                    error: 'Confirma tu email antes de iniciar sesión',
                };
            }

            return {
                success: false,
                error: 'Error al iniciar sesión. Intenta de nuevo.',
            };
        }

        if (!authData.user) {
            return {
                success: false,
                error: 'Usuario no encontrado',
            };
        }

        // Obtener información del usuario
        const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .select('id, email, nombre, rol, activo')
            .eq('id', authData.user.id)
            .single();

        if (usuarioError || !usuario) {
            console.error('User not found in database:', usuarioError);
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Usuario no registrado en el sistema',
            };
        }

        if (!usuario.activo) {
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Cuenta desactivada. Contacta al administrador.',
            };
        }

        const rolesValidos = Object.keys(APP_ROUTES.ROLE_DASHBOARDS) as Rol[];
        if (!rolesValidos.includes(usuario.rol as Rol)) {
            await supabase.auth.signOut();
            return {
                success: false,
                error: 'Rol de usuario no válido',
            };
        }

        return {
            success: true,
            user: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre ?? null,
                rol: usuario.rol as Rol,
                activo: usuario.activo,
            },
        };

    } catch (error) {
        console.error('Unexpected login error:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}

// Acción para logout
export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
    try {
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

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Error al cerrar sesión' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected logout error:', error);
        return { success: false, error: 'Error interno al cerrar sesión' };
    }
}