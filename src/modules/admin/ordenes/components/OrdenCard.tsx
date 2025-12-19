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
import { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";
import { capitalizarSoloPrimera } from "@/src/shared/utils/texto";
import { formatearPrecioCOP } from "@/src/shared/utils/precio";

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
    modoSeleccion?: boolean;
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
    modoSeleccion = false,
}: Props) {
    // Calcular totales usando SOLO campos de la base de datos
    const totalItems = orden.orden_detalles?.reduce((total, detalle) => total + detalle.cantidad, 0) || 0;
    const tienePersonalizaciones = orden.orden_detalles?.some(d =>
        d.orden_personalizaciones?.some(p => !p.incluido) ||
        d.notas_personalizacion
    );

    // Handler para el toggle que previene propagación
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleExpanded(orden.id);
    };

    const isProcessing = processingOrder === orden.id;

    return (
        <motion.div
            layout
            // Tarjeta Base: Redondeo amplio y sombra suave
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow relative w-full"
        >
            {/* Header */}
            <div
                className={`p-5 ${!modoSeleccion ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                onClick={!modoSeleccion ? handleToggle : undefined}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Número de orden - Fondo de color de énfasis y redondeo más suave */}
                        <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl font-extrabold text-base whitespace-nowrap flex-shrink-0">
                            #{orden.id.slice(-6).toUpperCase()}
                        </div>

                        {/* Tiempo - En un badge más limpio y redondeado */}
                        <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                            <FaClock className="text-gray-500 text-sm" />
                            <span
                                className={`text-xs font-semibold ${timeColor.replace(/px-2 py-1 rounded-lg/, '')}`}
                            >
                                {tiempoTranscurrido}
                            </span>
                        </div>

                        {/* Tipo de orden - Badge más suave */}
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
                            {orden.tipo_orden === "domicilio" ? (
                                <>
                                    <FaMotorcycle className="text-sm" />
                                    <span>Domicilio</span>
                                </>
                            ) : orden.tipo_orden === "para_llevar" ? (
                                <>
                                    <FaStore className="text-sm" />
                                    <span>Para Llevar</span>
                                </>
                            ) : (
                                <>
                                    <FaUtensils className="text-sm" />
                                    <span>Mesa</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Expandir - Solo visible en modo cocina */}
                    {!modoSeleccion && (
                        <motion.button
                            onClick={handleToggle}
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            aria-label="Expandir detalles"
                        >
                            <FaChevronDown className="text-gray-500 text-base" />
                        </motion.button>
                    )}
                </div>

                {/* Cliente y información principal */}
                <div className="mt-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-xl text-gray-900 truncate">
                                {capitalizarSoloPrimera(orden.cliente_nombre)}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                {totalItems} items
                            </p>
                            {/* Mostrar dirección si es domicilio y no mostramos precios (cocina) */}
                            {!mostrarPrecios && orden.tipo_orden === "domicilio" && (
                                <p className="text-sm text-blue-600 font-medium mt-1 truncate">
                                    {orden.cliente_direccion}
                                </p>
                            )}
                        </div>

                        {/* Lado derecho - Precios o info para cocina */}
                        <div className="text-right flex-shrink-0">
                            {mostrarPrecios ? (
                                // MOSTRAR PRECIOS (para caja)
                                <div>
                                    {mostrarPreciosSeparados && orden.tipo_orden === "domicilio" && (orden.costo_domicilio ?? 0) > 0 ? (
                                        // Desglose para domicilios
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-600">
                                                Prod: {formatearPrecioCOP(orden.subtotal_productos ?? 0)}
                                            </div>
                                            <div className="text-xs text-blue-600">
                                                Dom: {formatearPrecioCOP(orden.costo_domicilio ?? 0)}
                                            </div>
                                            <div className="border-t border-gray-200 pt-1 mt-1">
                                                <p className="font-extrabold text-xl text-orange-600">
                                                    {formatearPrecioCOP(orden.total_final ?? orden.total)}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Precio simple - Destacado con el color de énfasis
                                        <p className="font-extrabold text-2xl text-orange-600">
                                            {formatearPrecioCOP(orden.total_final ?? orden.total)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                // INFORMACIÓN PARA COCINA (sin precios)
                                <div className="space-y-2">
                                    {tienePersonalizaciones && (
                                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                                            <FaExclamationTriangle size={8} />
                                            Modif.
                                        </div>
                                    )}
                                    {timeColor.includes('red') && (
                                        <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap">
                                            <FaExclamationTriangle size={8} />
                                            Urgente
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* En modo caja, mostrar detalles siempre visibles */}
                {modoSeleccion && orden.orden_detalles && orden.orden_detalles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="space-y-2">
                            {orden.orden_detalles.map((detalle) => (
                                <div key={detalle.id} className="flex items-start justify-between text-sm">
                                    <span className="text-gray-700 flex items-start gap-2 pr-2 min-w-0">
                                        {/* Cantidad - Número en un círculo del color de énfasis */}
                                        <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {detalle.cantidad}
                                        </span>
                                        <span className="truncate font-medium text-gray-800">{detalle.producto_nombre}</span>
                                    </span>
                                    {mostrarPrecios && (
                                        <span className="text-gray-700 font-semibold text-sm flex-shrink-0 ml-1">
                                            {formatearPrecioCOP(detalle.precio_unitario * detalle.cantidad)}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido expandible - SOLO EN MODO COCINA */}
            {!modoSeleccion && (
                <>
                    {/* Panel móvil y tablet */}
                    <AnimatePresence>
                        {isExpanded && (
                            <>
                                {/* El overlay y el panel móvil mantienen el estilo de deslizamiento nativo */}
                                <motion.div
                                    key={`overlay-mobile-${orden.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 bg-black z-40 lg:hidden"
                                    onClick={handleToggle}
                                />

                                {/* Panel móvil y tablet */}
                                <motion.div
                                    key={`panel-mobile-${orden.id}`}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ duration: 0.3 }}
                                    // Borde superior más redondeado (estilo 'sheet' de móvil)
                                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 overflow-auto max-h-[90vh] scrollbar-none lg:hidden"
                                >
                                    <div
                                        className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-6 cursor-pointer"
                                        onClick={handleToggle}
                                    />

                                    <div className="px-6 pb-6 space-y-6">
                                        <h4 className="font-extrabold text-gray-900 text-xl flex items-center gap-2 border-b pb-3 border-gray-100">
                                            <FaUtensils className="text-orange-500" />
                                            Productos
                                        </h4>

                                        {orden.orden_detalles?.map((detalle) => (
                                            <div key={detalle.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-semibold text-gray-900 text-base">
                                                        {detalle.producto_nombre}
                                                    </h5>
                                                    <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 ml-3">
                                                        {detalle.cantidad}
                                                    </div>
                                                </div>

                                                {/* Personalizaciones excluidas */}
                                                {detalle.orden_personalizaciones &&
                                                    detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                                        <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-200">
                                                            <p className="text-sm font-bold text-red-800 mb-2">
                                                                ❌ NO incluir:
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {detalle.orden_personalizaciones
                                                                    .filter(p => !p.incluido)
                                                                    .map(p => (
                                                                        <span
                                                                            key={p.ingrediente_id}
                                                                            // Diseño: Badge de píldora para tags
                                                                            className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium"
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
                                                    <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                                        <p className="text-sm font-bold text-blue-800 mb-2">
                                                            📝 Instrucciones especiales:
                                                        </p>
                                                        <p className="text-sm text-blue-700 font-medium">
                                                            {detalle.notas_personalizacion}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botones - Fijos en la parte inferior */}
                                    {processingOrder !== undefined && (
                                        <div className="sticky bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
                                            <div className="flex gap-3">
                                                {/* Botón Principal - Estilo Píldora */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        cambiarEstado(orden.id, "lista");
                                                    }}
                                                    disabled={isProcessing}
                                                    className={`
                                                        flex-1 bg-orange-500 hover:bg-orange-600 
                                                        disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                                                        text-white py-3 px-4 
                                                        rounded-full // Diseño: Forma de píldora
                                                        font-extrabold transition-colors flex items-center justify-center gap-2 text-base
                                                    `}
                                                >
                                                    {isProcessing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                                            <span>Procesando...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCheckCircle className="text-lg" />
                                                            Orden Lista
                                                        </>
                                                    )}
                                                </button>

                                                {/* Botón Secundario - Estilo Píldora (Outline/Claro) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        cambiarEstado(orden.id, "cancelar");
                                                    }}
                                                    disabled={isProcessing}
                                                    className={`
                                                        bg-white border-2 border-gray-300 hover:border-gray-500
                                                        text-gray-700 py-3 px-6 
                                                        rounded-full // Diseño: Forma de píldora
                                                        font-extrabold transition-colors text-base
                                                    `}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Panel desktop */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                key={`panel-desktop-${orden.id}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-gray-100 bg-gray-50 px-5 pb-5 space-y-4 hidden lg:block"
                            >
                                <h4 className="font-extrabold mt-4 text-gray-900 text-lg flex items-center gap-2 border-b pb-2 border-gray-200">
                                    <FaUtensils className="text-orange-500 text-base" />
                                    Productos
                                </h4>

                                {orden.orden_detalles?.map((detalle) => (
                                    <div key={detalle.id} className="pb-3 border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-semibold text-gray-900 text-sm truncate">
                                                {detalle.producto_nombre}
                                            </h5>
                                            <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0 ml-2">
                                                {detalle.cantidad}
                                            </div>
                                        </div>

                                        {detalle.orden_personalizaciones &&
                                            detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                                <div className="mt-1 p-2 bg-red-50 rounded-xl border border-red-200">
                                                    <p className="text-xs font-bold text-red-800 mb-1">❌ NO incluir:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {detalle.orden_personalizaciones
                                                            .filter(p => !p.incluido)
                                                            .map(p => (
                                                                <span
                                                                    key={p.ingrediente_id}
                                                                    className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium"
                                                                >
                                                                    {p.ingrediente_nombre}
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                        {detalle.notas_personalizacion && (
                                            <div className="mt-1 p-2 bg-blue-50 rounded-xl border border-blue-200">
                                                <p className="text-xs font-bold text-blue-800 mb-1">
                                                    📝 Instrucciones:
                                                </p>
                                                <p className="text-xs text-blue-700 font-medium">
                                                    {detalle.notas_personalizacion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Botones de acción en Desktop */}
                                {processingOrder !== undefined && (
                                    <div className="flex gap-3 mt-4">
                                        {/* Botón Principal - Estilo Píldora */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                cambiarEstado(orden.id, "lista");
                                            }}
                                            disabled={isProcessing}
                                            className={`
                                                flex-1 bg-orange-500 hover:bg-orange-600 
                                                disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                                                text-white py-2 px-3 
                                                rounded-full // Diseño: Forma de píldora
                                                font-extrabold transition-colors flex items-center justify-center gap-2 text-sm
                                            `}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                    <span>Procesando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="text-base" />
                                                    Orden Lista
                                                </>
                                            )}
                                        </button>

                                        {/* Botón Secundario - Estilo Píldora (Outline/Claro) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                cambiarEstado(orden.id, "cancelar");
                                            }}
                                            disabled={isProcessing}
                                            className={`
                                                bg-white border-2 border-gray-300 hover:border-gray-500
                                                text-gray-700 py-2 px-4 
                                                rounded-full // Diseño: Forma de píldora
                                                font-extrabold transition-colors text-sm
                                            `}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
}