// src/actions/dueno/configuracionRestauranteActions.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Tipos para la configuración
export interface ConfiguracionRestaurante {
    id?: string;
    nombre_restaurante: string;
    logo_url?: string;
    telefono?: string;
    email?: string;
    direccion_completa: string;
    costo_base_domicilio: number;
    costo_por_km: number;
    distancia_maxima_km: number;
    tiempo_preparacion_min: number;
    latitud: number;
    longitud: number;
    hora_apertura?: string;
    hora_cierre?: string;
    domicilio_activo: boolean;
    establecimiento_activo: boolean;
}

export interface ResultadoConfiguracion {
    success: boolean;
    configuracion?: ConfiguracionRestaurante;
    error?: string;
}

export interface ResultadoSubidaImagen {
    success: boolean;
    url?: string;
    error?: string;
}

// Obtener la configuración actual del restaurante
export async function obtenerConfiguracionRestaurante(): Promise<ResultadoConfiguracion> {
    try {
        const { data: configuracion, error } = await supabaseAdmin
            .from('configuracion_restaurante')
            .select('*')
            .single();

        if (error) {
            // Si no existe configuración, no es un error
            if (error.code === 'PGRST116') {
                return {
                    success: true,
                    configuracion: undefined
                };
            }

            console.error('Error obteniendo configuración:', error);
            return {
                success: false,
                error: `Error al obtener configuración: ${error.message}`
            };
        }

        return {
            success: true,
            configuracion: configuracion as ConfiguracionRestaurante
        };

    } catch (error) {
        console.error('Error inesperado obteniendo configuración:', error);
        return {
            success: false,
            error: 'Error interno al obtener la configuración'
        };
    }
}

// Crear o actualizar la configuración del restaurante
export async function guardarConfiguracionRestaurante(
    configuracion: Omit<ConfiguracionRestaurante, 'id'>
): Promise<ResultadoConfiguracion> {
    try {
        // Verificar si ya existe una configuración
        const { data: existente } = await supabaseAdmin
            .from('configuracion_restaurante')
            .select('id')
            .single();

        let result;

        if (existente) {
            // Actualizar configuración existente
            result = await supabaseAdmin
                .from('configuracion_restaurante')
                .update({
                    ...configuracion,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existente.id)
                .select()
                .single();
        } else {
            // Crear nueva configuración
            result = await supabaseAdmin
                .from('configuracion_restaurante')
                .insert({
                    ...configuracion,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
        }

        if (result.error) {
            console.error('Error guardando configuración:', result.error);
            return {
                success: false,
                error: `Error al guardar configuración: ${result.error.message}`
            };
        }

        return {
            success: true,
            configuracion: result.data as ConfiguracionRestaurante
        };

    } catch (error) {
        console.error('Error inesperado guardando configuración:', error);
        return {
            success: false,
            error: 'Error interno al guardar la configuración'
        };
    }
}

// Subir imagen del logo a Supabase Storage
export async function subirImagenLogo(file: File): Promise<ResultadoSubidaImagen> {
    try {
        // Validar el archivo
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'El archivo debe ser una imagen'
            };
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            return {
                success: false,
                error: 'La imagen debe ser menor a 5MB'
            };
        }

        // Generar un nombre único para el archivo
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-restaurante-${timestamp}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        // Subir archivo a Supabase Storage
        const { error } = await supabaseAdmin.storage
            .from('restaurante-assets') // Necesitas crear este bucket
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error subiendo imagen:', error);
            return {
                success: false,
                error: `Error al subir imagen: ${error.message}`
            };
        }

        // Obtener la URL pública de la imagen
        const { data: urlData } = supabaseAdmin.storage
            .from('restaurante-assets')
            .getPublicUrl(filePath);

        return {
            success: true,
            url: urlData.publicUrl
        };

    } catch (error) {
        console.error('Error inesperado subiendo imagen:', error);
        return {
            success: false,
            error: 'Error interno al subir la imagen'
        };
    }
}

// Actualizar solo algunos campos de la configuración
export async function actualizarConfiguracionParcial(
    campos: Partial<ConfiguracionRestaurante>
): Promise<ResultadoConfiguracion> {
    try {
        const { data: existente } = await supabaseAdmin
            .from('configuracion_restaurante')
            .select('id')
            .single();

        if (!existente) {
            return {
                success: false,
                error: 'No existe configuración para actualizar. Debe crear una configuración primero.'
            };
        }

        const { data: actualizada, error } = await supabaseAdmin
            .from('configuracion_restaurante')
            .update({
                ...campos,
                updated_at: new Date().toISOString()
            })
            .eq('id', existente.id)
            .select()
            .single();

        if (error) {
            console.error('Error actualizando configuración:', error);
            return {
                success: false,
                error: `Error al actualizar configuración: ${error.message}`
            };
        }

        return {
            success: true,
            configuracion: actualizada as ConfiguracionRestaurante
        };

    } catch (error) {
        console.error('Error inesperado actualizando configuración:', error);
        return {
            success: false,
            error: 'Error interno al actualizar la configuración'
        };
    }
}

// Activar/desactivar domicilio
export async function toggleDomicilio(activo: boolean): Promise<ResultadoConfiguracion> {
    return await actualizarConfiguracionParcial({ domicilio_activo: activo });
}

// Activar/desactivar venta en establecimiento
export async function toggleEstablecimiento(activo: boolean): Promise<ResultadoConfiguracion> {
    return await actualizarConfiguracionParcial({ establecimiento_activo: activo });
}