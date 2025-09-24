"use client";

import { motion } from "framer-motion";
import { FaClock, FaMotorcycle, FaStore } from "react-icons/fa";
import type { OrdenCompleta } from "@/src/types/orden";
import { formatearPrecioCOP } from "@/src/utils/precio";
import { capitalizarSoloPrimera } from "@/src/utils/texto";

type Props = {
    orden: OrdenCompleta;
    isSelected: boolean;
    onSelect: (orden: OrdenCompleta) => void;
};

export default function CajaCard({ orden, isSelected, onSelect }: Props) {
    const tiempoTranscurrido = () => {
        const diffMins = Math.floor(
            (new Date().getTime() - new Date(orden.created_at).getTime()) / 60000
        );
        if (diffMins < 1) return "Ahora mismo";
        if (diffMins < 60) return `${diffMins}m`;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
    };

    const getTimeColor = () => {
        const diffMins = Math.floor(
            (new Date().getTime() - new Date(orden.created_at).getTime()) / 60000
        );
        if (diffMins < 10) return "text-green-600 bg-green-50";
        if (diffMins < 20) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    return (
        <motion.div
            layout
            onClick={() => onSelect(orden)}
            className={`cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${isSelected ? "ring-2 ring-orange-500 shadow-lg" : ""
                }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Número de orden */}
                        <span className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                            #{orden.id.slice(-6)}
                        </span>

                        {/* Tiempo */}
                        <div className="flex items-center gap-1">
                            <FaClock className="text-gray-400 text-sm" />
                            <span
                                className={`text-xs font-semibold px-2 py-1 rounded-lg ${getTimeColor()}`}
                            >
                                {tiempoTranscurrido()}
                            </span>
                        </div>

                        {/* Tipo de orden */}
                        <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {orden.tipo_orden === "domicilio" ? (
                                <>
                                    <FaMotorcycle className="text-gray-500 text-sm" />
                                    <span>Domicilio</span>
                                </>
                            ) : (
                                <>
                                    <FaStore className="text-gray-500 text-sm" />
                                    <span>Mesa</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cliente */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate max-w-[160px] sm:max-w-[200px]">
                            {capitalizarSoloPrimera(orden.cliente_nombre)}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {orden.orden_detalles?.length || 0} productos
                        </p>
                        {orden.cliente_telefono && (
                            <p className="text-xs text-gray-500">
                                📞 {orden.cliente_telefono}
                            </p>
                        )}
                    </div>

                    <p className="font-bold text-xl text-green-600 whitespace-nowrap">
                        {formatearPrecioCOP(orden.total)}
                    </p>
                </div>

                {/* Productos preview */}
                {orden.orden_detalles && orden.orden_detalles.length > 0 && (
                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {orden.orden_detalles.slice(0, 3).map((detalle) => (
                                <span
                                    key={detalle.id}
                                    className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full"
                                >
                                    {detalle.cantidad}x {detalle.producto_nombre}
                                </span>
                            ))}
                            {orden.orden_detalles.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                    +{orden.orden_detalles.length - 3} más
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Selección */}
                {isSelected && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-3 border-t border-orange-200"
                    >
                        <div className="flex items-center justify-center gap-2 text-orange-600 font-medium text-sm">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            Seleccionada para cobro
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
