'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const categoriaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100),
    descripcion: z.string().max(500).optional(),
    icono: z.string().max(50).optional(),
    activo: z.boolean().default(true),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color inválido').optional(),
});

export type CrearCategoriaInput = z.infer<typeof categoriaSchema>;

export async function crearCategoriaAction(data: CrearCategoriaInput) {
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

        // Insertar en Supabase
        const { data: categoria, error } = await supabaseAdmin
            .from('categorias')
            .insert({
                ...validatedData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creando categoría:', error);
            return {
                success: false,
                error: error.message || 'Error al crear categoría',
            };
        }

        // Revalidar cache
        revalidatePath('/administrativo/productos');
        revalidatePath('/administrativo/productos/nuevo');

        return {
            success: true,
            categoria,
            message: 'Categoría creada exitosamente',
        };
    } catch (error) {
        console.error('Error en crearCategoriaAction:', error);

        return {
            success: false,
            error: 'Error interno del servidor',
        };
    }
}