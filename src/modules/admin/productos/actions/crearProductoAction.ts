// src/modules/admin/productos/actions/crearProductoAction.ts (actualizado)
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { crearProductoSchema } from "../schemas/productoSchema";
import type { CrearProductoData } from "../schemas/productoSchema";
import { Tables } from "@/src/lib/database.types";

export async function crearProductoAction(formData: FormData): Promise<{
    success: boolean;
    error?: string;
    producto?: Tables<'productos'>;
}> {
    try {
        console.log("=== INICIO CREAR PRODUCTO ===");

        // 🔹 Parsear y validar datos del formulario
        const formDataObj = Object.fromEntries(formData.entries());

        const validationData: CrearProductoData = {
            nombre: formDataObj.nombre as string,
            descripcion: formDataObj.descripcion as string,
            precio: parseFloat(formDataObj.precio as string),
            categoria_id: formDataObj.categoria_id as string,
            imagen: formData.getAll('imagen') as File[],
            ingredientes: formDataObj.ingredientes ? JSON.parse(formDataObj.ingredientes as string) : [],
        };

        // 🔹 Validar con Zod
        const validationResult = crearProductoSchema.safeParse(validationData);
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(e => e.message).join(', ');
            console.error("❌ Validación fallida:", errors);
            return {
                success: false,
                error: `Error de validación: ${errors}`
            };
        }

        const { nombre, categoria_id, descripcion, precio, imagen, ingredientes } = validationResult.data;

        console.log("✅ Datos validados:", { nombre, categoria_id, precio });

        // 🔹 Verificar que la categoría existe
        const { data: categoria, error: categoriaError } = await supabaseAdmin
            .from("categorias")
            .select("id")
            .eq("id", categoria_id)
            .single();

        if (categoriaError || !categoria) {
            console.error("❌ Error de categoría:", categoriaError);
            return {
                success: false,
                error: "La categoría seleccionada no existe"
            };
        }

        // 🔹 Procesar imagen
        let imagenUrl: string | null = null;
        if (imagen && imagen.length > 0 && imagen[0].size > 0) {
            const file = imagen[0];

            console.log("🖼️  Procesando imagen:", {
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                type: file.type,
            });

            try {
                // Generar nombre único para el archivo
                const fileExt = file.name.split(".").pop()?.toLowerCase() || 'webp';
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2);
                const fileName = `producto-${timestamp}-${randomId}.${fileExt}`;

                // Subir a Supabase Storage
                const { error: uploadError } = await supabaseAdmin.storage
                    .from('productos')
                    .upload(fileName, file, {
                        contentType: file.type,
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    console.error("❌ Error subiendo imagen:", uploadError);
                    return {
                        success: false,
                        error: `Error al subir la imagen: ${uploadError.message}`
                    };
                }

                // Obtener URL pública
                const { data: urlData } = supabaseAdmin.storage
                    .from('productos')
                    .getPublicUrl(fileName);

                imagenUrl = urlData?.publicUrl || null;
                console.log("✅ Imagen subida exitosamente:", { fileName, url: imagenUrl });

            } catch (uploadError) {
                console.error("❌ Error procesando imagen:", uploadError);
                return {
                    success: false,
                    error: "Error al procesar la imagen"
                };
            }
        }

        // 🔹 Insertar producto en la tabla principal
        console.log("📥 Insertando producto en BD...");
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
            console.error("❌ Error en BD:", dbError);

            // Si falló la BD pero se subió imagen, eliminarla
            if (imagenUrl) {
                const fileName = imagenUrl.split('/').pop();
                if (fileName) {
                    await supabaseAdmin.storage
                        .from('productos')
                        .remove([fileName])
                        .catch(cleanupError => {
                            console.error("Error limpiando imagen:", cleanupError);
                        });
                }
            }

            return {
                success: false,
                error: `Error en base de datos: ${dbError.message}`
            };
        }

        console.log("✅ Producto creado:", producto.id);

        // 🔹 Insertar relación de ingredientes
        if (ingredientes && ingredientes.length > 0) {
            console.log("🥗 Insertando ingredientes...");

            const ingredientesInsert = ingredientes.map((ing, idx) => ({
                producto_id: producto.id,
                ingrediente_id: ing.id,
                obligatorio: ing.obligatorio,
                orden: idx,
            }));

            const { error: ingError } = await supabaseAdmin
                .from("producto_ingredientes")
                .insert(ingredientesInsert);

            if (ingError) {
                console.error("❌ Error insertando ingredientes:", ingError);

                // Rollback: eliminar producto y imagen
                await supabaseAdmin.from("products").delete().eq("id", producto.id);

                if (imagenUrl) {
                    const fileName = imagenUrl.split('/').pop();
                    if (fileName) {
                        await supabaseAdmin.storage
                            .from('productos')
                            .remove([fileName])
                            .catch(cleanupError => {
                                console.error("Error limpiando imagen en rollback:", cleanupError);
                            });
                    }
                }

                return {
                    success: false,
                    error: "Error al asociar ingredientes con el producto"
                };
            }
        }

        console.log("🎉 === PRODUCTO CREADO EXITOSAMENTE ===");
        return {
            success: true,
            producto
        };

    } catch (error) {
        console.error("💥 Error inesperado:", error);

        const errorMessage = error instanceof Error
            ? `Error interno: ${error.message}`
            : "Error interno del servidor";

        return {
            success: false,
            error: errorMessage
        };
    }
}

// ... resto de las funciones (obtenerCategoriasAction, crearCategoriaAction, obtenerIngredientesAction, crearIngredienteAction)
// ... mantienen la misma lógica pero están mejor integradas con los hooks