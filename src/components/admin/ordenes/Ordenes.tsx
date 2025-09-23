"use client";

import React, { useEffect, useState } from "react";
import { obtenerOrdenesAction } from "@/src/actions/obtenerOrdenesAction";
import { eliminarOrdenAction } from "@/src/actions/eliminarOrdenAction";
import type { OrdenCompleta } from "@/src/types/orden";

import Swal from "sweetalert2";
import { actualizarEstadoOrdenAction } from "@/src/actions/actualizarEstadoOrdenAction";
import OrdenCard from "./OrdenCard";
import { FaUtensils } from "react-icons/fa";

export default function Ordenes() {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
    const [processingOrder, setProcessingOrder] = useState<string | null>(null);

    // Cargar órdenes
    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const resultado = await obtenerOrdenesAction();
                if (resultado.success && resultado.ordenes) {
                    const ordenesPendientes = resultado.ordenes
                        .filter((orden) => orden.estado === "orden_tomada")
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    setOrdenes(ordenesPendientes);
                }
            } catch (error) {
                console.error("Error cargando órdenes:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarOrdenes();
        const interval = setInterval(cargarOrdenes, 30000);
        return () => clearInterval(interval);
    }, []);

    // Toggle expandir/colapsar
    const toggleExpanded = (ordenId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(ordenId)) {
            newExpanded.delete(ordenId);
        } else {
            newExpanded.add(ordenId);
        }
        setExpandedOrders(newExpanded);
    };

    // Cambiar estado de orden o eliminar
    const cambiarEstado = async (
        ordenId: string,
        accion: "lista" | "eliminar"
    ) => {
        const orden = ordenes.find((o) => o.id === ordenId);
        if (!orden) return;

        let titulo: string,
            texto: string,
            confirmText: string,
            icon: "question" | "warning",
            color: string;

        if (accion === "lista") {
            titulo = "¿Orden lista?";
            texto = `Orden #${orden.id.slice(-6)} - ${orden.cliente_nombre}`;
            confirmText = "Sí, está lista";
            icon = "question";
            color = "#10b981";
        } else {
            titulo = "¿Eliminar orden?";
            texto = `Se eliminará la orden #${orden.id.slice(-6)} - ${orden.cliente_nombre}`;
            confirmText = "Sí, eliminar";
            icon = "warning";
            color = "#ef4444";
        }

        const resultado = await Swal.fire({
            title: titulo,
            text: texto,
            icon: icon,
            showCancelButton: true,
            confirmButtonColor: color,
            cancelButtonColor: "#6b7280",
            confirmButtonText: confirmText,
            cancelButtonText: "Cancelar",
        });

        if (resultado.isConfirmed) {
            setProcessingOrder(ordenId);
            try {
                let response;

                if (accion === "lista") {
                    response = await actualizarEstadoOrdenAction(ordenId, "lista");
                } else {
                    response = await eliminarOrdenAction(ordenId);
                }

                if (response.success) {
                    setOrdenes((prev) => prev.filter((o) => o.id !== ordenId));
                    Swal.fire({
                        icon: "success",
                        title: accion === "lista" ? "Orden lista" : "Orden eliminada",
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: "top-end",
                    });
                } else {
                    Swal.fire(
                        "Error",
                        response.error || "No se pudo procesar la orden",
                        "error"
                    );
                }
            } catch {
                Swal.fire("Error", "Ocurrió un error al procesar la orden", "error");
            } finally {
                setProcessingOrder(null);
            }
        }
    };

    // Formato tiempo transcurrido
    const calcularTiempoTranscurrido = (fecha: string) => {
        const ahora = new Date();
        const ordenFecha = new Date(fecha);
        const diffMs = ahora.getTime() - ordenFecha.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Ahora";
        if (diffMins < 60) return `${diffMins}m`;

        const horas = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${horas}h ${mins}m`;
    };

    const getTimeColor = (fecha: string) => {
        const diffMins = Math.floor(
            (new Date().getTime() - new Date(fecha).getTime()) / 60000
        );
        if (diffMins < 10) return "text-green-600 bg-green-50";
        if (diffMins < 20) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center bg-white rounded-xl shadow-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando órdenes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500 p-3 rounded-xl">
                                <FaUtensils className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Cocina</h1>
                                <p className="text-gray-600">
                                    {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} pendiente{ordenes.length === 1 ? '' : 's'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-6 py-0">
                {ordenes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <FaUtensils className="text-gray-300 text-5xl mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Todo al día
                        </h2>
                        <p className="text-gray-500">
                            No hay órdenes pendientes por preparar
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ordenes.map((orden) => (
                            <OrdenCard
                                key={orden.id}
                                orden={orden}
                                isExpanded={expandedOrders.has(orden.id)}
                                toggleExpanded={toggleExpanded}
                                tiempoTranscurrido={calcularTiempoTranscurrido(orden.created_at)}
                                timeColor={getTimeColor(orden.created_at)}
                                processingOrder={processingOrder}
                                cambiarEstado={cambiarEstado}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}