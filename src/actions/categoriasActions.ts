"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Obtener todas las categorías
export async function obtenerCategoriasAction() {
    try {
        const { data: categorias, error } = await supabaseAdmin
            .from("categorias")
            .select("*")
            .order("nombre", { ascending: true });

        if (error) {
            console.error("Error obteniendo categorías:", error);
            return {
                success: false,
                error: `Error al obtener categorías: ${error.message}`
            };
        }

        return {
            success: true,
            categorias
        };

    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}

// Crear nueva categoría
export async function crearCategoriaAction(data: { nombre: string }) {
    try {
        const { nombre } = data;

        // Validaciones básicas
        if (!nombre || !nombre.trim()) {
            return { success: false, error: "El nombre de la categoría es requerido" };
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const { data: categoriaExistente, error: checkError } = await supabaseAdmin
            .from("categorias")
            .select("id")
            .ilike("nombre", nombre.trim())
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error("Error verificando categoría:", checkError);
            return {
                success: false,
                error: "Error al verificar la categoría"
            };
        }

        if (categoriaExistente) {
            return {
                success: false,
                error: "Ya existe una categoría con este nombre"
            };
        }

        // Crear la categoría
        const { data: categoria, error: dbError } = await supabaseAdmin
            .from("categorias")
            .insert([
                {
                    nombre: nombre.trim(),
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (dbError) {
            console.error("Error en DB:", dbError);
            return {
                success: false,
                error: `Error en base de datos: ${dbError.message}`
            };
        }

        return {
            success: true,
            categoria
        };

    } catch (error) {
        console.error("Error inesperado:", error);
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}