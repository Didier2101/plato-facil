// src/actions/calculoDomicilioAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Tipos
interface Coordenadas {
    lat: number;
    lng: number;
}

interface DireccionGeocoded {
    direccion_formateada: string;
    coordenadas: Coordenadas;
    ciudad?: string;
    barrio?: string;
}

interface RutaCalculada {
    distancia_km: number;
    duracion_minutos: number;
    costo_domicilio: number;
    fuera_de_cobertura: boolean;
}

// Add proper type for configuracion
interface ConfiguracionRestaurante {
    domicilio_activo: boolean;
    latitud: number;
    longitud: number;
    distancia_maxima_km: number;
    tiempo_preparacion_min: number;
    costo_base_domicilio: number;
    costo_por_km: number;
}

export interface ResultadoDomicilio {
    success: boolean;
    direccion?: DireccionGeocoded;
    ruta?: RutaCalculada;
    error?: string;
}

// Calcular distancia usando fórmula de Haversine (sin API)
function calcularDistanciaHaversine(punto1: Coordenadas, punto2: Coordenadas): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (punto2.lat - punto1.lat) * Math.PI / 180;
    const dLon = (punto2.lng - punto1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(punto1.lat * Math.PI / 180) * Math.cos(punto2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Geocodificar dirección usando Nominatim (OpenStreetMap) - GRATIS
async function geocodificarDireccion(direccion: string): Promise<DireccionGeocoded | null> {
    try {
        // Verificar cache primero
        const { data: cached } = await supabaseAdmin
            .from('cache_direcciones')
            .select('*')
            .eq('direccion_original', direccion)
            .single();

        if (cached) {
            return {
                direccion_formateada: cached.direccion_formateada,
                coordenadas: {
                    lat: cached.latitud,
                    lng: cached.longitud
                }
            };
        }

        // Si no está en cache, geocodificar con Nominatim
        const query = encodeURIComponent(`${direccion}, Bogotá, Colombia`);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'RestauranteApp/1.0'
                }
            }
        );

        const data = await response.json();

        if (data.length === 0) {
            return null;
        }

        const resultado = data[0];
        const direccionGeocoded: DireccionGeocoded = {
            direccion_formateada: resultado.display_name,
            coordenadas: {
                lat: parseFloat(resultado.lat),
                lng: parseFloat(resultado.lon)
            },
            ciudad: resultado.address?.city || resultado.address?.town || 'Bogotá',
            barrio: resultado.address?.neighbourhood || resultado.address?.suburb
        };

        // Guardar en cache para futuras consultas
        await supabaseAdmin
            .from('cache_direcciones')
            .insert({
                direccion_original: direccion,
                direccion_formateada: direccionGeocoded.direccion_formateada,
                latitud: direccionGeocoded.coordenadas.lat,
                longitud: direccionGeocoded.coordenadas.lng
            })
            .select()
            .single();

        return direccionGeocoded;

    } catch (error) {
        console.error('Error geocodificando dirección:', error);
        return null;
    }
}

