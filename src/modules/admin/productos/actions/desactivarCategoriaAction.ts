'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function desactivarCategoriaAction(id: number, activo: boolean) {
    try {
        const { data: categoria, error } = await supabaseAdmin
            .from('categorias')
            .update({
                activo,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error cambiando estado de la categoría:', error);
            return {
                success: false,
                error: error.message || 'Error al cambiar estado de la categoría',
            };
        }

        // Revalidar cache
        revalidatePath('/administrativo/productos');
        revalidatePath('/administrativo/productos/nuevo');

        return {
            success: true,
            categoria,
            message: `Categoría ${activo ? 'activada' : 'desactivada'} exitosamente`,
        };
    } catch (error) {
        console.error('Error en desactivarCategoriaAction:', error);

        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}
