'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import type { IngredienteFrontend } from '../types/producto';

export async function obtenerIngredientesAction(filtro?: {
    soloActivos?: boolean;
    incluirInactivos?: boolean;
    productoId?: number;
}) {
    try {
        let query = supabaseAdmin
            .from('ingredientes')
            .select('*')
            .order('nombre', { ascending: true });

        // Aplicar filtros
        if (filtro?.soloActivos) {
            query = query.eq('activo', true);
        }

        const { data: ingredientes, error } = await query;

        if (error) {
            console.error('Error obteniendo ingredientes:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener ingredientes',
                ingredientes: [],
            };
        }

        // Map results to match IngredienteFrontend (id number -> string)
        const mappedIngredientes: IngredienteFrontend[] = (ingredientes || []).map((ing: { id: number; nombre: string; activo: boolean; created_at: string }) => ({
            ...ing,
            id: ing.id.toString(), // Convert number ID to string
            created_at: ing.created_at, // Ensure required fields are present
            nombre: ing.nombre,
            activo: ing.activo
        }));

        return {
            success: true,
            ingredientes: mappedIngredientes,
        };
    } catch (error) {
        console.error('Error en obtenerIngredientesAction:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
            ingredientes: [],
        };
    }
}