// src/hooks/useDomicilioCalculator.ts
import { useState, useCallback } from 'react';
import { calcularDomicilioAction } from '@/src/modules/cliente/domicilios/actions/calculoDomicilioAction';

// Tipos para el hook


interface Coordenadas {
    lat: number;
    lng: number;
}

interface RutaCalculada {
    distancia_km: number;
    duracion_minutos: number;
    costo_domicilio: number;
    fuera_de_cobertura: boolean;
}

interface DireccionGeocoded {
    direccion_formateada: string;
    coordenadas: Coordenadas;
    ciudad?: string;
    barrio?: string;
}

interface ResultadoCalculo {
    success: boolean;
    direccion?: DireccionGeocoded;
    ruta?: RutaCalculada;
    error?: string;
}

export function useDomicilioCalculator() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rutaActual, setRutaActual] = useState<RutaCalculada | null>(null);
    const [direccionActual, setDireccionActual] = useState<DireccionGeocoded | null>(null);

    // Función principal para calcular domicilio
    const calcularDomicilio = useCallback(async (direccion: string): Promise<ResultadoCalculo> => {
        setLoading(true);
        setError(null);
        setRutaActual(null);
        setDireccionActual(null);

        try {
            // Llamar al action que creamos
            const resultado = await calcularDomicilioAction(direccion);

            if (resultado.success && resultado.direccion && resultado.ruta) {
                setDireccionActual(resultado.direccion);
                setRutaActual(resultado.ruta);

                return {
                    success: true,
                    direccion: resultado.direccion,
                    ruta: resultado.ruta
                };
            } else {
                const errorMsg = resultado.error || 'Error calculando domicilio';
                setError(errorMsg);
                return {
                    success: false,
                    error: errorMsg
                };
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado calculando domicilio';
            setError(errorMsg);
            return {
                success: false,
                error: errorMsg
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar cálculo actual
    const limpiarCalculo = useCallback(() => {
        setRutaActual(null);
        setDireccionActual(null);
        setError(null);
    }, []);

    // Validar si una dirección está dentro de cobertura (sin calcular ruta completa)
    const validarCobertura = useCallback(async (direccion: string): Promise<boolean> => {
        try {
            const resultado = await calcularDomicilioAction(direccion);
            return resultado.success && resultado.ruta ? !resultado.ruta.fuera_de_cobertura : false;
        } catch {
            return false;
        }
    }, []);

    return {
        // Estados
        loading,
        error,
        rutaActual,
        direccionActual,

        // Funciones
        calcularDomicilio,
        limpiarCalculo,
        validarCobertura,

        // Datos computados
        tieneRutaCalculada: !!rutaActual && !!direccionActual,
        estaDentroDeCobertura: rutaActual ? !rutaActual.fuera_de_cobertura : null
    };
}