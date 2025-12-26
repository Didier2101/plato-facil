"use client";

import { Calendar, Filter, ChevronRight, Activity, Zap } from "lucide-react";
import { TbFidgetSpinner } from "react-icons/tb";
import { motion } from "framer-motion";
import { useReporteFilters, type FiltrosData } from '../hooks/useReporteFilters';

interface ReporteFiltrosProps {
    onAplicarFiltros: (filtros: FiltrosData) => void;
    loading?: boolean;
}

export default function ReporteFiltros({ onAplicarFiltros, loading = false }: ReporteFiltrosProps) {
    const { register, handleSubmit, formState } = useReporteFilters();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl shadow-slate-200/50 p-10"
        >
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 group-hover:bg-orange-500 transition-colors duration-500">
                        <Filter className="h-8 w-8 text-orange-500 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                            Explorar Inteligencia
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-1 mt-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            Filtros de Análisis Avanzado
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onAplicarFiltros)}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 items-end">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            {...register("fechaInicio")}
                            className="w-full h-16 px-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-black text-slate-900 text-xs uppercase"
                        />
                        {formState.errors.fechaInicio && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-2">{formState.errors.fechaInicio.message}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-orange-500" />
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            {...register("fechaFin")}
                            className="w-full h-16 px-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-black text-slate-900 text-xs uppercase"
                        />
                        {formState.errors.fechaFin && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-2">{formState.errors.fechaFin.message}</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-orange-500" />
                            Estado
                        </label>
                        <select
                            {...register("estado")}
                            className="w-full h-16 px-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-black text-slate-900 text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
                        >
                            <option value="">TODOS LOS ESTADOS</option>
                            <option value="orden_tomada">ORDEN TOMADA</option>
                            <option value="lista">ORDEN LISTA</option>
                            <option value="en_camino">EN CAMINO</option>
                            <option value="llegue_a_destino">EN DESTINO</option>
                            <option value="entregada">ENTREGADA</option>
                            <option value="cancelada">CANCELADA</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5 text-orange-500" />
                            Canal
                        </label>
                        <select
                            {...register("tipoOrden")}
                            className="w-full h-16 px-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-black text-slate-900 text-[10px] uppercase tracking-widest appearance-none cursor-pointer"
                        >
                            <option value="">TODOS LOS CANALES</option>
                            <option value="establecimiento">ESTABLECIMIENTO</option>
                            <option value="domicilio">DOMICILIO</option>
                        </select>
                    </div>

                    <div className="flex">
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleSubmit(onAplicarFiltros)}
                            disabled={loading}
                            className="h-16 bg-slate-900 hover:bg-orange-500 text-white font-black rounded-[1.5rem] px-8 transition-all duration-300 flex items-center gap-3 w-full justify-center shadow-xl hover:shadow-orange-200/50 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <TbFidgetSpinner className="animate-spin h-5 w-5" />
                                    <span className="uppercase tracking-[0.2em] text-[10px]">Actualizando...</span>
                                </>
                            ) : (
                                <>
                                    <Activity className="h-5 w-5" />
                                    <span className="uppercase tracking-[0.2em] text-[10px]">Actualizar Data</span>
                                    <ChevronRight className="h-4 w-4 opacity-50 ml-1" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
