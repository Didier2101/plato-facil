"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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
            // Extraer datos del FormData
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

        // Procesar nueva imagen si existe
        if (nuevaImagen && nuevaImagen.size > 0) {
            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(nuevaImagen.type)) {
                return {
                    success: false,
                    error: "Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WEBP"
                };
            }

            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (nuevaImagen.size > maxSize) {
                return {
                    success: false,
                    error: "La imagen es demasiado grande. Máximo 5MB"
                };
            }

            try {
                // Crear directorio si no existe
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'productos');
                if (!existsSync(uploadDir)) {
                    await mkdir(uploadDir, { recursive: true });
                }

                // Generar nombre único para el archivo
                const fileExt = nuevaImagen.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = path.join(uploadDir, fileName);

                // Convertir archivo a buffer y guardarlo
                const bytes = await nuevaImagen.arrayBuffer();
                const buffer = Buffer.from(bytes);

                await writeFile(filePath, buffer);

                // Eliminar imagen anterior si existe
                if (productoActual.imagen_url) {
                    try {
                        const oldFilePath = path.join(process.cwd(), 'public', productoActual.imagen_url);
                        await unlink(oldFilePath);
                    } catch (cleanupError) {
                        console.warn("No se pudo eliminar la imagen anterior:", cleanupError);
                    }
                }

                // Generar URL relativa para la base de datos
                imagenUrl = `/uploads/productos/${fileName}`;

            } catch (uploadError) {
                console.error("Error guardando nueva imagen:", uploadError);
                return { success: false, error: "Error al guardar la nueva imagen" };
            }
        }

        // Actualizar el producto en la base de datos
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

            // Si hubo error y se subió nueva imagen, limpiar
            if (nuevaImagen && imagenUrl && imagenUrl !== productoActual.imagen_url) {
                try {
                    const filePath = path.join(process.cwd(), 'public', imagenUrl);
                    await unlink(filePath);
                } catch (cleanupError) {
                    console.error("Error limpiando nueva imagen:", cleanupError);
                }
            }

            return {
                success: false,
                error: `Error actualizando producto: ${updateError.message}`
            };
        }

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
        return {
            success: false,
            error: "Error interno del servidor"
        };
    }
}