'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { obtenerOrdenesAction } from '../actions/obtenerOrdenesAction';
import { actualizarEstadoOrdenAction } from '../actions/actualizarEstadoOrdenAction';
import { eliminarOrdenAction } from '../actions/eliminarOrdenAction';
import { toast } from '@/src/shared/services/toast.service';
import type { OrdenCompleta } from '../types/orden';

/**
 * Hook personalizado para gestionar la lógica de las órdenes en el panel de administración
 */
export function useOrdenes() {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
    const [processingOrder, setProcessingOrder] = useState<string | null>(null);

    /**
     * Carga las órdenes pendientes desde el servidor
     */
    const cargarOrdenes = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const resultado = await obtenerOrdenesAction();
            if (resultado.success && resultado.ordenes) {
                const ordenesPendientes = resultado.ordenes
                    .filter((orden) => orden.estado === "orden_tomada")
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setOrdenes(ordenesPendientes);
            }
        } catch (error) {
            console.error("Error cargando órdenes:", error);
            toast.error("Error", { description: "No se pudieron cargar las órdenes" });
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial y refresco automático cada 30 segundos
    useEffect(() => {
        cargarOrdenes();
        const interval = setInterval(() => cargarOrdenes(false), 30000);
        return () => clearInterval(interval);
    }, [cargarOrdenes]);

    /**
     * Alterna el estado expandido de una orden
     */
    const toggleExpanded = useCallback((ordenId: string) => {
        setExpandedOrders((prev) => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(ordenId)) {
                newExpanded.delete(ordenId);
            } else {
                newExpanded.add(ordenId);
            }
            return newExpanded;
        });
    }, []);

    /**
     * Cambia el estado de una orden o la elimina
     */
    const cambiarEstado = useCallback(async (ordenId: string, accion: "lista" | "cancelar") => {
        const orden = ordenes.find((o) => o.id === ordenId);
        if (!orden) return;

        setProcessingOrder(ordenId);

        try {
            const actionPromise = accion === "lista"
                ? actualizarEstadoOrdenAction(ordenId, "lista")
                : eliminarOrdenAction(ordenId);

            const response = await actionPromise;

            if (response.success) {
                setOrdenes((prev) => prev.filter((o) => o.id !== ordenId));
                setExpandedOrders((prev) => {
                    const next = new Set(prev);
                    next.delete(ordenId);
                    return next;
                });

                toast.success(accion === "lista" ? "¡Orden lista!" : "Orden eliminada", {
                    description: `Orden #${ordenId.slice(-6).toUpperCase()} de ${orden.cliente_nombre}`,
                });
            } else {
                toast.error("Error", {
                    description: response.error || "No se pudo procesar la orden"
                });
            }
        } catch (error) {
            console.error(`Error al ${accion} orden:`, error);
            toast.error("Error inesperado", {
                description: "Ocurrió un error al procesar la solicitud"
            });
        } finally {
            setProcessingOrder(null);
        }
    }, [ordenes]);

    /**
     * Estadísticas calculadas de las órdenes actuales
     */
    const stats = useMemo(() => {
        const ahora = new Date().getTime();
        const urgentes = ordenes.filter(orden => {
            const diffMins = Math.floor((ahora - new Date(orden.created_at).getTime()) / 60000);
            return diffMins >= 20;
        }).length;
        const domicilios = ordenes.filter(orden => orden.tipo_orden === "domicilio").length;

        return {
            urgentes,
            domicilios,
            total: ordenes.length
        };
    }, [ordenes]);

    return {
        ordenes,
        loading,
        expandedOrders,
        processingOrder,
        toggleExpanded,
        cambiarEstado,
        stats,
        refresh: cargarOrdenes
    };
}
