"use client";

import { FaUtensils } from "react-icons/fa";
import { calcularTiempoTranscurrido } from "@/src/shared/utils/texto";
import Loading from "@/src/shared/components/ui/Loading";
import { useOrdenes } from "../hooks/useOrdenes";
import OrdenCard from "./OrdenCard";
import type { OrdenCompleta } from "../types/orden";

import { toast } from "@/src/shared/services/toast.service";


export default function Ordenes() {
    const {
        ordenes,
        loading,
        expandedOrders,
        processingOrder,
        toggleExpanded,
        cambiarEstado,
        stats,
    } = useOrdenes();

    // Manejador para cambiar estado con una confirmación vía toast
    const handleCambiarEstado = (
        ordenId: string,
        accion: "lista" | "cancelar"
    ) => {
        const orden = ordenes.find((o: OrdenCompleta) => o.id === ordenId);
        if (!orden) return;


        const titulo = accion === "lista" ? "Confirmar orden lista" : "Confirmar cancelación";
        const mensaje = accion === "lista"
            ? `¿La orden #${ordenId.slice(-6)} de ${orden.cliente_nombre} está lista?`
            : `¿Estás seguro de que deseas eliminar la orden #${ordenId.slice(-6)} de ${orden.cliente_nombre}?`;

        toast.info(titulo, {
            description: mensaje,
            action: {
                label: "Confirmar",
                onClick: () => cambiarEstado(ordenId, accion)
            },
            cancel: {
                label: "No",
                onClick: () => { }
            }
        });
    };


    // Color del tiempo transcurrido
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
            <Loading
                texto="Cargando órdenes..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }


    return (
        <div className="p-6">
            {/* Header mejorado para cocina */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl">
                            <FaUtensils className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Ordenes para preparar</h1>
                            <p className="text-gray-600">
                                {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} pendiente{ordenes.length === 1 ? '' : 's'}
                            </p>
                        </div>
                    </div>

                    {/* Estadísticas rápidas */}
                    {ordenes.length > 0 && (
                        <div className="flex gap-3">
                            {stats.urgentes > 0 && (
                                <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg">
                                    <p className="text-xs font-medium">Urgentes</p>
                                    <p className="font-bold">{stats.urgentes}</p>
                                </div>
                            )}
                            {stats.domicilios > 0 && (
                                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                                    <p className="text-xs font-medium">Domicilios</p>
                                    <p className="font-bold">{stats.domicilios}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido */}
            <div className="">
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
                    <div className="space-x-4 grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {ordenes.map((orden: OrdenCompleta) => (
                            <OrdenCard

                                key={orden.id}
                                orden={orden}
                                isExpanded={expandedOrders.has(orden.id)}
                                toggleExpanded={toggleExpanded}
                                tiempoTranscurrido={calcularTiempoTranscurrido(orden.created_at)}
                                timeColor={getTimeColor(orden.created_at)}
                                processingOrder={processingOrder}
                                cambiarEstado={handleCambiarEstado}
                                mostrarPrecios={false} // ✅ CLAVE: No mostrar precios en cocina
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
