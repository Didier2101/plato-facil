'use server';

import { supabase } from "@/src/lib/supabaseClient";

export async function obtenerUsuariosAction() {
    try {
        // Obtener usuarios de la tabla auth.users o tu tabla personalizada
        const { data: usuarios, error } = await supabase
            .from('usuarios') // o el nombre de tu tabla
            .select('id, nombre, email, rol')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al obtener usuarios:', error);
            return {
                success: false,
                error: 'No se pudieron cargar los usuarios'
            };
        }

        return {
            success: true,
            usuarios: usuarios || []
        };

    } catch (error) {
        console.error('Error inesperado:', error);
        return {
            success: false,
            error: 'Error inesperado al cargar usuarios'
        };
    }
}

// Alternativa si usas auth.users directamente
export async function obtenerUsuariosAuthAction() {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Error al obtener usuarios:', error);
            return {
                success: false,
                error: 'No se pudieron cargar los usuarios'
            };
        }

        const usuarios = data.users.map(user => ({
            id: user.id,
            nombre: user.user_metadata?.nombre || user.email?.split('@')[0] || 'Sin nombre',
            email: user.email || '',
            rol: user.user_metadata?.rol || 'usuario'
        }));

        return {
            success: true,
            usuarios
        };

    } catch (error) {
        console.error('Error inesperado:', error);
        return {
            success: false,
            error: 'Error inesperado al cargar usuarios'
        };
    }
}