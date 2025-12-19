'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/src/shared/services/toast.service';
import { obtenerIngredientesAction } from '../actions/obtenerIngredientesAction';
import { crearIngredienteAction, type CrearIngredienteInput } from '../actions/crearIngredienteAction';
import { actualizarIngredienteAction, type ActualizarIngredienteInput } from '../actions/actualizarIngredienteAction';
import { desactivarIngredienteAction } from '../actions/desactivarIngredienteAction';
import type { IngredienteFrontend } from '../types/producto';

export interface UseIngredientesReturn {
    ingredientes: IngredienteFrontend[];
    loading: boolean;
    error: string | null;
    cargarIngredientes: (filtro?: { soloActivos?: boolean }) => Promise<void>;
    crearIngrediente: (data: CrearIngredienteInput) => Promise<{ success: boolean; ingrediente?: IngredienteFrontend }>;
    actualizarIngrediente: (id: string, data: ActualizarIngredienteInput) => Promise<{ success: boolean }>;
    desactivarIngrediente: (id: string, activo: boolean) => Promise<{ success: boolean }>;
    clearError: () => void;
    refresh: () => void;
}

export function useIngredientes(): UseIngredientesReturn {
    const [ingredientes, setIngredientes] = useState<IngredienteFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const cargarIngredientes = useCallback(async (filtro?: { soloActivos?: boolean }) => {
        setLoading(true);
        clearError();

        try {
            const result = await obtenerIngredientesAction(filtro);

            if (result.success && result.ingredientes) {
                setIngredientes(result.ingredientes);
            } else {
                const errorMessage = result.error || 'Error al cargar ingredientes';
                setError(errorMessage);
                toast.error('Error', {
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
            console.error('Error cargando ingredientes:', err);
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const crearIngrediente = useCallback(async (data: CrearIngredienteInput): Promise<{ success: boolean; ingrediente?: IngredienteFrontend }> => {
        try {
            const result = await crearIngredienteAction(data);

            if (result.success && result.ingrediente) {
                // Actualizar lista localmente
                setIngredientes(prev => [...prev, result.ingrediente!]);

                toast.success('¡Ingrediente creado!', {
                    description: result.message || 'El ingrediente se ha creado correctamente',
                    duration: 3000,
                });

                return { success: true, ingrediente: result.ingrediente };
            } else {
                const errorMessage = result.error || 'Error al crear ingrediente';
                toast.error('Error', {
                    description: errorMessage,
                    duration: 4000,
                });
                return { success: false };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
            console.error('Error creando ingrediente:', err);
            return { success: false };
        }
    }, []);

    const actualizarIngrediente = useCallback(async (id: string, data: ActualizarIngredienteInput): Promise<{ success: boolean }> => {
        try {
            const result = await actualizarIngredienteAction(id, data);

            if (result.success) {
                // Actualizar lista localmente
                setIngredientes(prev => prev.map(ingrediente =>
                    ingrediente.id === id ? { ...ingrediente, ...data } : ingrediente
                ));

                toast.success('¡Ingrediente actualizado!', {
                    description: result.message || 'Los cambios se han guardado correctamente',
                    duration: 3000,
                });

                return { success: true };
            } else {
                const errorMessage = result.error || 'Error al actualizar ingrediente';
                toast.error('Error', {
                    description: errorMessage,
                    duration: 4000,
                });
                return { success: false };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
            console.error('Error actualizando ingrediente:', err);
            return { success: false };
        }
    }, []);

    const desactivarIngrediente = useCallback(async (id: string, activo: boolean): Promise<{ success: boolean }> => {
        try {
            const result = await desactivarIngredienteAction(id, activo);

            if (result.success) {
                // Actualizar estado localmente
                setIngredientes(prev => prev.map(ingrediente =>
                    ingrediente.id === id ? { ...ingrediente, activo } : ingrediente
                ));

                const action = activo ? 'activado' : 'desactivado';
                toast.success(`Ingrediente ${action}`, {
                    description: `El ingrediente ha sido ${action} correctamente`,
                    duration: 3000,
                });

                return { success: true };
            } else {
                const errorMessage = result.error || 'Error al cambiar estado del ingrediente';
                toast.error('Error', {
                    description: errorMessage,
                    duration: 4000,
                });
                return { success: false };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
            console.error('Error cambiando estado del ingrediente:', err);
            return { success: false };
        }
    }, []);

    // Cargar ingredientes cuando cambia el trigger
    useEffect(() => {
        cargarIngredientes();
    }, [refreshTrigger, cargarIngredientes]);

    return {
        ingredientes,
        loading,
        error,
        cargarIngredientes,
        crearIngrediente,
        actualizarIngrediente,
        desactivarIngrediente,
        clearError,
        refresh,
    };
}