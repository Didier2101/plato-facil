"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export interface DatosActualizacion {
    nombre: string;
    descripcion: string;
    precio: number;
    activo: boolean;
    categoria_id?: string;
}

interface IngredienteActualizacion {
    ingrediente_id: string;
    obligatorio: boolean;
}

export async function actualizarProductoAction(
    productoId: string,
    datos: DatosActualizacion | FormData
) {
    try {
        // Validaciones básicas
        if (!productoId) {
            return { success: false, error: "ID del producto es requerido" };
        }

        let datosActualizacion: DatosActualizacion;
        let nuevaImagen: File | null = null;
        let ingredientes: IngredienteActualizacion[] = [];

        // Determinar si es FormData o objeto directo
        if (datos instanceof FormData) {
            datosActualizacion = {
                nombre: datos.get("nombre") as string,
                descripcion: datos.get("descripcion") as string,
                precio: parseFloat(datos.get("precio") as string),
                activo: datos.get("activo") === "true",
                categoria_id: datos.get("categoria_id") as string || undefined
            };
            nuevaImagen = datos.get("imagen") as File;

            // Extraer ingredientes si existen
            const ingredientesStr = datos.get("ingredientes") as string;
            if (ingredientesStr) {
                try {
                    ingredientes = JSON.parse(ingredientesStr);
                } catch (e) {
                    console.warn("Error parseando ingredientes:", e);
                    ingredientes = [];
                }
            }
        } else {
            datosActualizacion = datos;
        }

        // Validaciones
        if (!datosActualizacion.nombre || !datosActualizacion.nombre.trim()) {
            return { success: false, error: "El nombre es requerido" };
        }

        if (datosActualizacion.precio <= 0) {
            return { success: false, error: "El precio debe ser mayor a 0" };
        }

        // Obtener producto actual
        const { data: productoActual, error: getError } = await supabaseAdmin
            .from("productos")
            .select("*")
            .eq("id", productoId)
            .single();

        if (getError || !productoActual) {
            return { success: false, error: "Producto no encontrado" };
        }

        let imagenUrl = productoActual.imagen_url;

        // Procesar nueva imagen
        if (nuevaImagen && nuevaImagen.size > 0) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(nuevaImagen.type)) {
                return {
                    success: false,
                    error: "Tipo de archivo no permitido. Solo JPG, PNG o WEBP"
                };
            }

            const maxSize = 5 * 1024 * 1024;
            if (nuevaImagen.size > maxSize) {
                return {
                    success: false,
                    error: "La imagen es demasiado grande (máx 5MB)"
                };
            }

            try {
                const fileExt = nuevaImagen.name.split(".").pop()?.toLowerCase() || 'jpg';
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2);
                const fileName = `producto-${timestamp}-${randomId}.${fileExt}`;

                const arrayBuffer = await nuevaImagen.arrayBuffer();

                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    return { success: false, error: "Error al procesar el archivo de imagen" };
                }

                const { error: uploadError } = await supabaseAdmin.storage
                    .from('productos')
                    .upload(fileName, arrayBuffer, {
                        contentType: nuevaImagen.type,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error("Error al subir nueva imagen:", uploadError);
                    let errorMessage = "Error al subir la nueva imagen";
                    if (uploadError.message.includes('Bucket not found')) {
                        errorMessage = "El bucket 'productos' no existe en Supabase Storage";
                    } else if (uploadError.message.includes('not allowed') || uploadError.message.includes('permission')) {
                        errorMessage = "No tienes permisos para subir archivos";
                    } else {
                        errorMessage = `Error de Storage: ${uploadError.message}`;
                    }
                    return { success: false, error: errorMessage };
                }

                const { data: urlData } = supabaseAdmin.storage
                    .from('productos')
                    .getPublicUrl(fileName);

                if (!urlData?.publicUrl) {
                    return { success: false, error: "Error al obtener URL de la nueva imagen" };
                }

                const nuevaImagenUrl = urlData.publicUrl;

                // Eliminar imagen anterior
                if (productoActual.imagen_url && productoActual.imagen_url.includes('supabase')) {
                    try {
                        const oldFileName = productoActual.imagen_url.split('/').pop();
                        if (oldFileName) {
                            await supabaseAdmin.storage
                                .from('productos')
                                .remove([oldFileName]);
                        }
                    } catch (cleanupError) {
                        console.warn("Error al limpiar imagen anterior:", cleanupError);
                    }
                }

                imagenUrl = nuevaImagenUrl;

            } catch (uploadError) {
                console.error("Error procesando imagen:", uploadError);
                if (uploadError instanceof TypeError) {
                    return { success: false, error: "Error de conexión al subir la imagen" };
                } else if (uploadError instanceof Error) {
                    return { success: false, error: `Error al procesar imagen: ${uploadError.message}` };
                }
                return { success: false, error: "Error desconocido al procesar la imagen" };
            }
        }

        // Actualizar el producto
        const { data: producto, error: updateError } = await supabaseAdmin
            .from("productos")
            .update({
                nombre: datosActualizacion.nombre.trim(),
                descripcion: datosActualizacion.descripcion.trim() || null,
                precio: datosActualizacion.precio,
                activo: datosActualizacion.activo,
                categoria_id: datosActualizacion.categoria_id,
                imagen_url: imagenUrl,
                updated_at: new Date().toISOString()
            })
            .eq("id", productoId)
            .select()
            .single();

        if (updateError) {
            console.error("Error actualizando producto:", updateError);

            // Rollback de imagen si hubo error
            if (nuevaImagen && imagenUrl && imagenUrl !== productoActual.imagen_url) {
                try {
                    const fileName = imagenUrl.split('/').pop();
                    if (fileName) {
                        await supabaseAdmin.storage
                            .from('productos')
                            .remove([fileName]);
                    }
                } catch (cleanupError) {
                    console.error("Error limpiando imagen:", cleanupError);
                }
            }

            return {
                success: false,
                error: `Error actualizando producto: ${updateError.message}`
            };
        }

        // ✅ ACTUALIZAR INGREDIENTES
        if (ingredientes && ingredientes.length >= 0) {
            try {
                // 1. Eliminar todos los ingredientes anteriores
                const { error: deleteError } = await supabaseAdmin
                    .from("producto_ingredientes")
                    .delete()
                    .eq("producto_id", productoId);

                if (deleteError) {
                    console.error("Error eliminando ingredientes anteriores:", deleteError);
                }

                // 2. Insertar los nuevos ingredientes
                if (ingredientes.length > 0) {
                    // Tipar correctamente los ingredientes para insertar
                    type IngredienteParaInsertar = {
                        producto_id: number;
                        ingrediente_id: string;
                        obligatorio: boolean;
                        orden: number;
                    };

                    const ingredientesParaInsertar: IngredienteParaInsertar[] = ingredientes.map((ing, index) => ({
                        producto_id: parseInt(productoId),
                        ingrediente_id: ing.ingrediente_id,
                        obligatorio: ing.obligatorio,
                        orden: index
                    }));

                    const { error: insertError } = await supabaseAdmin
                        .from("producto_ingredientes")
                        .insert(ingredientesParaInsertar);

                    if (insertError) {
                        console.error("Error insertando ingredientes:", insertError);
                        // No fallar toda la actualización por esto
                    }
                }
            } catch (ingError) {
                console.error("Error gestionando ingredientes:", ingError);
                // No fallar toda la actualización por esto
            }
        }

        // Obtener el producto actualizado con todas sus relaciones
        const { data: productoCompleto, error: fetchError } = await supabaseAdmin
            .from("productos")
            .select(`
                *,
                categorias (
                    id,
                    nombre
                ),
                producto_ingredientes (
                    ingrediente_id,
                    obligatorio,
                    orden,
                    ingredientes (
                        id,
                        nombre,
                        activo,
                        created_at
                    )
                )
            `)
            .eq("id", productoId)
            .single();

        if (fetchError || !productoCompleto) {
            console.error("Error obteniendo producto completo:", fetchError);
            // Devolver el producto básico al menos
            return {
                success: true,
                producto: {
                    id: String(producto.id),
                    nombre: producto.nombre,
                    categoria_id: String(producto.categoria_id),
                    categoria: "Sin categoría",
                    descripcion: producto.descripcion,
                    precio: producto.precio,
                    imagen_url: producto.imagen_url,
                    activo: producto.activo,
                    created_at: producto.created_at,
                    updated_at: producto.updated_at,
                    ingredientes: []
                },
                message: "Producto actualizado correctamente"
            };
        }

        // Tipar correctamente las respuestas de Supabase
        type ProductoIngredienteDB = {
            ingrediente_id: string;
            obligatorio: boolean;
            orden: number;
            ingredientes: {
                id: string;
                nombre: string;
                activo: boolean;
                created_at: string;
            };
        };

        type ProductoCompletoDB = typeof productoCompleto & {
            categorias: { id: string; nombre: string } | null;
            producto_ingredientes: ProductoIngredienteDB[] | null;
        };

        const productoConTipos = productoCompleto as ProductoCompletoDB;

        return {
            success: true,
            producto: {
                id: String(productoConTipos.id),
                nombre: productoConTipos.nombre,
                categoria_id: String(productoConTipos.categoria_id),
                categoria: productoConTipos.categorias?.nombre || "Sin categoría",
                descripcion: productoConTipos.descripcion,
                precio: productoConTipos.precio,
                imagen_url: productoConTipos.imagen_url,
                activo: productoConTipos.activo,
                created_at: productoConTipos.created_at,
                updated_at: productoConTipos.updated_at,
                ingredientes: productoConTipos.producto_ingredientes?.map((pi: ProductoIngredienteDB) => ({
                    id: String(pi.ingrediente_id),
                    producto_id: String(productoConTipos.id),
                    ingrediente_id: String(pi.ingrediente_id),
                    obligatorio: pi.obligatorio,
                    orden: pi.orden || 0,
                    ingrediente: {
                        id: String(pi.ingredientes.id),
                        nombre: pi.ingredientes.nombre,
                        activo: pi.ingredientes.activo,
                        created_at: pi.ingredientes.created_at
                    }
                })) || []
            },
            message: "Producto actualizado correctamente"
        };

    } catch (error) {
        console.error("Error inesperado actualizando producto:", error);

        if (error instanceof Error) {
            return { success: false, error: `Error interno: ${error.message}` };
        }

        return { success: false, error: "Error interno del servidor" };
    }
}