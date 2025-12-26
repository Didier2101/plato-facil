'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import type { CategoriaFrontend } from '../types/producto';



export async function obtenerCategoriasAction(filtro?: {
    soloActivas?: boolean;
    incluirInactivas?: boolean;
}) {
    try {
        let query = supabaseAdmin
            .from('categorias')
            .select('*')
            .order('nombre', { ascending: true });

        // Aplicar filtros
        if (filtro?.soloActivas) {
            query = query.eq('activo', true);
        }

        const { data: categorias, error } = await query;

        if (error) {
            console.error('Error obteniendo categorías:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener categorías',
                categorias: [],
            };
        }

        return {
            success: true,
            categorias: (categorias || []) as CategoriaFrontend[],
        };
    } catch (error) {
        console.error('Error en obtenerCategoriasAction:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
            categorias: [],
        };
    }
}