// src/actions/desactivarProductoAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function desactivarProductoAction(productoId: string, activo: boolean = false) {
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

        // Si ya está en el estado deseado, devolvemos mensaje
        if (producto.activo === activo) {
            return {
                success: true,
                message: `El producto "${producto.nombre}" ya estaba ${activo ? 'activado' : 'desactivado'}`
            };
        }

        // Actualizar el campo activo
        const { error: updateError } = await supabaseAdmin
            .from("productos")
            .update({ activo: activo, updated_at: new Date().toISOString() })
            .eq("id", productoId);

        if (updateError) {
            console.error("Error cambiando estado del producto:", updateError);
            return {
                success: false,
                error: `Error al ${activo ? 'activar' : 'desactivar'} el producto`
            };
        }

        return {
            success: true,
            message: `El producto "${producto.nombre}" fue ${activo ? 'activado' : 'desactivado'} correctamente`
        };
    } catch (error) {
        console.error("Error inesperado desactivando producto:", error);
        return {
            success: false,
            error: "Error interno del servidor al desactivar el producto"
        };
    }
}
