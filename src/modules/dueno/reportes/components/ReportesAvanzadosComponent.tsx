"use client";

import { useState, useEffect, useCallback } from 'react';
import { Package, TrendingUp, BarChart3, LayoutDashboard, Zap, Sparkles } from "lucide-react";
import Loading from '@/src/shared/components/ui/Loading';
import { ErrorState, PageHeader } from '@/src/shared/components';
import { useReporteData } from '../hooks/useReporteData';
import { useReporteFilters, type FiltrosData } from '../hooks/useReporteFilters';
import ReporteFiltros from './ReporteFiltros';
import MetricasResumen from './MetricasResumen';
import VistaResumen from './VistaResumen';
import VistaVentas from './VistaVentas';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportesAvanzadosComponent() {
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'ventas'>('resumen');
    const { filtros, setFiltros } = useReporteFilters();
    const { reporte, loading, error, cargarReporte, clearError } = useReporteData();
    const [saving, setSaving] = useState(false);

    const cargarReporteInicial = useCallback(async () => {
        await cargarReporte(filtros);
    }, [cargarReporte, filtros]);

    useEffect(() => {
        cargarReporteInicial();
    }, [cargarReporteInicial]);

    const handleAplicarFiltros = useCallback(async (data: FiltrosData) => {
        setSaving(true);
        try {
            await cargarReporte(data);
            setFiltros(data);
        } finally {
            setSaving(false);
        }
    }, [cargarReporte, setFiltros]);

    if (loading) {
        return (
            <Loading
                texto="Sincronizando Inteligencia..."
                tamaño="grande"
                color="orange-500"
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={() => {
                    clearError();
                    cargarReporteInicial();
                }}
                retryText="Reintentar Sincronización"
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Centro de Inteligencia"
                variant="reportes"
                icon={<LayoutDashboard className="h-8 w-8 text-orange-500" />}
            />

            <div className="px-6 lg:px-10 py-10 space-y-12 max-w-[1600px] mx-auto">
                <ReporteFiltros
                    onAplicarFiltros={handleAplicarFiltros}
                    loading={saving}
                />

                {!reporte ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-20 text-center border border-white/50 shadow-2xl shadow-slate-200/50"
                    >
                        <div className="h-24 w-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                            <Package className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Sin Datos Disponibles</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Ajusta los filtros para explorar el rendimiento</p>
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-12">
                            <MetricasResumen reporte={reporte} />

                            {/* Premium Tab Navigation */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="bg-white/70 backdrop-blur-xl p-2 rounded-[2rem] border border-white/50 shadow-xl shadow-slate-200/30 inline-flex gap-2">
                                    <button
                                        onClick={() => setVistaActiva('resumen')}
                                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] transition-all duration-500 text-[10px] font-black uppercase tracking-widest ${vistaActiva === 'resumen'
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                            : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                                            }`}
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                        Resumen Ejecutivo
                                    </button>
                                    <button
                                        onClick={() => setVistaActiva('ventas')}
                                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] transition-all duration-500 text-[10px] font-black uppercase tracking-widest ${vistaActiva === 'ventas'
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                            : 'text-slate-400 hover:text-slate-900 hover:bg-white'
                                            }`}
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        Análisis de Ventas
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-2xl border border-orange-100/50">
                                    <Zap className="h-4 w-4 text-orange-500" />
                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Data en Tiempo Real</span>
                                    <Sparkles className="h-3 w-3 text-orange-400 animate-pulse" />
                                </div>
                            </div>

                            {/* Vista activa with Animation */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={vistaActiva}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                >
                                    {vistaActiva === 'resumen' && <VistaResumen reporte={reporte} />}
                                    {vistaActiva === 'ventas' && <VistaVentas reporte={reporte} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
