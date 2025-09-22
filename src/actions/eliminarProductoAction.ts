"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { unlink } from 'fs/promises';
import path from 'path';

export async function eliminarProductoAction(productoId: string) {
    try {
        // Validación básica
        if (!productoId) {
            return { success: false, error: "ID del producto es requerido" };
        }

        // Primero obtener el producto para saber si tiene imagen
        const { data: producto, error: getError } = await supabaseAdmin
            .from("productos")
            .select("*")
            .eq("id", productoId)
            .single();

        if (getError || !producto) {
            return { success: false, error: "Producto no encontrado" };
        }

        // Eliminar el producto de la base de datos
        const { error: deleteError } = await supabaseAdmin
            .from("productos")
            .delete()
            .eq("id", productoId);

        if (deleteError) {
            console.error("Error eliminando producto de DB:", deleteError);
            return {
                success: false,
                error: `Error eliminando producto: ${deleteError.message}`
            };
        }

        // Si el producto tiene imagen, eliminar el archivo del servidor
        if (producto.imagen_url) {
            try {
                const filePath = path.join(process.cwd(), 'public', producto.imagen_url);
                await unlink(filePath);
                console.log("Imagen eliminada:", filePath);
            } catch (fileError) {
                console.warn("No se pudo eliminar la imagen:", fileError);
                // No devolvemos error aquí porque el producto ya se eliminó de la DB
            }
        }

        return {
            success: true,
            message: "Producto eliminado correctamente"
        };

    } catch (error) {
        console.error("Error inesperado eliminando producto:", error);
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}