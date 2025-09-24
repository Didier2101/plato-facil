// src/actions/desactivarProductoAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function desactivarProductoAction(productoId: string) {
    try {
        // Verificar que el producto existe
        const { data: producto, error: getError } = await supabaseAdmin
            .from("productos")
            .select("id, nombre, activo")
            .eq("id", productoId)
            .single();

        if (getError || !producto) {
            return {
                success: false,
                error: "Producto no encontrado"
            };
        }

        // Si ya está inactivo, devolvemos mensaje
        if (producto.activo === false) {
            return {
                success: true,
                message: `El producto "${producto.nombre}" ya estaba desactivado`
            };
        }

        // Actualizar el campo activo a false
        const { error: updateError } = await supabaseAdmin
            .from("productos")
            .update({ activo: false, updated_at: new Date().toISOString() })
            .eq("id", productoId);

        if (updateError) {
            console.error("Error desactivando producto:", updateError);
            return {
                success: false,
                error: "Error al desactivar el producto"
            };
        }

        return {
            success: true,
            message: `El producto "${producto.nombre}" fue desactivado correctamente`
        };
    } catch (error) {
        console.error("Error inesperado desactivando producto:", error);
        return {
            success: false,
            error: "Error interno del servidor al desactivar el producto"
        };
    }
}
