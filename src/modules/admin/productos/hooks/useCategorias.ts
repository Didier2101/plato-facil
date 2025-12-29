// src/modules/admin/productos/hooks/useCategorias.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/src/shared/services/toast.service';
import { obtenerCategoriasAction } from '../actions/obtenerCategoriasAction';
import type { CategoriaFrontend } from '../types/producto';
import { crearCategoriaAction, type CrearCategoriaInput } from '../actions/crearCategoriaAction';
import { actualizarCategoriaAction, type ActualizarCategoriaInput } from '../actions/actualizarCategoriaAction';
import { desactivarCategoriaAction } from '../actions/desactivarCategoriaAction';

export interface UseCategoriasReturn {
    categorias: CategoriaFrontend[];
    loading: boolean;
    error: string | null;
    crearCategoria: (data: CrearCategoriaInput) => Promise<{ success: boolean; categoria?: CategoriaFrontend }>;
    actualizarCategoria: (id: string, data: ActualizarCategoriaInput) => Promise<{ success: boolean }>;
    desactivarCategoria: (id: string, activo: boolean) => Promise<{ success: boolean }>;

    cargarCategorias: () => Promise<void>;
    clearError: () => void;
    refresh: () => void;
}

export function useCategorias(): UseCategoriasReturn {
    const [categorias, setCategorias] = useState<CategoriaFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const cargarCategorias = useCallback(async () => {
        setLoading(true);
        clearError();

        try {
            const result = await obtenerCategoriasAction();

            if (result.success && result.categorias) {
                setCategorias(result.categorias);
            } else {
                const errorMessage = result.error || 'Error al cargar categorías';
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
            console.error('Error cargando categorías:', err);
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const crearCategoria = useCallback(async (data: CrearCategoriaInput): Promise<{ success: boolean; categoria?: CategoriaFrontend }> => {
        setLoading(true);
        clearError();

        try {
            const result = await crearCategoriaAction(data);

            if (result.success && result.categoria) {
                // Agregar nueva categoría a la lista
                setCategorias(prev => [...prev, result.categoria!]);

                toast.success('¡Categoría creada!', {
                    description: `${result.categoria.nombre} ha sido creada exitosamente`,
                    duration: 3000,
                });

                return { success: true, categoria: result.categoria };
            } else {
                const errorMessage = result.error || 'Error al crear categoría';
                setError(errorMessage);
                toast.error('Error', {
                    description: errorMessage,
                    duration: 4000,
                });
                return { success: false };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
            console.error('Error creando categoría:', err);
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const actualizarCategoria = useCallback(async (id: string, data: ActualizarCategoriaInput): Promise<{ success: boolean }> => {
        try {
            const result = await actualizarCategoriaAction(Number(id), data);

            if (result.success) {
                // Actualizar lista localmente
                setCategorias(prev => prev.map(categoria =>
                    categoria.id === id ? { ...categoria, ...data } : categoria
                ));


                toast.success('¡Categoría actualizada!', {
                    description: result.message || 'Los cambios se han guardado correctamente',
                    duration: 3000,
                });

                return { success: true };
            } else {
                const errorMessage = result.error || 'Error al actualizar categoría';
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
            console.error('Error actualizando categoría:', err);
            return { success: false };
        }
    }, []);

    const desactivarCategoria = useCallback(async (id: string, activo: boolean): Promise<{ success: boolean }> => {
        try {
            const result = await desactivarCategoriaAction(Number(id), activo);

            if (result.success) {
                // Actualizar estado localmente
                setCategorias(prev => prev.map(categoria =>
                    categoria.id === id ? { ...categoria, activo } : categoria
                ));


                const action = activo ? 'activada' : 'desactivada';
                toast.success(`Categoría ${action}`, {
                    description: `La categoría ha sido ${action} correctamente`,
                    duration: 3000,
                });

                return { success: true };
            } else {
                const errorMessage = result.error || 'Error al cambiar estado de la categoría';
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
            console.error('Error cambiando estado de la categoría:', err);
            return { success: false };
        }
    }, []);

    // Cargar categorías cuando cambia el trigger
    useEffect(() => {
        cargarCategorias();
    }, [refreshTrigger, cargarCategorias]);

    return {
        categorias,
        loading,
        error,
        crearCategoria,
        actualizarCategoria,
        desactivarCategoria,
        cargarCategorias,
        clearError,
        refresh,
    };
}