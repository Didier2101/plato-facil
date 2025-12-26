"use client";

import { useState, useCallback, useEffect } from 'react';
import { obtenerOrdenesAction } from '@/src/modules/admin/ordenes/actions/obtenerOrdenesAction';
import { tomarOrdenAction } from '../actions/tomarOrdenAction';
import { marcarLlegadaAction } from '../actions/marcarLlegadaAction';
import type { EntregaRepartidor } from '../types/entrega';
import { ESTADOS_ORDEN } from '@/src/shared/constants/estado-orden';

export function useEntregasActivas(usuarioId: string) {
    const [ordenes, setOrdenes] = useState<EntregaRepartidor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actualizando, setActualizando] = useState<string | null>(null);

    const cargarOrdenes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await obtenerOrdenesAction();

            if (result.success && result.ordenes) {
                // Filtrar:
                // 1. Órdenes LISTAS (disponibles para cualquier repartidor)
                // 2. Órdenes EN_CAMINO o LLEGUE_A_DESTINO que pertenecen a ESTE repartidor
                const filtered = result.ordenes.filter(orden =>
                    orden.tipo_orden === 'domicilio' && (
                        orden.estado === ESTADOS_ORDEN.LISTA ||
                        (orden.usuario_entregador_id === usuarioId &&
                            (orden.estado === ESTADOS_ORDEN.EN_CAMINO || orden.estado === ESTADOS_ORDEN.LLEGUE_A_DESTINO))
                    )
                ) as EntregaRepartidor[];

                setOrdenes(filtered);
            } else {
                setError(result.error || 'Error al cargar las órdenes');
            }
        } catch {
            setError('Error inesperado al cargar las órdenes');
        } finally {
            setLoading(false);
        }
    }, [usuarioId]);

    const tomarOrden = async (ordenId: string) => {
        setActualizando(ordenId);
        try {
            const result = await tomarOrdenAction({ ordenId, usuarioId });
            if (result.success) {
                await cargarOrdenes();
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch {
            return { success: false, error: 'Error al tomar la orden' };
        } finally {
            setActualizando(null);
        }
    };

    const marcarLlegada = async (ordenId: string) => {
        setActualizando(ordenId);
        try {
            const result = await marcarLlegadaAction({ ordenId, usuarioId });
            if (result.success) {
                await cargarOrdenes();
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch {
            return { success: false, error: 'Error al marcar llegada' };
        } finally {
            setActualizando(null);
        }
    };

    const abrirMapa = (orden: EntregaRepartidor) => {
        const url = orden.latitud_destino && orden.longitud_destino
            ? `https://maps.google.com/?q=${orden.latitud_destino},${orden.longitud_destino}`
            : `https://maps.google.com/maps?q=${encodeURIComponent(orden.cliente_direccion)}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        if (usuarioId) {
            cargarOrdenes();
        }
    }, [usuarioId, cargarOrdenes]);

    return {
        ordenes,
        loading,
        error,
        actualizando,
        cargarOrdenes,
        tomarOrden,
        marcarLlegada,
        abrirMapa,
        ordenesListas: ordenes.filter(o => o.estado === ESTADOS_ORDEN.LISTA),
        ordenesEnCurso: ordenes.filter(o => o.estado === ESTADOS_ORDEN.EN_CAMINO || o.estado === ESTADOS_ORDEN.LLEGUE_A_DESTINO)
    };
}
