// src/modules/dueno/configuraciones/hooks/useConfiguracion.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { obtenerConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';
import type { ConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';
import { toast } from '@/src/shared/services/toast.service';

export interface UseConfiguracionReturn {
    configuracion: ConfiguracionRestaurante | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    setConfiguracion: React.Dispatch<React.SetStateAction<ConfiguracionRestaurante | null>>;
}

export function useConfiguracion(): UseConfiguracionReturn {
    const [configuracion, setConfiguracion] = useState<ConfiguracionRestaurante | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarConfiguracion = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const resultado = await obtenerConfiguracionRestaurante();

            if (resultado.success) {
                if (resultado.configuracion) {
                    setConfiguracion(resultado.configuracion);
                } else {
                    // Configuración por defecto si no existe
                    const configuracionDefault: ConfiguracionRestaurante = {
                        nombre_restaurante: '',
                        logo_url: '',
                        telefono: '',
                        email: '',
                        direccion_completa: '',
                        costo_base_domicilio: 3000,
                        costo_por_km: 1500,
                        distancia_base_km: 2,
                        distancia_maxima_km: 10,
                        tiempo_preparacion_min: 20,
                        latitud: 4.7110,
                        longitud: -74.0721,
                        hora_apertura: '08:00',
                        hora_cierre: '22:00',
                        domicilio_activo: true,
                        establecimiento_activo: true
                    };
                    setConfiguracion(configuracionDefault);
                }
            } else {
                const errorMessage = resultado.error || 'Error al cargar la configuración';
                setError(errorMessage);
                toast.error('Error al cargar configuración', {
                    description: errorMessage,
                    duration: 4000,
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
            console.error('Error cargando configuración:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarConfiguracion();
    }, [cargarConfiguracion]);

    const refresh = useCallback(async () => {
        await cargarConfiguracion();
    }, [cargarConfiguracion]);

    return {
        configuracion,
        loading,
        error,
        refresh,
        setConfiguracion
    };
}