"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import type { ProductoFrontend } from "@/src/types/producto";

// Tipos de la DB
type IngredienteDB = {
    id: string;
    nombre: string;
};

type ProductoIngredienteDB = {
    ingrediente_id: string;
    obligatorio: boolean;
    ingredientes: IngredienteDB;
};

type CategoriaDB = {
    id: string;
    nombre: string;
};

type ProductoDB = {
    id: string;
    nombre: string;
    categoria_id: string;
    categorias: CategoriaDB;
    descripcion: string | null;
    precio: number;
    imagen_url: string | null;
    activo: boolean;
    created_at: string;
    producto_ingredientes?: ProductoIngredienteDB[];
};

export async function obtenerProductosAction() {
    try {
        const { data: productos, error } = await supabaseAdmin
            .from("productos")
            .select(`
        *,
        categorias(id, nombre),
        producto_ingredientes(
          ingrediente_id,
          obligatorio,
          orden,
          ingredientes(id, nombre)
        )
      `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error obteniendo productos:", error);
            return {
                success: false,
                error: `Error al obtener productos: ${error.message}`,
            };
        }

        // CORREGIDO: Mapear correctamente con la estructura de tu tipo
        const productosFormateados: ProductoFrontend[] = (productos as ProductoDB[]).map(
            (producto) => ({
                id: parseInt(producto.id, 10),
                nombre: producto.nombre,
                categoria_id: producto.categoria_id,
                categoria: producto.categorias.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                imagen_url: producto.imagen_url,
                activo: producto.activo,
                created_at: producto.created_at,
                // CORREGIDO: Mapear ingredientes con la estructura correcta
                ingredientes: producto.producto_ingredientes?.map(pi => ({
                    id: pi.ingrediente_id,
                    producto_id: parseInt(producto.id, 10),
                    ingrediente_id: pi.ingrediente_id,
                    obligatorio: pi.obligatorio,
                    orden: 0, // Si no tienes orden en la respuesta, usar 0
                    ingrediente: {
                        id: pi.ingredientes.id,
                        nombre: pi.ingredientes.nombre,
                        activo: true, // Asumir activo si no viene en la respuesta
                        created_at: new Date().toISOString() // Placeholder
                    }
                })) || []
            })
        );

        return {
            success: true,
            productos: productosFormateados,
        };
    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor",
        };
    }
}