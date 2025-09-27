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
    // Campos adicionales para el desglose del costo
    distancia_base_km: number;
    costo_base: number;
    distancia_exceso_km: number;
    costo_exceso: number;
}

interface ConfiguracionRestaurante {
    domicilio_activo: boolean;
    latitud: number;
    longitud: number;
    distancia_maxima_km: number;
    tiempo_preparacion_min: number;
    costo_base_domicilio: number;
    costo_por_km: number;
    distancia_base_km: number; // NUEVO CAMPO
}

export interface ResultadoDomicilio {
    success: boolean;
    direccion?: DireccionGeocoded;
    ruta?: RutaCalculada;
    error?: string;
}

// Función para redondear hacia arriba en múltiplos de 100
function redondearHaciaArriba100(monto: number): number {
    return Math.ceil(monto / 100) * 100;
}

// Función para calcular el costo del domicilio con la nueva lógica
function calcularCostoDomicilio(distancia_km: number, configuracion: ConfiguracionRestaurante) {
    const { distancia_base_km, costo_base_domicilio, costo_por_km } = configuracion;

    // Si la distancia es menor o igual a la distancia base, solo cobrar el costo base
    if (distancia_km <= distancia_base_km) {
        // El costo base ya debería estar redondeado en la configuración, pero por seguridad
        const costo_final = redondearHaciaArriba100(costo_base_domicilio);

        return {
            costo_total: costo_final,
            distancia_base_km: distancia_base_km,
            costo_base: costo_final,
            distancia_exceso_km: 0,
            costo_exceso: 0
        };
    }

    // Si excede la distancia base, cobrar base + exceso por km
    const distancia_exceso = distancia_km - distancia_base_km;
    const costo_exceso_calculado = distancia_exceso * costo_por_km;
    const costo_total_calculado = costo_base_domicilio + costo_exceso_calculado;

    // REDONDEAR HACIA ARRIBA EN MÚLTIPLOS DE 100
    const costo_total_final = redondearHaciaArriba100(costo_total_calculado);

    return {
        costo_total: costo_total_final,
        distancia_base_km: distancia_base_km,
        costo_base: costo_base_domicilio,
        distancia_exceso_km: Math.round(distancia_exceso * 100) / 100,
        costo_exceso: costo_total_final - costo_base_domicilio // El exceso real cobrado
    };
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

// Geocodificar coordenadas inversamente (obtener dirección de coordenadas)
async function geocodificarInverso(coordenadas: Coordenadas): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordenadas.lat}&lon=${coordenadas.lng}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'RestauranteApp/1.0'
                }
            }
        );

        const data = await response.json();

        if (data && data.display_name) {
            return data.display_name;
        }

        // Fallback si no se puede obtener dirección
        return `Ubicación: ${coordenadas.lat.toFixed(4)}, ${coordenadas.lng.toFixed(4)}`;

    } catch (error) {
        console.error('Error en geocodificación inversa:', error);
        return `Ubicación: ${coordenadas.lat.toFixed(4)}, ${coordenadas.lng.toFixed(4)}`;
    }
}

