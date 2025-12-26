"use client";

import { Utensils, Zap, ShoppingBag, Sparkles, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calcularTiempoTranscurrido } from "@/src/shared/utils/texto";
import Loading from "@/src/shared/components/ui/Loading";
import { useOrdenes } from "../hooks/useOrdenes";
import OrdenCard from "./OrdenCard";
import type { OrdenCompleta } from "../types/orden";
import { toast } from "@/src/shared/services/toast.service";
import { PageHeader } from "@/src/shared/components";

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
        if (diffMins < 10) return "text-green-500 bg-green-500/10";
        if (diffMins < 20) return "text-orange-500 bg-orange-500/10";
        return "text-red-500 bg-red-500/10";
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loading
                    texto="Sincronizando cocina..."
                    tamaño="mediano"
                    color="orange-500"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Centro de Operaciones"
                description={`${ordenes.length} órdenes en fila de preparación`}
                icon={ChefHat}
                iconBgColor="bg-orange-500"
                iconColor="text-white"
            />

            <div className="p-6 md:p-8 space-y-12">
                {/* Stats Grid */}
                {ordenes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:bg-white transition-all duration-500">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendientes</p>
                                <p className="text-3xl font-black text-slate-900 tracking-tighter">{ordenes.length}</p>
                            </div>
                            <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                <Utensils className="h-6 w-6" />
                            </div>
                        </div>

                        {stats.urgentes > 0 && (
                            <div className="bg-red-500/5 backdrop-blur-xl p-6 rounded-[2rem] border border-red-500/10 shadow-xl shadow-red-200/20 flex items-center justify-between group hover:bg-red-500 transition-all duration-500">
                                <div>
                                    <p className="text-[10px] font-black text-red-500 group-hover:text-white/60 uppercase tracking-widest mb-1">Urgentes</p>
                                    <p className="text-3xl font-black text-red-600 group-hover:text-white tracking-tighter">{stats.urgentes}</p>
                                </div>
                                <div className="h-14 w-14 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-500">
                                    <Zap className="h-6 w-6 text-red-600 group-hover:text-white" />
                                </div>
                            </div>
                        )}

                        {stats.domicilios > 0 && (
                            <div className="bg-blue-500/5 backdrop-blur-xl p-6 rounded-[2rem] border border-blue-500/10 shadow-xl shadow-blue-200/20 flex items-center justify-between group hover:bg-blue-500 transition-all duration-500">
                                <div>
                                    <p className="text-[10px] font-black text-blue-500 group-hover:text-white/60 uppercase tracking-widest mb-1">Domicilios</p>
                                    <p className="text-3xl font-black text-blue-600 group-hover:text-white tracking-tighter">{stats.domicilios}</p>
                                </div>
                                <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all duration-500">
                                    <ShoppingBag className="h-6 w-6 text-blue-600 group-hover:text-white" />
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estado Global</p>
                                <p className="text-xl font-black text-white tracking-tighter uppercase">Cocina Activa</p>
                            </div>
                            <Sparkles className="h-10 w-10 text-orange-500 animate-pulse relative z-10" />
                            <div className="absolute top-0 right-0 h-full w-full bg-gradient-to-br from-orange-500/10 to-transparent opacity-30" />
                        </div>
                    </motion.div>
                )}

                {/* Orders Content */}
                <div className="relative">
                    {ordenes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-32 bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50"
                        >
                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-slate-50/50">
                                <Utensils className="h-10 w-10 text-slate-200" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                                Silencio en Cocina
                            </h2>
                            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest max-w-xs mx-auto">
                                No hay órdenes pendientes por ejecutar en este momento.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <AnimatePresence mode="popLayout">
                                {ordenes.map((orden: OrdenCompleta, index: number) => (
                                    <motion.div
                                        key={orden.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                    >
                                        <OrdenCard
                                            orden={orden}
                                            isExpanded={expandedOrders.has(orden.id)}
                                            toggleExpanded={toggleExpanded}
                                            tiempoTranscurrido={calcularTiempoTranscurrido(orden.created_at)}
                                            timeColor={getTimeColor(orden.created_at)}
                                            processingOrder={processingOrder}
                                            cambiarEstado={handleCambiarEstado}
                                            mostrarPrecios={false}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
