"use client";

import { Activity, CreditCard, PieChart, TrendingUp, DollarSign, Target, Briefcase } from "lucide-react";
import { getEstadoColor } from '../utils/formatUtils';
import { formatCurrency } from '../utils/formatUtils';
import type { ReporteDatos } from '../types/reportesTypes';
import { motion } from "framer-motion";

interface VistaResumenProps {
    reporte: ReporteDatos;
}

export default function VistaResumen({ reporte }: VistaResumenProps) {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Estados de Órdenes */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 flex flex-col h-full border border-white shadow-2xl shadow-slate-200/50 group transition-all duration-500 hover:shadow-orange-100/20"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 group-hover:bg-orange-500 transition-colors duration-500">
                                <Activity className="h-8 w-8 text-orange-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Estado Operativo</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1 mt-1">
                                    <Target className="h-3 w-3 text-orange-500" />
                                    Distribución de Cocina
                                </p>
                            </div>
                        </div>
                        <PieChart className="h-6 w-6 text-slate-200" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {reporte.estadisticasEstados.map((est, index) => (
                            <motion.div
                                key={est.estado}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group/item flex justify-between items-center p-6 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 rounded-[2rem] transition-all duration-500 border-2 border-transparent hover:border-slate-50"
                            >
                                <div className="flex items-center gap-4">
                                    <span
                                        className={`inline-flex px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 ${getEstadoColor(est.estado)} shadow-sm`}
                                    >
                                        {est.estado.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{est.cantidad}</div>
                                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{est.porcentaje.toFixed(1)}%</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Métodos de Pago */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col h-full shadow-2xl shadow-slate-400/30 group transition-all duration-500 hover:scale-[1.01]"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-white/10 rounded-[2rem] flex items-center justify-center text-white border border-white/10 shadow-inner group-hover:border-orange-500/50 transition-colors">
                                <DollarSign className="h-8 w-8 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight">Canales de Recaudo</h3>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3 text-orange-500" />
                                    Gestión Financiera
                                </p>
                            </div>
                        </div>
                        <TrendingUp className="h-6 w-6 text-white/10" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {reporte.ventasPorMetodoPago.map((metodo, index) => (
                            <motion.div
                                key={metodo.metodo}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group/item flex justify-between items-center p-6 bg-white/5 hover:bg-white/10 rounded-[2rem] transition-all duration-500 border-2 border-transparent hover:border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner group-hover/item:scale-110 transition-transform duration-500">
                                        <CreditCard className="h-7 w-7 text-orange-500" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.1em] text-white/80">{metodo.metodo}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-white tracking-tighter">{formatCurrency(metodo.monto)}</div>
                                    <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{metodo.cantidad} TRXS</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
