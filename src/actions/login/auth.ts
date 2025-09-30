// src/actions/login/auth.ts
'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function logoutAction() {
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
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    },
                },
            }
        );

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