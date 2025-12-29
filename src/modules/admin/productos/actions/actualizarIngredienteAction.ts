'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ingredienteSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100).optional(),
    activo: z.boolean().optional(),
});

export type ActualizarIngredienteInput = z.infer<typeof ingredienteSchema>;

export async function actualizarIngredienteAction(id: string, data: ActualizarIngredienteInput) {
    try {
        // Validar datos
        const result = ingredienteSchema.safeParse(data);

        if (!result.success) {
            return {
                success: false,
                error: result.error.issues.map(e => e.message).join(', '),
            };
        }

        const validatedData = result.data;

        // Actualizar en Supabase
        const { data: ingrediente, error } = await supabaseAdmin
            .from('ingredientes')
            .update(validatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error actualizando ingrediente:', error);

            // Detectar error de nombre duplicado
            if (error.code === '23505' || error.message.includes('duplicate key') || error.message.includes('ingredientes_nombre_')) {
                return {
                    success: false,
                    error: `Ya existe otro ingrediente con el nombre "${validatedData.nombre}". Por favor, elige otro nombre.`,
                };
            }

            return {
                success: false,
                error: error.message || 'Error al actualizar ingrediente',
            };
        }

        // Revalidar cache
        revalidatePath('/administrativo/productos');

        return {
            success: true,
            ingrediente,
            message: 'Ingrediente actualizado exitosamente',
        };
    } catch (error) {
        console.error('Error en actualizarIngredienteAction:', error);

        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}