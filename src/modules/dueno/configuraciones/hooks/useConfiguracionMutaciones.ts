// src/modules/dueno/configuraciones/hooks/useConfiguracionMutaciones.ts
'use client';

import { useState, useCallback } from 'react';
import { guardarConfiguracionRestaurante, toggleDomicilio, toggleEstablecimiento, type ConfiguracionRestaurante, type ResultadoConfiguracion } from '../actions/configuracionRestauranteActions';
import { toast } from '@/src/shared/services/toast.service';

export interface UseConfiguracionMutacionesReturn {
    guardarConfiguracion: (configuracion: ConfiguracionRestaurante) => Promise<ResultadoConfiguracion>;
    toggleServicio: (tipo: 'domicilio' | 'establecimiento', activo: boolean) => Promise<ResultadoConfiguracion>;
    saving: boolean;
    error: string | null;
    resetError: () => void;
}

export function useConfiguracionMutaciones(): UseConfiguracionMutacionesReturn {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    const guardarConfiguracion = useCallback(async (configuracion: ConfiguracionRestaurante) => {
        resetError();
        setSaving(true);

        try {
            // Prepara los datos para enviar (sin el id)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...configuracionData } = configuracion;

            const resultado = await guardarConfiguracionRestaurante(configuracionData);

            if (resultado.success) {
                toast.success('¡Configuración guardada!', {
                    description: 'La configuración se ha guardado correctamente',
                    duration: 3000,
                });
            } else {
                const errorMessage = resultado.error || 'Error desconocido al guardar la configuración';
                setError(errorMessage);
                toast.error('Error al guardar', {
                    description: errorMessage,
                    duration: 4000,
                });
            }

            return resultado;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setSaving(false);
        }
    }, [resetError]);

    const toggleServicio = useCallback(async (tipo: 'domicilio' | 'establecimiento', activo: boolean) => {
        resetError();
        setSaving(true);
        try {
            let resultado;
            if (tipo === 'domicilio') {
                resultado = await toggleDomicilio(activo);
            } else {
                resultado = await toggleEstablecimiento(activo);
            }

            if (resultado.success) {
                toast.success('Servicio actualizado', {
                    description: `Se ha ${activo ? 'activado' : 'desactivado'} el servicio de ${tipo}`,
                    duration: 3000,
                });
            } else {
                const errorMessage = resultado.error || 'Error al actualizar servicio';
                setError(errorMessage);
                toast.error('Error', { description: errorMessage });
            }
            return resultado;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            toast.error('Error', { description: errorMessage });
            return { success: false, error: errorMessage };
        } finally {
            setSaving(false);
        }
    }, [resetError]);

    return {
        guardarConfiguracion,
        toggleServicio,
        saving,
        error,
        resetError,
    };
}