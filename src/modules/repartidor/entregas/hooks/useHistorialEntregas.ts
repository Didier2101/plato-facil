"use client";

import { useState, useCallback, useEffect } from 'react';
import { obtenerMisDomiciliosAction } from '../actions/obtenerMisDomiciliosAction';
import type { EntregaRepartidor, EstadisticasRepartidor } from '../types/entrega';

export function useHistorialEntregas(usuarioId: string) {
    const [domicilios, setDomicilios] = useState<EntregaRepartidor[]>([]);
    const [estadisticas, setEstadisticas] = useState<EstadisticasRepartidor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarHistorial = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await obtenerMisDomiciliosAction(usuarioId);

            if (result.success && result.datos) {
                setDomicilios(result.datos.domicilios as any);
                setEstadisticas(result.datos.estadisticas);
            } else {
                setError(result.error || 'Error al cargar el historial');
            }
        } catch (_err) {
            setError('Error inesperado al cargar el historial');
        } finally {
            setLoading(false);
        }
    }, [usuarioId]);

    useEffect(() => {
        if (usuarioId) {
            cargarHistorial();
        }
    }, [usuarioId, cargarHistorial]);

    return {
        domicilios,
        estadisticas,
        loading,
        error,
        cargarHistorial
    };
}
