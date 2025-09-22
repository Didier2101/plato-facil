"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function crearProductoAction(formData: FormData) {
    try {
        console.log("=== INICIO CREAR PRODUCTO ===");

        // 🔹 Obtener campos del formulario
        const nombre = (formData.get("nombre") as string)?.trim();
        const categoria_id = formData.get("categoria_id") as string;
        const descripcion = (formData.get("descripcion") as string)?.trim() || null;
        const precio = parseFloat(formData.get("precio") as string);
        const imagen = formData.get("imagen") as File;

        // 🔹 Ingredientes seleccionados
        const ingredientesRaw = formData.get("ingredientes") as string;
        const ingredientesSeleccionados: { id: string; obligatorio: boolean }[] = ingredientesRaw
            ? JSON.parse(ingredientesRaw)
            : [];

        console.log("Datos básicos:", { nombre, categoria_id, precio, tieneImagen: !!imagen });

        // 🔹 Validaciones básicas
        if (!nombre || !categoria_id || !precio) {
            return { success: false, error: "Nombre, categoría y precio son requeridos" };
        }
        if (precio <= 0) {
            return { success: false, error: "El precio debe ser mayor a 0" };
        }

        // 🔹 Verificar que la categoría existe
        console.log("Verificando categoría...");
        const { data: categoria, error: categoriaError } = await supabaseAdmin
            .from("categorias")
            .select("id")
            .eq("id", categoria_id)
            .single();

        if (categoriaError || !categoria) {
            console.error("Error de categoría:", categoriaError);
            return { success: false, error: "La categoría seleccionada no existe" };
        }

        // 🔹 Procesar imagen con Supabase Storage
        let imagenUrl: string | null = null;
        if (imagen && imagen.size > 0) {
            console.log("Procesando imagen:", { size: imagen.size, type: imagen.type });

            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (!allowedTypes.includes(imagen.type)) {
                return { success: false, error: "Tipo de archivo no permitido. Solo JPG, PNG o WEBP" };
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (imagen.size > maxSize) {
                return { success: false, error: "La imagen es demasiado grande (máx 5MB)" };
            }

            try {
                // Generar nombre único para el archivo
                const fileExt = imagen.name.split(".").pop() || 'jpg';
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2);
                const fileName = `producto-${timestamp}-${randomId}.${fileExt}`;

                console.log("Subiendo imagen:", fileName);

                // Convertir File a ArrayBuffer
                const arrayBuffer = await imagen.arrayBuffer();

                // Subir a Supabase Storage
                const { error: uploadError } = await supabaseAdmin.storage
                    .from('productos')
                    .upload(fileName, arrayBuffer, {
                        contentType: imagen.type,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Error subiendo imagen:", uploadError);
                    return { success: false, error: `Error al subir la imagen: ${uploadError.message}` };
                }

                // Obtener URL pública
                const { data: urlData } = supabaseAdmin.storage
                    .from('productos')
                    .getPublicUrl(fileName);

                imagenUrl = urlData.publicUrl;
                console.log("Imagen subida exitosamente:", imagenUrl);

            } catch (uploadError) {
                console.error("Error procesando imagen:", uploadError);
                return { success: false, error: "Error al procesar la imagen" };
            }
        }

        // 🔹 Insertar producto en la tabla principal
        console.log("Insertando producto en BD...");
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

            // Si falló la BD pero se subió imagen, eliminarla
            if (imagenUrl) {
                const fileName = imagenUrl.split('/').pop();
                if (fileName) {
                    await supabaseAdmin.storage
                        .from('productos')
                        .remove([fileName]);
                }
            }

            return { success: false, error: `Error en base de datos: ${dbError.message}` };
        }

        console.log("Producto creado:", producto.id);

        // 🔹 Insertar relación de ingredientes
        if (ingredientesSeleccionados.length > 0) {
            console.log("Insertando ingredientes...");

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

                // Rollback: eliminar producto y imagen
                await supabaseAdmin.from("productos").delete().eq("id", producto.id);

                if (imagenUrl) {
                    const fileName = imagenUrl.split('/').pop();
                    if (fileName) {
                        await supabaseAdmin.storage
                            .from('productos')
                            .remove([fileName]);
                    }
                }

                return { success: false, error: "Error al asociar ingredientes con el producto" };
            }
        }

        console.log("=== PRODUCTO CREADO EXITOSAMENTE ===");
        return { success: true, producto };

    } catch (error) {
        console.error("Error inesperado:", error);

        if (error instanceof Error) {
            return { success: false, error: `Error interno: ${error.message}` };
        }

        return { success: false, error: "Error interno del servidor" };
    }
}