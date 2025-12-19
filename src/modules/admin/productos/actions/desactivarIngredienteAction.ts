'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function desactivarIngredienteAction(id: string, activo: boolean) {
    try {
        const { data: ingrediente, error } = await supabaseAdmin
            .from('ingredientes')
            .update({
                activo,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error cambiando estado del ingrediente:', error);
            return {
                success: false,
                error: error.message || 'Error al cambiar estado del ingrediente',
            };
        }

        // Revalidar cache
        revalidatePath('/administrativo/productos');
        revalidatePath('/administrativo/productos/nuevo');

        return {
            success: true,
            ingrediente,
            message: `Ingrediente ${activo ? 'activado' : 'desactivado'} exitosamente`,
        };
    } catch (error) {
        console.error('Error en desactivarIngredienteAction:', error);

        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}