// Calcular ruta usando OpenRouteService - GRATIS (2000/día)
async function calcularRutaDetallada(
    origen: Coordenadas,
    destino: Coordenadas,
    configuracion: ConfiguracionRestaurante // Fixed: replaced 'any' with proper type
): Promise<RutaCalculada | null> {
    try {
        // Verificar cache primero
        const direccionDestino = `${destino.lat},${destino.lng}`;
        const { data: cached } = await supabaseAdmin
            .from('cache_rutas')
            .select('*')
            .eq('direccion_destino', direccionDestino)
            .single();

        if (cached) {
            return {
                distancia_km: cached.distancia_km,
                duracion_minutos: cached.duracion_minutos,
                costo_domicilio: cached.costo_domicilio,
                fuera_de_cobertura: cached.fuera_cobertura
            };
        }

        // Calcular distancia directa primero
        const distanciaDirecta = calcularDistanciaHaversine(origen, destino);

        if (distanciaDirecta > configuracion.distancia_maxima_km) {
            const resultado: RutaCalculada = {
                distancia_km: Math.round(distanciaDirecta * 100) / 100,
                duracion_minutos: Math.round(distanciaDirecta * 3),
                costo_domicilio: 0,
                fuera_de_cobertura: true
            };

            // Guardar en cache
            await supabaseAdmin
                .from('cache_rutas')
                .insert({
                    direccion_destino: direccionDestino,
                    distancia_km: resultado.distancia_km,
                    duracion_minutos: resultado.duracion_minutos,
                    costo_domicilio: resultado.costo_domicilio,
                    fuera_cobertura: resultado.fuera_de_cobertura
                });

            return resultado;
        }

        // Intentar OpenRouteService
        try {
            const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
                method: 'POST',
                headers: {
                    'Authorization': '5b3ce3597851110001cf62489a1a1b4e8b6c4b0b8f5d4d8e8c8b8e8b', // API key pública gratuita
                    'Content-Type': 'application/json',
                    'User-Agent': 'RestauranteApp/1.0'
                },
                body: JSON.stringify({
                    coordinates: [[origen.lng, origen.lat], [destino.lng, destino.lat]],
                    format: 'json'
                })
            });

            if (response.ok) {
                const data = await response.json();
                const route = data.routes[0];
                const distancia_km = route.summary.distance / 1000;
                const duracion_minutos = Math.round(route.summary.duration / 60);

                const resultado: RutaCalculada = {
                    distancia_km: Math.round(distancia_km * 100) / 100,
                    duracion_minutos: duracion_minutos + configuracion.tiempo_preparacion_min,
                    costo_domicilio: configuracion.costo_base_domicilio + (distancia_km * configuracion.costo_por_km),
                    fuera_de_cobertura: false
                };

                // Guardar en cache
                await supabaseAdmin
                    .from('cache_rutas')
                    .insert({
                        direccion_destino: direccionDestino,
                        distancia_km: resultado.distancia_km,
                        duracion_minutos: resultado.duracion_minutos,
                        costo_domicilio: resultado.costo_domicilio,
                        fuera_cobertura: resultado.fuera_de_cobertura
                    });

                return resultado;
            }
        } catch (orsError) {
            console.warn('OpenRouteService falló, usando fallback:', orsError);
        }

        // Fallback: usar distancia directa con factor de corrección
        const distanciaEstimada = distanciaDirecta * 1.3; // Factor de corrección para calles
        const resultado: RutaCalculada = {
            distancia_km: Math.round(distanciaEstimada * 100) / 100,
            duracion_minutos: Math.round(distanciaEstimada * 3) + configuracion.tiempo_preparacion_min,
            costo_domicilio: configuracion.costo_base_domicilio + (distanciaEstimada * configuracion.costo_por_km),
            fuera_de_cobertura: false
        };

        // Guardar en cache
        await supabaseAdmin
            .from('cache_rutas')
            .insert({
                direccion_destino: direccionDestino,
                distancia_km: resultado.distancia_km,
                duracion_minutos: resultado.duracion_minutos,
                costo_domicilio: resultado.costo_domicilio,
                fuera_cobertura: resultado.fuera_de_cobertura
            });

        return resultado;

    } catch (error) {
        console.error('Error calculando ruta:', error);
        return null;
    }
}

// Action principal para calcular domicilio
export async function calcularDomicilioAction(direccion: string): Promise<ResultadoDomicilio> {
    try {
        // 1. Obtener configuración del restaurante
        const { data: configuracion, error: configError } = await supabaseAdmin
            .from('configuracion_restaurante')
            .select('*')
            .single();

        if (configError || !configuracion) {
            return {
                success: false,
                error: 'No se encontró la configuración del restaurante. Configure los datos primero.'
            };
        }

        if (!configuracion.domicilio_activo) {
            return {
                success: false,
                error: 'El servicio de domicilio está desactivado actualmente.'
            };
        }

        // 2. Geocodificar dirección del cliente
        const direccionGeocoded = await geocodificarDireccion(direccion);
        if (!direccionGeocoded) {
            return {
                success: false,
                error: 'No se pudo encontrar la dirección especificada. Verifica que sea correcta.'
            };
        }

        // 3. Calcular ruta desde el restaurante
        const origen: Coordenadas = {
            lat: configuracion.latitud,
            lng: configuracion.longitud
        };

        const ruta = await calcularRutaDetallada(origen, direccionGeocoded.coordenadas, configuracion);
        if (!ruta) {
            return {
                success: false,
                error: 'No se pudo calcular la ruta de entrega. Intenta más tarde.'
            };
        }

        return {
            success: true,
            direccion: direccionGeocoded,
            ruta
        };

    } catch (error) {
        console.error('Error calculando domicilio:', error);
        return {
            success: false,
            error: 'Error interno calculando el domicilio'
        };
    }
}

// Limpiar cache antiguo (opcional - ejecutar periódicamente)
export async function limpiarCacheAntiguo() {
    try {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30); // 30 días atrás

        await supabaseAdmin
            .from('cache_direcciones')
            .delete()
            .lt('created_at', fechaLimite.toISOString());

        await supabaseAdmin
            .from('cache_rutas')
            .delete()
            .lt('created_at', fechaLimite.toISOString());

        return { success: true };
    } catch (error) {
        console.error('Error limpiando cache:', error);
        return { success: false, error: 'Error limpiando cache' };
    }
}