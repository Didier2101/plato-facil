'use server';


import { supabase } from '@/src/lib/supabaseClient';

export async function logoutAction() {
    try {
        // Cerrar sesión en Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error al cerrar sesión:', error);
            return {
                success: false,
                error: 'No se pudo cerrar la sesión. Inténtalo de nuevo.'
            };
        }

        // Opcional: Limpiar cookies/cache adicionales aquí
        // cookies().delete('session-token');

        return { success: true };

    } catch (error) {
        console.error('Error inesperado en logout:', error);
        return {
            success: false,
            error: 'Error inesperado. Inténtalo de nuevo.'
        };
    }
}