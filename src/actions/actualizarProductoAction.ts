"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface DatosActualizacion {
    nombre: string;
    descripcion: string;
    precio: number;
    activo: boolean;
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

        // Determinar si es FormData o objeto directo
        if (datos instanceof FormData) {
            datosActualizacion = {
                nombre: datos.get("nombre") as string,
                descripcion: datos.get("descripcion") as string,
                precio: parseFloat(datos.get("precio") as string),
                activo: datos.get("activo") === "true"
            };
            nuevaImagen = datos.get("imagen") as File;
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

        // Obtener producto actual para saber si tiene imagen anterior
        const { data: productoActual, error: getError } = await supabaseAdmin
            .from("productos")
            .select("*")
            .eq("id", productoId)
            .single();

        if (getError || !productoActual) {
            return { success: false, error: "Producto no encontrado" };
        }

        let imagenUrl = productoActual.imagen_url; // Mantener la imagen actual por defecto

        // 🔹 Procesar nueva imagen con Supabase Storage
        if (nuevaImagen && nuevaImagen.size > 0) {
            console.log("Procesando nueva imagen:", {
                name: nuevaImagen.name,
                size: nuevaImagen.size,
                type: nuevaImagen.type
            });

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(nuevaImagen.type)) {
                return {
                    success: false,
                    error: "Tipo de archivo no permitido. Solo JPG, PNG o WEBP"
                };
            }

            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024;
            if (nuevaImagen.size > maxSize) {
                return {
                    success: false,
                    error: "La imagen es demasiado grande (máx 5MB)"
                };
            }

            try {
                // Generar nombre único para el archivo
                const fileExt = nuevaImagen.name.split(".").pop()?.toLowerCase() || 'jpg';
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2);
                const fileName = `producto-${timestamp}-${randomId}.${fileExt}`;

                console.log("Subiendo nueva imagen a Supabase:", fileName);

                // Convertir File a ArrayBuffer
                const arrayBuffer = await nuevaImagen.arrayBuffer();

                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    return { success: false, error: "Error al procesar el archivo de imagen" };
                }

                // Subir nueva imagen a Supabase Storage
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

                // Obtener URL pública de la nueva imagen
                const { data: urlData } = supabaseAdmin.storage
                    .from('productos')
                    .getPublicUrl(fileName);

                if (!urlData?.publicUrl) {
                    return { success: false, error: "Error al obtener URL de la nueva imagen" };
                }

                const nuevaImagenUrl = urlData.publicUrl;
                console.log("Nueva imagen subida exitosamente:", nuevaImagenUrl);

                // 🔹 Eliminar imagen anterior de Supabase Storage si existe
                if (productoActual.imagen_url && productoActual.imagen_url.includes('supabase')) {
                    try {
                        // Extraer el nombre del archivo de la URL
                        const oldFileName = productoActual.imagen_url.split('/').pop();

                        if (oldFileName) {
                            console.log("Eliminando imagen anterior:", oldFileName);

                            const { error: deleteError } = await supabaseAdmin.storage
                                .from('productos')
                                .remove([oldFileName]);

                            if (deleteError) {
                                console.warn("No se pudo eliminar la imagen anterior:", deleteError);
                            } else {
                                console.log("Imagen anterior eliminada exitosamente");
                            }
                        }
                    } catch (cleanupError) {
                        console.warn("Error al limpiar imagen anterior:", cleanupError);
                        // No fallar la actualización por esto
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

        // 🔹 Actualizar el producto en la base de datos
        const { data: producto, error: updateError } = await supabaseAdmin
            .from("productos")
            .update({
                nombre: datosActualizacion.nombre.trim(),
                descripcion: datosActualizacion.descripcion.trim() || null,
                precio: datosActualizacion.precio,
                activo: datosActualizacion.activo,
                imagen_url: imagenUrl,
                updated_at: new Date().toISOString()
            })
            .eq("id", productoId)
            .select(`
                *,
                categorias (
                    id,
                    nombre
                )
            `)
            .single();

        if (updateError) {
            console.error("Error actualizando producto:", updateError);

            // Si hubo error y se subió nueva imagen, eliminarla
            if (nuevaImagen && imagenUrl && imagenUrl !== productoActual.imagen_url) {
                try {
                    const fileName = imagenUrl.split('/').pop();
                    if (fileName) {
                        await supabaseAdmin.storage
                            .from('productos')
                            .remove([fileName])
                            .catch(cleanupError => {
                                console.error("Error limpiando imagen:", cleanupError);
                            });
                    }
                } catch (cleanupError) {
                    console.error("Error en rollback de imagen:", cleanupError);
                }
            }

            return {
                success: false,
                error: `Error actualizando producto: ${updateError.message}`
            };
        }

        console.log("Producto actualizado exitosamente:", producto.id);

        return {
            success: true,
            producto: {
                id: producto.id,
                nombre: producto.nombre,
                categoria_id: producto.categoria_id,
                categoria: producto.categorias.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                imagen_url: producto.imagen_url,
                activo: producto.activo,
                created_at: producto.created_at,
                updated_at: producto.updated_at
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