// Calcular ruta usando OpenRouteService o fallback local
async function calcularRutaDetallada(
    origen: Coordenadas,
    destino: Coordenadas,
    configuracion: ConfiguracionRestaurante
): Promise<RutaCalculada | null> {
    try {
        // Calcular distancia directa primero
        const distanciaDirecta = calcularDistanciaHaversine(origen, destino);

        if (distanciaDirecta > configuracion.distancia_maxima_km) {
            const costoDomicilio = calcularCostoDomicilio(distanciaDirecta, configuracion);
            return {
                distancia_km: Math.round(distanciaDirecta * 100) / 100,
                duracion_minutos: Math.round(distanciaDirecta * 3),
                costo_domicilio: 0, // Sin costo si está fuera de cobertura
                fuera_de_cobertura: true,
                distancia_base_km: costoDomicilio.distancia_base_km,
                costo_base: costoDomicilio.costo_base,
                distancia_exceso_km: costoDomicilio.distancia_exceso_km,
                costo_exceso: costoDomicilio.costo_exceso
            };
        }

        // Intentar OpenRouteService para ruta real
        let distancia_km = distanciaDirecta;
        let duracion_minutos = Math.round(distanciaDirecta * 3);

        try {
            const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
                method: 'POST',
                headers: {
                    'Authorization': '5b3ce3597851110001cf62489a1a1b4e8b6c4b0b8f5d4d8e8c8b8e8b',
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
                distancia_km = route.summary.distance / 1000;
                duracion_minutos = Math.round(route.summary.duration / 60);
            }
        } catch (orsError) {
            console.warn('OpenRouteService falló, usando fallback:', orsError);
            // Usar distancia directa con factor de corrección
            distancia_km = distanciaDirecta * 1.3;
        }

        // Calcular costo con la nueva lógica
        const costoDomicilio = calcularCostoDomicilio(distancia_km, configuracion);

        return {
            distancia_km: Math.round(distancia_km * 100) / 100,
            duracion_minutos: duracion_minutos + configuracion.tiempo_preparacion_min,
            costo_domicilio: costoDomicilio.costo_total,
            fuera_de_cobertura: false,
            distancia_base_km: costoDomicilio.distancia_base_km,
            costo_base: costoDomicilio.costo_base,
            distancia_exceso_km: costoDomicilio.distancia_exceso_km,
            costo_exceso: costoDomicilio.costo_exceso
        };

    } catch (error) {
        console.error('Error calculando ruta:', error);
        return null;
    }
}

// Action principal para calcular domicilio por dirección (mantenido para compatibilidad)
export async function calcularDomicilioAction(direccion: string): Promise<ResultadoDomicilio> {
    try {
        // 1. Obtener configuración del restaurante (ahora incluyendo distancia_base_km)
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

// ACTION PRINCIPAL para calcular domicilio por coordenadas directamente (usado por MapaUbicacion)
export async function calcularDomicilioPorCoordenadasAction(coordenadas: Coordenadas): Promise<ResultadoDomicilio> {
    try {
        // Validar coordenadas básicas
        if (!coordenadas || !coordenadas.lat || !coordenadas.lng) {
            return {
                success: false,
                error: 'Las coordenadas proporcionadas no son válidas.'
            };
        }

        // Verificar que las coordenadas estén en un rango razonable para Bogotá
        if (coordenadas.lat < 4.0 || coordenadas.lat > 5.0 || coordenadas.lng > -73.5 || coordenadas.lng < -74.5) {
            return {
                success: false,
                error: 'Las coordenadas están fuera del área de servicio (Bogotá y alrededores).'
            };
        }

        // 1. Obtener configuración del restaurante (ahora incluyendo distancia_base_km)
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

        // 2. Obtener dirección de las coordenadas (geocodificación inversa) - opcional para mostrar
        const direccion_formateada = await geocodificarInverso(coordenadas);

        const direccionGeocoded: DireccionGeocoded = {
            direccion_formateada,
            coordenadas
        };

        // 3. Calcular ruta desde el restaurante
        const origen: Coordenadas = {
            lat: configuracion.latitud,
            lng: configuracion.longitud
        };

        const ruta = await calcularRutaDetallada(origen, coordenadas, configuracion);
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
        console.error('Error calculando domicilio por coordenadas:', error);
        return {
            success: false,
            error: 'Error interno calculando el costo de domicilio'
        };
    }
}

// Obtener configuración del restaurante (helper para el frontend) - ACTUALIZADO
export async function obtenerConfiguracionRestauranteAction() {
    try {
        const { data: configuracion, error: configError } = await supabaseAdmin
            .from('configuracion_restaurante')
            .select('nombre_restaurante, latitud, longitud, domicilio_activo, distancia_maxima_km, costo_base_domicilio, costo_por_km, distancia_base_km')
            .single();

        if (configError || !configuracion) {
            return {
                success: false,
                error: 'No se encontró la configuración del restaurante.'
            };
        }

        return {
            success: true,
            configuracion
        };

    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        return {
            success: false,
            error: 'Error interno obteniendo la configuración'
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