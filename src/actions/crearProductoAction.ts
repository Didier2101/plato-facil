"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";


// Tipos para mejor manejo de errores
interface ProductoCreado {
    id: number;
    nombre: string;
    categoria_id: string;
    descripcion: string | null;
    precio: number;
    imagen_url: string | null;
    activo: boolean;
    created_at: string;
}

interface CrearProductoResult {
    success: boolean;
    error?: string;
    producto?: ProductoCreado;
}

export async function crearProductoAction(formData: FormData): Promise<CrearProductoResult> {
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

        // 🔹 Procesar imagen con Supabase Storage - MEJORADO
        let imagenUrl: string | null = null;
        if (imagen && imagen.size > 0) {
            console.log("Procesando imagen:", {
                name: imagen.name,
                size: imagen.size,
                type: imagen.type,
                lastModified: imagen.lastModified
            });

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
                const fileExt = imagen.name.split(".").pop()?.toLowerCase() || 'jpg';
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substring(2);
                const fileName = `producto-${timestamp}-${randomId}.${fileExt}`;

                console.log("Intentando subir imagen:", fileName);

                // Verificar bucket existe y obtener info
                try {
                    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
                    console.log("Buckets disponibles:", buckets?.map(b => b.name));

                    if (bucketsError) {
                        console.error("Error listando buckets:", bucketsError);
                    }
                } catch (bucketCheckError) {
                    console.error("Error verificando buckets:", bucketCheckError);
                }

                // Convertir File a ArrayBuffer con validación adicional
                const arrayBuffer = await imagen.arrayBuffer();

                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    return { success: false, error: "Error al procesar el archivo de imagen" };
                }

                console.log("ArrayBuffer creado:", { byteLength: arrayBuffer.byteLength });

                // Intentar crear el bucket si no existe (solo en desarrollo)
                if (process.env.NODE_ENV === 'development') {
                    try {
                        const { error: createBucketError } = await supabaseAdmin.storage
                            .createBucket('productos', {
                                public: true,
                                allowedMimeTypes: allowedTypes,
                                fileSizeLimit: maxSize
                            });

                        if (createBucketError && !createBucketError.message.includes('already exists')) {
                            console.error("Error creando bucket:", createBucketError);
                        }
                    } catch (createError) {
                        console.log("Bucket probablemente ya existe:", createError);
                    }
                }

                // Subir a Supabase Storage con configuración mejorada
                const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                    .from('productos')
                    .upload(fileName, arrayBuffer, {
                        contentType: imagen.type,
                        cacheControl: '3600',
                        upsert: false,
                        duplex: 'half' // Agregar esta opción para compatibilidad
                    });

                if (uploadError) {
                    console.error("Error detallado al subir imagen:", {
                        message: uploadError.message,
                        error: uploadError
                    });

                    // Mensajes de error más específicos basados en el mensaje
                    let errorMessage = "Error al subir la imagen";

                    if (uploadError.message.includes('Bucket not found')) {
                        errorMessage = "El bucket 'productos' no existe en Supabase Storage";
                    } else if (uploadError.message.includes('not allowed') || uploadError.message.includes('permission')) {
                        errorMessage = "No tienes permisos para subir archivos. Verifica las políticas RLS.";
                    } else if (uploadError.message.includes('size') || uploadError.message.includes('large')) {
                        errorMessage = "El archivo es demasiado grande";
                    } else if (uploadError.message.includes('mime') || uploadError.message.includes('type')) {
                        errorMessage = "Tipo de archivo no permitido";
                    } else if (uploadError.message.includes('duplicate') || uploadError.message.includes('exists')) {
                        errorMessage = "Ya existe un archivo con ese nombre";
                    } else {
                        errorMessage = `Error de Storage: ${uploadError.message}`;
                    }

                    return { success: false, error: errorMessage };
                }

                console.log("Upload data:", uploadData);

                // Obtener URL pública con manejo de errores
                const { data: urlData } = supabaseAdmin.storage
                    .from('productos')
                    .getPublicUrl(fileName);

                if (!urlData?.publicUrl) {
                    console.error("No se pudo obtener URL pública");
                    return { success: false, error: "Error al obtener URL de la imagen" };
                }

                imagenUrl = urlData.publicUrl;
                console.log("Imagen subida exitosamente:", {
                    fileName,
                    url: imagenUrl,
                    path: uploadData?.path
                });

            } catch (uploadError) {
                console.error("Error procesando imagen (catch):", uploadError);

                // Error más específico basado en el tipo de error
                if (uploadError instanceof TypeError) {
                    return { success: false, error: "Error de conexión al subir la imagen" };
                } else if (uploadError instanceof Error) {
                    return { success: false, error: `Error al procesar imagen: ${uploadError.message}` };
                }

                return { success: false, error: "Error desconocido al procesar la imagen" };
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
                        .remove([fileName])
                        .catch(cleanupError => {
                            console.error("Error limpiando imagen:", cleanupError);
                        });
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
                            .remove([fileName])
                            .catch(cleanupError => {
                                console.error("Error limpiando imagen en rollback:", cleanupError);
                            });
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

// 🔧 Función auxiliar para diagnosticar problemas de Storage
export async function diagnosticarStorageAction(): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    bucket?: {
        name: string;
        public: boolean;
        file_size_limit?: number;
        allowed_mime_types?: string[];
    };
    buckets?: string[];
    fileCount?: number;
}> {
    try {
        console.log("=== DIAGNÓSTICO DE STORAGE ===");

        // Verificar conexión con Supabase
        const { data, error } = await supabaseAdmin.auth.getUser();
        console.log("Auth status:", { hasUser: !!data.user, error });

        // Listar buckets disponibles
        const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
        console.log("Buckets disponibles:", buckets?.map(b => ({
            name: b.name,
            public: b.public,
            file_size_limit: b.file_size_limit,
            allowed_mime_types: b.allowed_mime_types
        })));

        if (bucketsError) {
            console.error("Error listando buckets:", bucketsError);
            return { success: false, error: `Error accediendo a Storage: ${bucketsError.message}` };
        }

        // Verificar si existe el bucket 'productos'
        const productosBucket = buckets?.find(b => b.name === 'productos');
        if (!productosBucket) {
            console.error("Bucket 'productos' no encontrado");
            return {
                success: false,
                error: "El bucket 'productos' no existe. Créalo en el panel de Supabase Storage.",
                buckets: buckets?.map(b => b.name) || []
            };
        }

        // Intentar listar archivos en el bucket
        const { data: files, error: filesError } = await supabaseAdmin.storage
            .from('productos')
            .list('', { limit: 5 });

        if (filesError) {
            console.error("Error listando archivos:", filesError);
            return {
                success: false,
                error: `Error accediendo al bucket: ${filesError.message}`,
                bucket: {
                    name: productosBucket.name,
                    public: productosBucket.public,
                    file_size_limit: productosBucket.file_size_limit,
                    allowed_mime_types: productosBucket.allowed_mime_types
                }
            };
        }

        console.log("Archivos en bucket:", files?.slice(0, 3));

        return {
            success: true,
            message: "Storage configurado correctamente",
            bucket: {
                name: productosBucket.name,
                public: productosBucket.public,
                file_size_limit: productosBucket.file_size_limit,
                allowed_mime_types: productosBucket.allowed_mime_types
            },
            fileCount: files?.length || 0
        };

    } catch (error) {
        console.error("Error en diagnóstico:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
}