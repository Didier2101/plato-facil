"use client";

import { MetodoPago } from '@/src/modules/admin/caja/types/cobro';

import React, { useState } from 'react';
import {
    MapPin,
    Phone,
    Navigation,
    User,
    Box,
    CheckCircle2,
    Search,
    ChevronRight,
    RefreshCw,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import { useEntregasActivas } from '../hooks/useEntregasActivas';
import Loading from '@/src/shared/components/ui/Loading';
import PanelCobro from '@/src/modules/admin/caja/components/PanelCobro';
import type { EntregaRepartidor } from '../types/entrega';

interface DomiciliarioPanelProps {
    usuarioId: string;
}

export default function DomiciliarioPanel({ usuarioId }: DomiciliarioPanelProps) {
    const {
        loading,
        error,
        actualizando,
        tomarOrden,
        marcarLlegada,
        abrirMapa,
        ordenesListas,
        ordenesEnCurso,
        cargarOrdenes
    } = useEntregasActivas(usuarioId);

    const [ordenParaCobrar, setOrdenParaCobrar] = useState<EntregaRepartidor | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('');
    const [propina, setPropina] = useState(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);

    const handleCobroExitoso = () => {
        setOrdenParaCobrar(null);
        cargarOrdenes();
    };

    if (loading) return <Loading texto="Sincronizando órdenes..." />;

    return (
        <div className="space-y-12 pb-32 font-sans">
            {/* Status Check / Error */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 flex items-start gap-6 shadow-sm border-l-8 border-l-red-500 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-red-100 p-4 rounded-2xl shadow-inner text-red-600">
                        <AlertCircle className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-black text-red-900 uppercase tracking-widest">Error de Sincronización</p>
                        <p className="text-xs text-red-600 mt-2 font-bold leading-relaxed">{error}</p>
                        <button
                            onClick={() => cargarOrdenes()}
                            className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-red-200 active:scale-95 transition-all"
                        >
                            Reintentar Conexión
                        </button>
                    </div>
                </div>
            )}

            {/* Active Deliveries (En Camino / Llegué) */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 px-4">
                    <div className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                        Entregas Activas <span className="ml-2 text-slate-900 bg-white px-3 py-1 rounded-full shadow-sm">[{ordenesEnCurso.length}]</span>
                    </h2>
                </div>

                {ordenesEnCurso.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {ordenesEnCurso.map((orden) => (
                            <div
                                key={orden.id}
                                className={`bg-white rounded-[3rem] shadow-xl border-2 transition-all duration-500 overflow-hidden group animate-in zoom-in-95 duration-700 ${orden.estado === 'llegue_a_destino'
                                    ? 'border-orange-500 shadow-orange-100/50 scale-[1.02]'
                                    : 'border-slate-50 hover:border-orange-200 shadow-slate-100'
                                    }`}
                            >
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-5">
                                            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-lg ${orden.estado === 'llegue_a_destino'
                                                ? 'bg-orange-500 text-white shadow-orange-200 rotate-12'
                                                : 'bg-slate-50 text-slate-400 group-hover:rotate-6'
                                                }`}>
                                                <Navigation className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900 tracking-tighter flex items-center gap-2">
                                                    #{orden.id.slice(-6).toUpperCase()}
                                                    <span className="text-orange-500 opacity-50">/</span>
                                                    <span className="text-orange-500 text-xs font-black uppercase tracking-widest">{orden.estado === 'en_camino' ? 'En ruta' : 'Finalizando'}</span>
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                                    Entrega Express
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 py-8 border-y border-slate-50 relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-slate-50"></div>

                                        <div className="flex items-start gap-5 relative z-10">
                                            <div className="bg-slate-50 h-12 w-12 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <User className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                                                <p className="text-sm font-black text-slate-900 truncate uppercase">{orden.cliente_nombre}</p>
                                                <p className="text-xs text-orange-500 font-bold mt-1 tracking-widest">{orden.cliente_telefono || '--- --- ---'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-5 relative z-10">
                                            <div className="bg-orange-50 h-12 w-12 rounded-[1.2rem] flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <MapPin className="h-6 w-6 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destino</p>
                                                <p className="text-sm font-black text-slate-700 leading-relaxed uppercase">
                                                    {orden.cliente_direccion}
                                                </p>
                                                {orden.cliente_notas && (
                                                    <div className="mt-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                                        <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                            <Box className="h-3 w-3" /> Instrucciones:
                                                        </p>
                                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">&quot;{orden.cliente_notas}&quot;</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a Cobrar</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                            <span className="text-orange-500 text-sm mr-1">$</span>
                                            {(orden.total_final || orden.total).toLocaleString('es-CO')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => abrirMapa(orden)}
                                            className="bg-white border-2 border-slate-100 hover:border-orange-500 hover:text-orange-600 text-slate-900 px-4 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm hover:shadow-orange-100"
                                        >
                                            <Navigation className="h-4 w-4" />
                                            Ver Mapa
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `tel:${orden.cliente_telefono}`}
                                            className="bg-white border-2 border-slate-100 hover:border-slate-900 hover:text-white text-slate-900 px-4 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Llamar
                                        </button>
                                    </div>

                                    {orden.estado === 'en_camino' ? (
                                        <button
                                            onClick={() => marcarLlegada(orden.id)}
                                            disabled={actualizando === orden.id}
                                            className="w-full bg-slate-900 hover:bg-orange-500 disabled:opacity-50 text-white px-4 py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-slate-200 hover:shadow-orange-400/30"
                                        >
                                            {actualizando === orden.id ? (
                                                <RefreshCw className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-6 w-6" />
                                                    Marcar Llegada
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setOrdenParaCobrar(orden)}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-orange-200"
                                        >
                                            <CreditCard className="h-6 w-6" />
                                            Finalizar Cobro
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[4rem] border-2 border-dashed border-slate-100 p-24 text-center space-y-6 shadow-sm">
                        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto ring-[16px] ring-slate-50/50">
                            <Search className="h-10 w-10 text-slate-200" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-slate-900 tracking-tighter uppercase mb-2">Sin Entregas Activas</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Las órdenes que aceptes aparecerán aquí con todos los detalles de entrega</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Available Orders (Lista) */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 px-4">
                    <div className="h-1.5 w-1.5 bg-slate-400 rounded-full shadow-[0_0_8px_rgba(148,163,184,0.5)]"></div>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                        Panel de Órdenes <span className="ml-2 text-slate-400 border-2 border-slate-100 px-3 py-1 rounded-full">{ordenesListas.length}</span>
                    </h2>
                </div>

                {ordenesListas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ordenesListas.map((orden) => (
                            <div
                                key={orden.id}
                                className="bg-white rounded-[2.5rem] border-2 border-transparent p-6 flex items-center justify-between shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:border-orange-500/20 active:scale-[0.98] transition-all duration-500 group animate-in slide-in-from-bottom-4"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm border border-slate-100">
                                        <Box className="h-8 w-8" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-lg font-black text-slate-900 tracking-tighter">#{orden.id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[11px] font-bold text-slate-500 truncate max-w-[150px] mt-1 flex items-center gap-1.5 uppercase">
                                            <MapPin className="h-3 w-3 text-orange-500" />
                                            {orden.cliente_direccion.split(',')[0]}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100">
                                                ${(orden.total_final || orden.total).toLocaleString('es-CO')}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                <RefreshCw className="h-2.5 w-2.5" /> Lista
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => tomarOrden(orden.id)}
                                    disabled={actualizando === orden.id}
                                    className="bg-slate-900 group-hover:bg-orange-500 hover:scale-110 disabled:opacity-50 text-white h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl shadow-slate-200 group-hover:shadow-orange-200 active:rotate-45"
                                >
                                    {actualizando === orden.id ? (
                                        <RefreshCw className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <ChevronRight className="h-7 w-7" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-20 text-center group">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="h-10 w-10 text-slate-200 animate-spin transition-all group-hover:text-orange-300" style={{ animationDuration: '3s' }} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Escaneando pedidos en tiempo real...</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Modal de Cobro */}
            {ordenParaCobrar && (
                <PanelCobro
                    ordenSeleccionada={ordenParaCobrar}
                    usuarioId={usuarioId}
                    metodoPago={metodoPago}
                    setMetodoPago={setMetodoPago}
                    propina={propina}
                    setPropina={setPropina}
                    propinaPorcentaje={propinaPorcentaje}
                    setPropinaPorcentaje={setPropinaPorcentaje}
                    onSuccess={handleCobroExitoso}
                    onRecargarOrdenes={cargarOrdenes}
                    onClose={() => {
                        setOrdenParaCobrar(null);
                        setMetodoPago('');
                        setPropina(0);
                        setPropinaPorcentaje(null);
                    }}
                />
            )}
        </div>
    );
}
