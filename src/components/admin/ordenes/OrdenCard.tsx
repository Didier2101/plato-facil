"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FaClock,
    FaChevronDown,
    FaUtensils,
    FaCheckCircle,
    FaMotorcycle,
    FaStore,
    FaExclamationTriangle,
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
    mostrarPrecios?: boolean;
    mostrarPreciosSeparados?: boolean;
};

export default function OrdenCard({
    orden,
    isExpanded,
    toggleExpanded,
    tiempoTranscurrido,
    timeColor,
    processingOrder,
    cambiarEstado,
    mostrarPrecios = true,
    mostrarPreciosSeparados = false,
}: Props) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Calcular totales usando SOLO campos de la base de datos
    const totalItems = orden.orden_detalles?.reduce((total, detalle) => total + detalle.cantidad, 0) || 0;
    const tienePersonalizaciones = orden.orden_detalles?.some(d =>
        d.orden_personalizaciones?.some(p => !p.incluido) ||
        d.notas_personalizacion
    );

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

                {/* Cliente y información principal */}
                <div className="mt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900">
                                {capitalizarSoloPrimera(orden.cliente_nombre)}
                            </h3>
                            <p className="text-gray-600">
                                {orden.orden_detalles?.length || 0} productos
                            </p>
                            {/* Mostrar dirección si es domicilio y no mostramos precios (cocina) */}
                            {!mostrarPrecios && orden.tipo_orden === "domicilio" && (
                                <p className="text-sm text-blue-600 mt-1 truncate">
                                    {orden.cliente_direccion}
                                </p>
                            )}
                        </div>

                        {/* Lado derecho - Precios o info para cocina */}
                        <div className="text-right">
                            {mostrarPrecios ? (
                                // MOSTRAR PRECIOS (para caja)
                                <div>
                                    {mostrarPreciosSeparados && orden.tipo_orden === "domicilio" && (orden.costo_domicilio ?? 0) > 0 ? (
                                        // Desglose para domicilios
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-600">
                                                Productos: {formatearPrecioCOP(orden.subtotal_productos ?? 0)}
                                            </div>
                                            <div className="text-sm text-blue-600">
                                                Domicilio: {formatearPrecioCOP(orden.costo_domicilio ?? 0)}
                                            </div>
                                            <div className="border-t pt-1">
                                                <p className="font-bold text-xl text-green-600">
                                                    {formatearPrecioCOP(orden.total_final ?? orden.total)}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Precio simple
                                        <p className="font-bold text-2xl text-green-600">
                                            {formatearPrecioCOP(orden.total_final ?? orden.total)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                // INFORMACIÓN PARA COCINA (sin precios)
                                <div className="space-y-2">
                                    <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-lg">
                                        <p className="font-bold text-lg">
                                            {totalItems} items
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        {tienePersonalizaciones && (
                                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                                Con modificaciones
                                            </div>
                                        )}

                                        {timeColor.includes('red') && (
                                            <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                                                <FaExclamationTriangle size={10} />
                                                Urgente
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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

                        {/* Panel móvil */}
                        <motion.div
                            key={`panel-${orden.id}`}
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.3 }}
                            className="fixed bottom-0 left-0 right-0 bg-gray-50 rounded-t-3xl shadow-2xl z-50 overflow-auto max-h-[90vh] scrollbar-none"
                        >
                            <div
                                className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4"
                                onClick={() => toggleExpanded(orden.id)}
                            />

                            <div className="px-6 pb-6 space-y-4">
                                <h4 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
                                    <FaUtensils className="text-orange-500" />
                                    Productos
                                </h4>

                                {orden.orden_detalles?.map((detalle) => (
                                    <div key={detalle.id} className="border-b border-gray-200 pb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-semibold text-gray-900">
                                                {detalle.producto_nombre}
                                            </h5>
                                            <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                {detalle.cantidad}
                                            </div>
                                        </div>

                                        {/* Personalizaciones excluidas */}
                                        {detalle.orden_personalizaciones &&
                                            detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-sm font-bold text-red-800 mb-2">
                                                        NO incluir:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {detalle.orden_personalizaciones
                                                            .filter(p => !p.incluido)
                                                            .map(p => (
                                                                <span
                                                                    key={p.ingrediente_id}
                                                                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium"
                                                                >
                                                                    {p.ingrediente_nombre}
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                        {/* Notas del producto */}
                                        {detalle.notas_personalizacion && (
                                            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-bold text-blue-800 mb-2">
                                                    Instrucciones especiales:
                                                </p>
                                                <p className="text-sm text-blue-700 font-medium">
                                                    {detalle.notas_personalizacion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Botones solo en cocina */}
                            {processingOrder !== undefined && (
                                <div className="p-6 border-t border-gray-200 bg-white">
                                    <div className="flex gap-3">
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
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            Productos
                        </h4>

                        {orden.orden_detalles?.map((detalle) => (
                            <div key={detalle.id} className="border-b border-gray-200 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-900 text-lg">
                                        {detalle.producto_nombre}
                                    </h5>
                                    <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                                        {detalle.cantidad}
                                    </div>
                                </div>

                                {detalle.orden_personalizaciones &&
                                    detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                            <p className="text-sm font-bold text-red-800 mb-2">NO incluir:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {detalle.orden_personalizaciones
                                                    .filter(p => !p.incluido)
                                                    .map(p => (
                                                        <span
                                                            key={p.ingrediente_id}
                                                            className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium"
                                                        >
                                                            {p.ingrediente_nombre}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                {detalle.notas_personalizacion && (
                                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm font-bold text-blue-800 mb-2">
                                            Instrucciones especiales:
                                        </p>
                                        <p className="text-sm text-blue-700 font-medium">
                                            {detalle.notas_personalizacion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Botones solo en cocina */}
                        {processingOrder !== undefined && (
                            <div className="flex gap-3 mt-6">
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
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}