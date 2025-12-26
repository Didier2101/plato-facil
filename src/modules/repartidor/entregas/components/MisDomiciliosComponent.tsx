"use client";

import React from 'react';
import {
    DollarSign,
    TrendingUp,
    MapPin,
    Package,
    Search,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { useHistorialEntregas } from '../hooks/useHistorialEntregas';
import Loading from '@/src/shared/components/ui/Loading';

interface MisDomiciliosComponentProps {
    usuarioId: string;
}

export default function MisDomiciliosComponent({ usuarioId }: MisDomiciliosComponentProps) {
    const {
        domicilios,
        estadisticas,
        loading,
        error
    } = useHistorialEntregas(usuarioId);

    if (loading) return <Loading texto="Cargando tus ganancias..." />;

    return (
        <div className="space-y-12 pb-32">
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 text-sm text-red-600 animate-in fade-in slide-in-from-top-4 duration-500">
                    <p className="font-black uppercase tracking-wider flex items-center gap-2">
                        <Search className="h-4 w-4" /> Error de carga
                    </p>
                    <p className="mt-1 font-medium">{error}</p>
                </div>
            )}

            {/* Stats Dashboard */}
            {estadisticas && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-slate-200 transition-all duration-500 hover:scale-[1.01]">
                        <div className="absolute -top-10 -right-10 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:-rotate-12 duration-700">
                            <DollarSign className="h-64 w-64 text-orange-500" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Balance Total Acumulado</p>
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
                                <span className="text-orange-500 mr-2">$</span>
                                {estadisticas.total_ganancias_domicilio.toLocaleString('es-CO')}
                            </h2>

                            <div className="flex flex-wrap items-center gap-6 mt-10 p-6 bg-white/5 rounded-[2rem] backdrop-blur-sm border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entregas</p>
                                    <p className="text-xl font-black text-white">{estadisticas.total_domicilios}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Este Mes</p>
                                    <p className="text-xl font-black text-white">{estadisticas.domicilios_este_mes}</p>
                                </div>
                                <div className="w-px h-8 bg-white/10 hidden sm:block"></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Distancia</p>
                                    <p className="text-xl font-black text-white text-orange-500">{estadisticas.distancia_total_km.toFixed(1)} <span className="text-xs uppercase ml-1">km</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-50 shadow-xl shadow-slate-100 flex flex-col justify-between group hover:border-orange-200 transition-all duration-300">
                            <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Promedio Diario</p>
                                <p className="text-2xl font-black text-slate-900 mt-1">
                                    ${(estadisticas.total_ganancias_domicilio / 30).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                        <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-100 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all">
                            <ArrowUpRight className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform" />
                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Meta Mensual</p>
                                <p className="text-2xl font-black text-white mt-1">
                                    {((estadisticas.domicilios_este_mes / 100) * 100).toFixed(0)}% <span className="text-xs font-bold uppercase ml-1">Logrado</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Historial Reciente <span className="text-slate-900 ml-1">({domicilios.length})</span>
                    </h3>
                </div>

                {domicilios.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {domicilios.map((domicilio) => (
                            <div
                                key={domicilio.id}
                                className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-8 flex flex-col gap-6 shadow-xl shadow-slate-100 group hover:border-orange-500/20 hover:shadow-orange-100 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-sm">
                                            <Package className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                                                #{domicilio.id.slice(-6).toUpperCase()}
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-orange-500">Completada</span>
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                                {new Date(domicilio.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">
                                            <span className="text-orange-500 text-xs mr-0.5">$</span>
                                            {(domicilio.total_final || domicilio.total).toLocaleString('es-CO')}
                                        </p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pagado</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center gap-3 text-slate-500">
                                    <div className="bg-slate-50 p-2 rounded-xl">
                                        <MapPin className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <span className="text-xs font-bold truncate tracking-tight">{domicilio.cliente_direccion}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center shadow-sm">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-slate-50/50">
                            <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Sin historial de entregas</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium italic">¡Comienza a entregar hoy mismo!</p>
                    </div>
                )}
            </section>
        </div>
    );
}