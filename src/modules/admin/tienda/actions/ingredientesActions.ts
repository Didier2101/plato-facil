// src/actions/ingredientesActions.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface CrearIngredientePayload {
    nombre: string;
}

/**
 * Crea un ingrediente nuevo (si no existe).
 * Retorna { success: true, ingrediente } o { success: false, error, ingrediente? }.
 */
export async function crearIngredienteAction(payload: CrearIngredientePayload) {
    try {
        const nombreRaw = payload?.nombre ?? "";
        const nombre = nombreRaw.trim();

        if (!nombre) {
            return { success: false, error: "El nombre del ingrediente es requerido" };
        }

        // Buscar existencia (case-insensitive)
        const { data: existing, error: existingError } = await supabaseAdmin
            .from("ingredientes")
            .select("*")
            .ilike("nombre", nombre); // ilike para comparación insensible a mayúsculas/minúsculas

        if (existingError) {
            console.error("Error buscando ingrediente existente:", existingError);
            return { success: false, error: "Error buscando ingrediente" };
        }

        if (existing && existing.length > 0) {
            // Si ya existe, devolvemos info para que el cliente pueda manejarlo (evitar duplicados UI)
            return {
                success: false,
                error: "Ingrediente ya existe",
                ingrediente: existing[0],
            };
        }

        // Insertar nuevo ingrediente
        const { data: ingrediente, error: insertError } = await supabaseAdmin
            .from("ingredientes")
            .insert({
                nombre,
                activo: true,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error insertando ingrediente:", insertError);
            return { success: false, error: insertError.message || "Error al crear ingrediente" };
        }

        return { success: true, ingrediente };
    } catch (err) {
        console.error("Error inesperado en crearIngredienteAction:", err);
        return { success: false, error: "Error interno del servidor" };
    }
}
