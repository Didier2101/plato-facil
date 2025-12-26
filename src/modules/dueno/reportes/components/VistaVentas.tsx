"use client";

import { Utensils, Calendar, Zap, Sparkles, TrendingUp, Clock, Award, Star } from "lucide-react";
import { formatCurrency, formatDate } from '../utils/formatUtils';
import type { ReporteDatos } from '../types/reportesTypes';
import { motion } from "framer-motion";

interface VistaVentasProps {
    reporte: ReporteDatos;
}

export default function VistaVentas({ reporte }: VistaVentasProps) {
    return (
        <div className="space-y-12">
            {/* Top Productos - High impact list */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50 group transition-all duration-500"
            >
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:bg-orange-500 transition-colors duration-500">
                            <Utensils className="h-8 w-8 text-orange-500 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Elite de Ventas</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-1 mt-1">
                                <Award className="h-3 w-3 text-orange-500" />
                                Productos con Mayor Tracción
                            </p>
                        </div>
                    </div>
                    <Sparkles className="h-6 w-6 text-orange-400 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reporte.topProductos.map((producto, idx) => (
                        <motion.div
                            key={producto.nombre}
                            whileHover={{ x: 5, scale: 1.02 }}
                            className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-[2rem] transition-all duration-500 border-2 border-transparent hover:border-slate-50 hover:shadow-xl hover:shadow-slate-100/50"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl ${idx === 0 ? 'bg-orange-500 text-white shadow-xl shadow-orange-200' : 'bg-slate-900 text-white shadow-lg shadow-slate-200'}`}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 tracking-tight uppercase text-xs mb-1 line-clamp-1">{producto.nombre}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Star className="h-2 w-2 text-orange-500 fill-orange-500" />
                                        </div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{producto.cantidad} UNIDADES</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(producto.ingresos)}</div>
                                <div className="text-[9px] font-black text-orange-500 uppercase tracking-widest opacity-50">PROM: {formatCurrency(producto.precioPromedio)}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Ventas por Tiempo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50 group transition-all duration-500"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-14 w-14 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-900 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                            <Calendar className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Historial Diario</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Flujo de Caja por Jornada</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {reporte.ventasPorDia.map((dia) => (
                            <div key={dia.fecha} className="flex justify-between items-center p-6 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 border-2 border-transparent hover:border-slate-50 rounded-[2rem] transition-all duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="h-2.5 w-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{formatDate(dia.fecha)}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(dia.ventas)}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dia.pedidos} ÓRDENES</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-400/30 group transition-all duration-500"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="h-14 w-14 bg-white/10 rounded-[2rem] flex items-center justify-center border border-white/10">
                            <Clock className="h-7 w-7 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-tight">Densidad Horaria</h3>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-1 mt-1">
                                <Zap className="h-3 w-3 text-orange-500" />
                                Picos de Actividad
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {reporte.ventasPorHora.map((hora) => (
                            <div key={hora.hora} className="flex justify-between items-center p-6 hover:bg-white/10 border-2 border-transparent hover:border-white/5 rounded-[2rem] transition-all duration-500">
                                <div className="flex items-center gap-4">
                                    <TrendingUp className="h-4 w-4 text-orange-500" />
                                    <span className="text-xs font-black text-white/80 uppercase tracking-widest">{hora.hora}:00 — {hora.hora + 1}:00</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-white tracking-tighter">{formatCurrency(hora.ventas)}</div>
                                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{hora.pedidos} TRANSACCIONES</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
