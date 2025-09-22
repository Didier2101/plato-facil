"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function crearProductoAction(formData: FormData) {
    try {
        // 🔹 Obtener campos del formulario
        const nombre = (formData.get("nombre") as string)?.trim();
        const categoria_id = formData.get("categoria_id") as string;
        const descripcion = (formData.get("descripcion") as string)?.trim() || null;
        const precio = parseFloat(formData.get("precio") as string);
        const imagen = formData.get("imagen") as File;

        // 🔹 Ingredientes seleccionados (array de objetos con id y obligatorio)
        const ingredientesRaw = formData.get("ingredientes") as string;
        const ingredientesSeleccionados: { id: string; obligatorio: boolean }[] = ingredientesRaw
            ? JSON.parse(ingredientesRaw)
            : [];

        // 🔹 Validaciones básicas
        if (!nombre || !categoria_id || !precio) {
            return { success: false, error: "Nombre, categoría y precio son requeridos" };
        }
        if (precio <= 0) {
            return { success: false, error: "El precio debe ser mayor a 0" };
        }

        // 🔹 Verificar que la categoría existe
        const { data: categoria, error: categoriaError } = await supabaseAdmin
            .from("categorias")
            .select("id")
            .eq("id", categoria_id)
            .single();

        if (categoriaError || !categoria) {
            return { success: false, error: "La categoría seleccionada no existe" };
        }

        // 🔹 Procesar imagen si existe
        let imagenUrl: string | null = null;
        if (imagen && imagen.size > 0) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!allowedTypes.includes(imagen.type)) {
                return { success: false, error: "Tipo de archivo no permitido. Solo JPG, PNG o WEBP" };
            }

            const maxSize = 5 * 1024 * 1024;
            if (imagen.size > maxSize) {
                return { success: false, error: "La imagen es demasiado grande (máx 5MB)" };
            }

            try {
                const uploadDir = path.join(process.cwd(), "public", "uploads", "productos");
                if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

                const fileExt = imagen.name.split(".").pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = path.join(uploadDir, fileName);

                const bytes = await imagen.arrayBuffer();
                const buffer = Buffer.from(bytes);
                await writeFile(filePath, buffer);

                imagenUrl = `/uploads/productos/${fileName}`;
            } catch (uploadError) {
                console.error("Error guardando imagen:", uploadError);
                return { success: false, error: "Error al guardar la imagen" };
            }
        }

        // 🔹 Insertar producto en la tabla principal
        const { data: producto, error: dbError } = await supabaseAdmin
            .from("productos")
            .insert([
                {
                    nombre,
                    categoria_id,
                    descripcion,
                    precio,
                    imagen_url: imagenUrl,
                    activo: true,
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (dbError) {
            console.error("Error en DB:", dbError);
            return { success: false, error: dbError.message };
        }

        // 🔹 Insertar relación de ingredientes (solo id y obligatorio)
        if (ingredientesSeleccionados.length > 0) {
            const ingredientesInsert = ingredientesSeleccionados.map((ing, idx) => ({
                producto_id: producto.id,
                ingrediente_id: ing.id,
                obligatorio: ing.obligatorio,
                orden: idx,
            }));

            const { error: ingError } = await supabaseAdmin
                .from("producto_ingredientes")
                .insert(ingredientesInsert);

            if (ingError) {
                console.error("Error insertando ingredientes:", ingError);
                return { success: false, error: "Producto creado pero error en ingredientes" };
            }
        }

        return { success: true, producto };
    } catch (error) {
        console.error("Error inesperado:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
