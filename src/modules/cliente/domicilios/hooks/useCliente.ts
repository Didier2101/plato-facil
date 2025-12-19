'use client';

import { useState, useCallback } from 'react';
import { guardarClienteAction } from '../actions/guardarClienteAction';
import { useClienteStore } from '../store/clienteStore';
import { toast } from '@/src/shared/services/toast.service';

/**
 * Hook para gestionar la información del cliente y su persistencia.
 */
export function useCliente() {
    const [loading, setLoading] = useState(false);
    const { cliente, setCliente } = useClienteStore();

    const guardarDatosCliente = useCallback(async (datos: { nombre: string; telefono: string; direccion: string }) => {
        const { nombre, telefono, direccion } = datos;

        // Validaciones
        if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
            toast.warning("Campos incompletos", { description: "Por favor completa todos los campos" });
            return { success: false };
        }

        if (telefono.length < 7 || telefono.length > 15) {
            toast.warning("Teléfono inválido", { description: "Debe tener entre 7 y 15 dígitos" });
            return { success: false };
        }

        setLoading(true);
        try {
            const result = await guardarClienteAction({
                nombre: nombre.trim(),
                telefono: telefono.trim(),
                direccion: direccion.trim(),
            });

            if (result.success && result.cliente) {
                setCliente(result.cliente);
                toast.success("¡Bienvenido!", { description: result.message || "Datos guardados correctamente" });
                return { success: true };
            } else {
                toast.error("Error", { description: result.error || "No se pudieron guardar los datos" });
                return { success: false };
            }
        } catch (error) {
            console.error("Error guardando cliente:", error);
            toast.error("Error inesperado", { description: "No se pudo guardar la información" });
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [setCliente]);

    return {
        cliente,
        loading,
        guardarDatosCliente
    };
}
