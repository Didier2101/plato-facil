"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import type { Ingrediente } from "@/src/types/producto";

export async function obtenerIngredientesAction() {
    try {
        const { data, error } = await supabaseAdmin
            .from("ingredientes")
            .select("id, nombre, activo, created_at")
            .eq("activo", true)
            .order("nombre");

        if (error) {
            console.error("Error cargando ingredientes:", error);
            return { success: false, error: error.message };
        }

        return { success: true, ingredientes: (data || []) as Ingrediente[] };
    } catch (error) {
        console.error("Error inesperado:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
