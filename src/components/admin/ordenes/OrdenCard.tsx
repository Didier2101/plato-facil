"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FaClock,
    FaChevronDown,
    FaUtensils,

    FaCheckCircle,
    FaTimesCircle,
    FaMotorcycle,
    FaStore,

} from "react-icons/fa";
import { OrdenCompleta } from "@/src/types/orden";

type Props = {
    orden: OrdenCompleta;
    isExpanded: boolean;
    toggleExpanded: (id: string) => void;
    tiempoTranscurrido: string;
    timeColor: string;
    processingOrder: string | null;
    cambiarEstado: (id: string, accion: "lista" | "eliminar") => void;
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
    return (
        <motion.div
            layout
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
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
                            <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${timeColor}`}>
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
                                {orden.cliente_nombre}
                            </h3>
                            <p className="text-gray-600">
                                {orden.orden_detalles?.length || 0} productos
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-2xl text-green-600">
                                ${orden.total.toLocaleString("es-CO")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido expandible */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 bg-gray-50"
                    >


                        {/* Productos */}
                        <div className="px-6 pb-6 border-t border-gray-200">
                            <h4 className="font-semibold text-gray-900 text-lg mb-4 pt-4 flex items-center gap-2">
                                <FaUtensils className="text-orange-500" />
                                Productos a preparar
                            </h4>

                            <div className="space-y-3">
                                {orden.orden_detalles?.map((detalle) => (
                                    <div
                                        key={detalle.id}
                                        className="bg-white p-4 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-semibold text-gray-900">
                                                {detalle.producto_nombre}
                                            </h5>
                                            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                {detalle.cantidad}
                                            </div>
                                        </div>

                                        {/* Personalizaciones */}
                                        {detalle.orden_personalizaciones &&
                                            detalle.orden_personalizaciones.filter((p) => !p.incluido).length > 0 && (
                                                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-sm font-medium text-red-700 mb-2">Sin:</p>
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

                                        {/* Notas del producto */}
                                        {detalle.notas_personalizacion && (
                                            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                                <p className="text-sm font-medium text-orange-700 mb-1">Instrucciones:</p>
                                                <p className="text-sm text-orange-600">
                                                    {detalle.notas_personalizacion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="p-6 border-t border-gray-200 bg-white">
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        cambiarEstado(orden.id, "lista");
                                    }}
                                    disabled={processingOrder === orden.id}
                                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
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
                                        cambiarEstado(orden.id, "eliminar");
                                    }}
                                    disabled={processingOrder === orden.id}
                                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <FaTimesCircle />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}