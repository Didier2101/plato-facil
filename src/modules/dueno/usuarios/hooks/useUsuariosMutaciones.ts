// src/modules/dueno/usuarios/hooks/useUsuariosMutaciones.ts
'use client';

import { useState, useCallback } from 'react';
import { toast } from '@/src/shared/services/toast.service';

import type { CrearUsuarioData, EditarUsuarioData } from '../types/usuarioTypes';
import { crearUsuarioAction } from '../actions/crearUsuarioAction';
import { editarUsuarioAction } from '../actions/editarUsuarioAction';
import { toggleUsuarioAction } from '../actions/toggleUsuarioAction';

export function useUsuariosMutaciones() {
    const [saving, setSaving] = useState(false);

    const crearUsuario = useCallback(async (data: CrearUsuarioData) => {
        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("nombre", data.nombre);
            formData.append("email", data.email);
            formData.append("rol", data.rol);
            formData.append("password", data.contraseña);

            const result = await crearUsuarioAction(formData);

            if (result.success && result.user) {
                toast.success('¡Éxito!', { description: 'Usuario creado correctamente' });
                return { success: true, usuario: result.user };
            } else {
                const errorMsg = result.error || 'No se pudo crear el usuario';
                toast.error('Error', { description: errorMsg });
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado';
            toast.error('Error', { description: errorMsg });
            console.error('Error creando usuario:', err);
            return { success: false, error: errorMsg };
        } finally {
            setSaving(false);
        }
    }, []);

    const editarUsuario = useCallback(async (id: string, data: EditarUsuarioData) => {
        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("id", id);
            formData.append("nombre", data.nombre);
            formData.append("email", data.email);
            formData.append("rol", data.rol);

            const result = await editarUsuarioAction(formData);

            if (result.success && result.user) {
                toast.success('¡Éxito!', { description: 'Usuario actualizado correctamente' });
                return { success: true, usuario: result.user };
            } else {
                const errorMsg = result.error || 'No se pudo actualizar el usuario';
                toast.error('Error', { description: errorMsg });
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado';
            toast.error('Error', { description: errorMsg });
            console.error('Error editando usuario:', err);
            return { success: false, error: errorMsg };
        } finally {
            setSaving(false);
        }
    }, []);

    const toggleUsuario = useCallback(async (id: string, activo: boolean) => {
        try {
            const result = await toggleUsuarioAction(id, activo);

            if (result.success) {
                toast.success(activo ? 'Usuario activado' : 'Usuario desactivado', {
                    description: `El usuario ha sido ${activo ? 'activado' : 'desactivado'} correctamente`
                });
                return { success: true, id, activo };
            } else {
                const errorMsg = result.error || 'No se pudo cambiar el estado';
                toast.error('Error', { description: errorMsg });
                return { success: false, error: errorMsg };
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error inesperado';
            toast.error('Error', { description: errorMsg });
            console.error('Error cambiando estado:', err);
            return { success: false, error: errorMsg };
        }
    }, []);


    return {
        crearUsuario,
        editarUsuario,
        toggleUsuario,
        saving
    };
}