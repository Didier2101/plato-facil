// src/actions/auth/logoutAction.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export async function logoutAction() {
    try {
        // ✅ PASO 1: Await cookies()
        const cookieStore = await cookies();

        // ✅ PASO 2: Crear cliente de Supabase con @supabase/ssr (igual que en login)
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

        // ✅ PASO 3: Cerrar sesión (esto limpiará las cookies automáticamente)
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error al cerrar sesión:', error);
            return {
                success: false,
                error: 'No se pudo cerrar la sesión. Inténtalo de nuevo.'
            };
        }

        return { success: true };

    } catch (error) {
        console.error('Error inesperado en logout:', error);
        return {
            success: false,
            error: 'Error inesperado. Inténtalo de nuevo.'
        };
    }
}

// ✅ ALTERNATIVA: Logout con redirect automático
export async function logoutWithRedirect() {
    const result = await logoutAction();

    if (result.success) {
        redirect('/login');
    }

    return result;
}