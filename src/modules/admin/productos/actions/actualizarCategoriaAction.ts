'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categoriaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100).optional(),
    descripcion: z.string().max(500).optional(),
    icono: z.string().max(50).optional(),
    activo: z.boolean().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color inválido').optional(),
});

export type ActualizarCategoriaInput = z.infer<typeof categoriaSchema>;

export async function actualizarCategoriaAction(id: number, data: ActualizarCategoriaInput) {
    try {
        // Validar datos
        const result = categoriaSchema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                error: result.error.issues.map(e => e.message).join(', '),
            };
        }

        const validatedData = result.data;

        // Actualizar en Supabase
        const { data: categoria, error } = await supabaseAdmin
            .from('categorias')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error actualizando categoría:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar categoría',
            };
        }

        // Revalidar cache
        revalidatePath('/administrativo/productos');

        return {
            success: true,
            categoria,
            message: 'Categoría actualizada exitosamente',
        };
    } catch (error) {
        console.error('Error en actualizarCategoriaAction:', error);

        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}