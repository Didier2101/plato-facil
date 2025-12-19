'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ingredienteSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    activo: z.boolean().default(true),
});

export type CrearIngredienteInput = z.infer<typeof ingredienteSchema>;

export async function crearIngredienteAction(data: CrearIngredienteInput) {
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

        // Insertar en Supabase
        const { data: ingrediente, error } = await supabaseAdmin
            .from('ingredientes')
            .insert({
                nombre: validatedData.nombre,
                activo: validatedData.activo,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creando ingrediente:', error);
            return {
                success: false,
                error: error.message || 'Error al crear ingrediente',
            };
        }

        // Revalidar cache
        revalidatePath('/administrativo/productos');
        revalidatePath('/administrativo/productos/nuevo');

        return {
            success: true,
            ingrediente,
            message: 'Ingrediente creado exitosamente',
        };
    } catch (error) {
        console.error('Error en crearIngredienteAction:', error);

        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}