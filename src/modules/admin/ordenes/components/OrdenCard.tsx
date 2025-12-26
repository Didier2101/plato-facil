"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    ChevronDown,
    Utensils,
    CheckCircle,
    Bike,
    Store,
    AlertTriangle,
    Zap,
    MapPin,
    Hash,
    Receipt,
    ListChecks,
    XCircle
} from "lucide-react";
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
    modoSeleccion = false,
}: Props) {
    const totalItems = orden.orden_detalles?.reduce((total, detalle) => total + detalle.cantidad, 0) || 0;
    const tienePersonalizaciones = orden.orden_detalles?.some(d =>
        d.orden_personalizaciones?.some(p => !p.incluido) ||
        d.notas_personalizacion
    );

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleExpanded(orden.id);
    };

    const isProcessing = processingOrder === orden.id;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500"
        >
            {/* Context Decorator */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Hash className="h-24 w-24" />
            </div>

            {/* Main Header Wrapper */}
            <div
                className={`p-8 ${!modoSeleccion ? 'cursor-pointer' : ''}`}
                onClick={!modoSeleccion ? handleToggle : undefined}
            >
                {/* Meta Row */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white h-10 px-4 rounded-2xl flex items-center justify-center font-black text-xs tracking-widest uppercase">
                            #{orden.id.slice(-6)}
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${timeColor} backdrop-blur-md`}>
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {tiempoTranscurrido}
                            </span>
                        </div>
                    </div>

                    {!modoSeleccion && (
                        <motion.button
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <ChevronDown className="h-5 w-5" />
                        </motion.button>
                    )}
                </div>

                {/* Cliente Info Row */}
                <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase truncate leading-tight mb-1">
                            {capitalizarSoloPrimera(orden.cliente_nombre)}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400">
                            {orden.tipo_orden === "domicilio" ? (
                                <Bike className="h-4 w-4" />
                            ) : orden.tipo_orden === "para_llevar" ? (
                                <Store className="h-4 w-4" />
                            ) : (
                                <Utensils className="h-4 w-4" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {orden.tipo_orden?.replace("_", " ")} • {totalItems} Items
                            </span>
                        </div>

                        {!mostrarPrecios && orden.tipo_orden === "domicilio" && (
                            <div className="mt-4 flex items-center gap-2 text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-xl">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">
                                    {orden.cliente_direccion}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="text-right shrink-0">
                        {mostrarPrecios ? (
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inversión Final</p>
                                <p className="text-3xl font-black text-orange-500 tracking-tighter">
                                    {formatearPrecioCOP(orden.total_final ?? orden.total)}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {tienePersonalizaciones && (
                                    <div className="bg-orange-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-200 animate-pulse">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Ajustes</span>
                                    </div>
                                )}
                                {timeColor.includes('red') && (
                                    <div className="bg-red-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg shadow-red-200">
                                        <Zap className="h-3.5 w-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Crítico</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* POS Details (Always visible if modoSeleccion) */}
                {modoSeleccion && orden.orden_detalles && (
                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                        {orden.orden_detalles.map((detalle) => (
                            <div key={detalle.id} className="flex items-center justify-between text-slate-600 group/item">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 text-[10px] font-black">
                                        {detalle.cantidad}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover/item:text-orange-500 transition-colors">
                                        {detalle.producto_nombre}
                                    </span>
                                </div>
                                {mostrarPrecios && (
                                    <span className="text-xs font-bold text-slate-400">
                                        {formatearPrecioCOP(detalle.precio_unitario * detalle.cantidad)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* EXPANDABLE SECTION (COCKPIT MODE) */}
            {!modoSeleccion && (
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-slate-50/50 border-t border-white"
                        >
                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-500">
                                        <ListChecks className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">
                                        Protocolo de Manufactura
                                    </h4>
                                </div>

                                <div className="space-y-4">
                                    {orden.orden_detalles?.map((detalle) => (
                                        <div key={detalle.id} className="bg-white/80 p-6 rounded-[2rem] border border-white shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                                                        {detalle.cantidad}
                                                    </div>
                                                    <h5 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">
                                                        {detalle.producto_nombre}
                                                    </h5>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Exclusions */}
                                                {detalle.orden_personalizaciones && detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                                    <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10">
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <XCircle className="h-3 w-3" /> Excluir Activos
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {detalle.orden_personalizaciones
                                                                ?.filter(p => !p.incluido)
                                                                .map(p => (
                                                                    <span key={p.ingrediente_id} className="bg-white px-3 py-1.5 rounded-xl text-[9px] font-black text-red-600 uppercase tracking-widest border border-red-100 shadow-sm">
                                                                        {p.ingrediente_nombre}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {detalle.notas_personalizacion && (
                                                    <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Receipt className="h-3 w-3" /> Notas de Edición
                                                        </p>
                                                        <p className="text-xs font-bold text-blue-900 italic leading-relaxed">
                                                            &quot;{detalle.notas_personalizacion}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions Row */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cambiarEstado(orden.id, "lista");
                                        }}
                                        disabled={isProcessing}
                                        className="flex-1 h-16 bg-slate-900 hover:bg-orange-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group/save"
                                    >
                                        {isProcessing ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                Consolidar Orden
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cambiarEstado(orden.id, "cancelar");
                                        }}
                                        disabled={isProcessing}
                                        className="h-16 px-8 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em]"
                                    >
                                        Abortar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    );
}
