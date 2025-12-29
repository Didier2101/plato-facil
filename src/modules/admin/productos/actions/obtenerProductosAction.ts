'use server';

import { supabaseAdmin } from '@/src/lib/supabaseAdmin';
import type { ProductoFrontend, ProductoDB } from '../types/producto';

// Definimos el tipo de respuesta de la base de datos incluyendo la relación
interface ProductoResponse extends ProductoDB {
    categorias: {
        nombre: string;
    } | null;
    producto_ingredientes?: {
        ingrediente_id: string;
        obligatorio: boolean;
        ingredientes: {
            nombre: string;
            activo: boolean;
        };
    }[];
}

export async function obtenerProductosAction() {
    try {
        const { data: productos, error } = await supabaseAdmin
            .from('productos')
            .select(`
        *,
        categorias (
          nombre
        ),
        producto_ingredientes (
          ingrediente_id,
          obligatorio,
          ingredientes (
            nombre,
            activo
          )
        )
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error obteniendo productos:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener productos',
                productos: [],
            };
        }

        // Transformar datos para el frontend
        const productosFrontend: ProductoFrontend[] = (productos || []).map((producto: ProductoResponse) => ({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url || undefined,
            descripcion: producto.descripcion || undefined,
            activo: producto.activo,
            categoria: producto.categorias?.nombre || 'Sin categoría',
            categoria_id: producto.categoria_id || undefined,
            ingredientes: producto.producto_ingredientes?.map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                obligatorio: pi.obligatorio,
                ingrediente: {
                    nombre: pi.ingredientes.nombre,
                    activo: pi.ingredientes.activo,
                },
            })) || [],
            created_at: producto.created_at,
            updated_at: producto.updated_at,
        }));

        return {
            success: true,
            productos: productosFrontend,
        };
    } catch (error) {
        console.error('Error en obtenerProductosAction:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
            productos: [],
        };
    }
}

export async function obtenerProductoPorIdAction(id: string) {
    try {
        const { data: producto, error } = await supabaseAdmin
            .from('productos')
            .select(`
        *,
        categorias (
          nombre
        ),
        producto_ingredientes (
          ingrediente_id,
          obligatorio,
          ingredientes (
            id,
            nombre,
            activo
          )
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error obteniendo producto:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener producto',
                producto: null,
            };
        }

        return {
            success: true,
            producto,
        };
    } catch (error) {
        console.error('Error en obtenerProductoPorIdAction:', error);
        return {
            success: false,
            error: 'Error interno del servidor',
            producto: null,
        };
    }
}
