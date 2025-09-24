"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FaClock,
    FaChevronDown,
    FaUtensils,
    FaCheckCircle,
    FaMotorcycle,
    FaStore,
} from "react-icons/fa";
import { OrdenCompleta } from "@/src/types/orden";
import { useEffect, useState } from "react";
import { capitalizarSoloPrimera } from "@/src/utils/texto";
import { formatearPrecioCOP } from "@/src/utils/precio";

type Props = {
    orden: OrdenCompleta;
    isExpanded: boolean;
    toggleExpanded: (id: string) => void;
    tiempoTranscurrido: string;
    timeColor: string;
    processingOrder: string | null;
    cambiarEstado: (id: string, accion: "lista" | "cancelar") => void;
};

export default function OrdenCard({
    orden,
    isExpanded,
    toggleExpanded,
    tiempoTranscurrido,
    timeColor,
    processingOrder,
    cambiarEstado,
}: Props) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <motion.div
            layout
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative"
        >
            {/* Header */}
            <div
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded(orden.id)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Número de orden */}
                        <div className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold">
                            #{orden.id.slice(-6)}
                        </div>

                        {/* Tiempo */}
                        <div className="flex items-center gap-2">
                            <FaClock className="text-gray-400" />
                            <span
                                className={`text-sm font-semibold px-3 py-1 rounded-lg ${timeColor}`}
                            >
                                {tiempoTranscurrido}
                            </span>
                        </div>

                        {/* Tipo de orden */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                            {orden.tipo_orden === "domicilio" ? (
                                <>
                                    <FaMotorcycle />
                                    <span>Domicilio</span>
                                </>
                            ) : (
                                <>
                                    <FaStore />
                                    <span>Mesa</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Expandir */}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FaChevronDown className="text-gray-400" />
                    </motion.div>
                </div>

                {/* Cliente y total */}
                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">
                                {capitalizarSoloPrimera(orden.cliente_nombre)}
                            </h3>
                            <p className="text-gray-600">
                                {orden.orden_detalles?.length || 0} productos
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-2xl text-green-600">
                                {formatearPrecioCOP(orden.total)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido expandible */}
            <AnimatePresence>
                {isExpanded && isMobile && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            key={`overlay-${orden.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black z-40"
                            onClick={() => toggleExpanded(orden.id)}
                        />

                        {/* Panel */}
                        <motion.div
                            key={`panel-${orden.id}`}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.3 }}
                            className="fixed bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-2xl z-50 overflow-auto max-h-[90vh] scrollbar-none"
                        >
                            {/* Handle */}
                            <div
                                className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4"
                                onClick={() => toggleExpanded(orden.id)}
                            />

                            {/* Productos */}
                            <div className="px-6 pb-6 space-y-4">
                                <h4 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
                                    <FaUtensils className="text-orange-500" />
                                    Productos a preparar
                                </h4>

                                {orden.orden_detalles?.map((detalle) => (
                                    <div
                                        key={detalle.id}
                                        className="mt-6 border-b border-gray-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-semibold text-gray-900">
                                                {detalle.producto_nombre}
                                            </h5>
                                            <div className="bg-gray-100 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                {detalle.cantidad}
                                            </div>
                                        </div>

                                        {/* Personalizaciones */}
                                        {detalle.orden_personalizaciones &&
                                            detalle.orden_personalizaciones.filter((p) => !p.incluido)
                                                .length > 0 && (
                                                <div className="mt-1 flex items-center">
                                                    <p className="text-sm font-medium text-red-700 mb-1">
                                                        Sin:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {detalle.orden_personalizaciones
                                                            .filter((p) => !p.incluido)
                                                            .map((p) => (
                                                                <span
                                                                    key={p.ingrediente_id}
                                                                    className="text-xs  text-red-700 px-2 py-1"
                                                                >
                                                                    {p.ingrediente_nombre}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Notas del producto */}
                                        {detalle.notas_personalizacion && (
                                            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                                <p className="text-sm font-medium text-orange-700 mb-1">
                                                    Instrucciones:
                                                </p>
                                                <p className="text-sm text-orange-600">
                                                    {detalle.notas_personalizacion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Botones */}
                            <div className="p-6 border-t border-gray-200 bg-white">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cambiarEstado(orden.id, "lista");
                                        }}
                                        disabled={processingOrder === orden.id}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        {processingOrder === orden.id ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        ) : (
                                            <>
                                                <FaCheckCircle />
                                                Orden Lista
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cambiarEstado(orden.id, "cancelar"); // cancelar visual
                                        }}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        Cancelar orden
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {!isMobile && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 bg-gray-50 px-6 pb-6 space-y-4"
                    >
                        <h4 className="font-semibold mt-4 text-gray-900 text-lg mb-2 flex items-center gap-2">
                            <FaUtensils className="text-orange-500" />
                            Productos a preparar
                        </h4>

                        {orden.orden_detalles?.map((detalle) => (
                            <div
                                key={detalle.id}
                                className="mt-4 border-b border-gray-200 pb-2"
                            >
                                <div className="flex items-center justify-between">
                                    <h5 className="font-semibold text-gray-900">
                                        {detalle.producto_nombre}
                                    </h5>
                                    <div className="bg-gray-100 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                        {detalle.cantidad}
                                    </div>
                                </div>

                                {detalle.orden_personalizaciones &&
                                    detalle.orden_personalizaciones.filter((p) => !p.incluido).length > 0 && (
                                        <div className="mt-2 p-2 flex items-center gap-2">
                                            <p className="text-sm font-medium text-red-700 mb-1">Sin:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {detalle.orden_personalizaciones
                                                    .filter((p) => !p.incluido)
                                                    .map((p) => (
                                                        <span
                                                            key={p.ingrediente_id}
                                                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded"
                                                        >
                                                            {p.ingrediente_nombre}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                {detalle.notas_personalizacion && (
                                    <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                        <p className="text-sm font-medium text-orange-700 mb-1">
                                            Instrucciones:
                                        </p>
                                        <p className="text-sm text-orange-600">
                                            {detalle.notas_personalizacion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Botones */}
                        <div className="flex flex-col md:flex-row gap-3 mt-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    cambiarEstado(orden.id, "lista");
                                }}
                                disabled={processingOrder === orden.id}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                {processingOrder === orden.id ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                ) : (
                                    <>
                                        <FaCheckCircle />
                                        Orden Lista
                                    </>
                                )}
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    cambiarEstado(orden.id, "cancelar");
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                Cancelar orden
                            </button>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </motion.div>
    );
}
