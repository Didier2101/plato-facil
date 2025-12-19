// src/modules/dueno/reportes/hooks/useReporteData.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/src/shared/services/toast.service';
import { obtenerReporteSimplificadoAction } from '../actions/obtenerReporteAvanzadoAction';
import type { FiltroReporte, ReporteDatos } from '../types/reportesTypes';

export function useReporteData() {
    const [reporte, setReporte] = useState<ReporteDatos | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const cargarReporte = useCallback(async (filtros: FiltroReporte) => {
        try {
            setLoading(true);
            setError(null);

            const result = await obtenerReporteSimplificadoAction(filtros);

            if (result.success && result.datos) {
                setReporte(result.datos);
            } else if (result.success && !result.datos) {
                setReporte(null);
            } else {
                const errorMsg = result.error || 'No se pudieron cargar los datos';
                setError(errorMsg);
                toast.error('Error', { description: errorMsg });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'No se pudo cargar el reporte';
            setError(errorMsg);
            console.error('Error cargando reporte:', err);
            toast.error('Error', { description: errorMsg });
        } finally {
            setLoading(false);
        }
    }, []);


    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        reporte,
        loading,
        error,
        cargarReporte,
        clearError,
        setReporte
    };
}