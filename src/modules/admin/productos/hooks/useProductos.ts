// src/modules/admin/productos/hooks/useProductos.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { obtenerProductosAction } from '../actions/obtenerProductosAction';
import { actualizarProductoAction, type DatosActualizacion } from '../actions/actualizarProductoAction';
import { desactivarProductoAction } from '../actions/desactivarProductoAction';
import type { ProductoFrontend } from '../types/producto';
import { toast } from '@/src/shared/services/toast.service';

export interface UseProductosReturn {
    productos: ProductoFrontend[];
    loading: boolean;
    error: string | null;
    cargarProductos: () => Promise<void>;
    actualizarProducto: (id: string, data: Partial<ProductoFrontend>) => Promise<{ success: boolean }>;
    desactivarProducto: (id: string, activo: boolean) => Promise<{ success: boolean }>;
    clearError: () => void;
    refresh: () => void;
}

export function useProductos(): UseProductosReturn {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const cargarProductos = useCallback(async () => {
        setLoading(true);
        clearError();

        try {
            const result = await obtenerProductosAction();

            if (result.success && result.productos) {
                setProductos(result.productos);
            } else {
                const errorMessage = result.error || 'Error al cargar productos';
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
            console.error('Error cargando productos:', err);
        } finally {
            setLoading(false);
        }
    }, [clearError]);

    const actualizarProducto = useCallback(async (id: string, data: Partial<ProductoFrontend>): Promise<{ success: boolean }> => {
        try {
            // Mapear Partial<ProductoFrontend> a lo que espera la acción si no es FormData
            const datos: DatosActualizacion = {
                nombre: data.nombre || '',
                descripcion: data.descripcion || '',
                precio: data.precio || 0,
                activo: data.activo ?? true,
                categoria_id: data.categoria_id
            };

            const result = await actualizarProductoAction(id, datos);

            if (result.success) {
                // Actualizar lista localmente
                setProductos(prev => prev.map(p =>
                    p.id === id ? { ...p, ...data } : p
                ));

                toast.success('¡Producto actualizado!', {
                    description: 'Los cambios se han guardado correctamente',
                    duration: 3000,
                });

                return { success: true };
            } else {
                const errorMessage = result.error || 'Error al actualizar producto';
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
            console.error('Error actualizando producto:', err);
            return { success: false };
        }
    }, []);

    const desactivarProducto = useCallback(async (id: string, activo: boolean): Promise<{ success: boolean }> => {
        try {
            const result = await desactivarProductoAction(id, activo);

            if (result.success) {
                // Actualizar estado localmente
                setProductos(prev => prev.map(p =>
                    p.id === id ? { ...p, activo } : p
                ));

                const action = activo ? 'activado' : 'desactivado';
                toast.success(`Producto ${action}`, {
                    description: `El producto ha sido ${action} correctamente`,
                    duration: 3000,
                });

                return { success: true };
            } else {
                const errorMessage = result.error || 'Error al cambiar estado del producto';
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
            console.error('Error cambiando estado del producto:', err);
            return { success: false };
        }
    }, []);

    // Cargar productos cuando cambia el trigger
    useEffect(() => {
        cargarProductos();
    }, [refreshTrigger, cargarProductos]);

    return {
        productos,
        loading,
        error,
        cargarProductos,
        actualizarProducto,
        desactivarProducto,
        clearError,
        refresh,
    };
}