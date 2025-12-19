'use server';

import { supabase } from "@/src/lib/supabaseClient";

export async function obtenerUsuariosAction() {
    try {
        // Obtener usuarios incluyendo el campo activo
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('id, nombre, email, rol, activo, created_at')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('Error al obtener usuarios:', error);
            return {
                success: false,
                error: 'No se pudieron cargar los usuarios'
            };
        }

        // Asegurar que activo sea true por defecto para usuarios existentes
        const usuariosFormateados = usuarios?.map(usuario => ({
            ...usuario,
            activo: usuario.activo !== null ? usuario.activo : true
        })) || [];

        return {
            success: true,
            usuarios: usuariosFormateados
        };

    } catch (error) {
        console.error('Error inesperado:', error);
        return {
            success: false,
            error: 'Error inesperado al cargar usuarios'
        };
    }
}