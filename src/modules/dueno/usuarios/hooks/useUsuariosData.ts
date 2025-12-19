// src/modules/dueno/usuarios/hooks/useUsuariosData.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/src/shared/services/toast.service';
import { obtenerUsuariosAction } from '../actions/obtenerUsuariosAction';
import type { Usuario } from '../types/usuarioTypes';

export function useUsuariosData() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await obtenerUsuariosAction();

            if (result.success && result.usuarios) {
                setUsuarios(result.usuarios);
            } else if (!result.success) {
                const errorMsg = result.error || 'No se pudieron cargar los usuarios';
                setError(errorMsg);
                toast.error('Error', { description: errorMsg });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMsg);
            console.error('Error cargando usuarios:', err);
            toast.error('Error', { description: 'No se pudieron cargar los usuarios' });
        } finally {
            setLoading(false);
        }
    }, []);


    const refreshUsuarios = useCallback(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        usuarios,
        loading,
        error,
        cargarUsuarios,
        refreshUsuarios,
        clearError,
        setUsuarios
    };
}