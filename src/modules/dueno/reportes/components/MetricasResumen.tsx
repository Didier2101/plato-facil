"use client";

import {
    TrendingUp,
    Package,
    BarChart3,
    DollarSign,
    Store,
    Bike,
    Truck,
    Sparkles,
    Activity
} from "lucide-react";
import MetricCard from './MetricCard';
import { formatCurrency, formatNumber } from '../utils/formatUtils';
import type { ReporteDatos } from '../types/reportesTypes';

interface MetricasResumenProps {
    reporte: ReporteDatos;
    loading?: boolean;
}

export default function MetricasResumen({ reporte, loading = false }: MetricasResumenProps) {
    const establecimientoData = reporte.ventasPorTipoOrden.find(t => t.tipo === 'establecimiento');

    return (
        <div className="space-y-12">
            {/* Top Metrics - High Importance Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <MetricCard
                    titulo="Facturación Total"
                    valor={formatCurrency(reporte.totalVentas)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    subtitulo="Ingresos brutos acumulados"
                    loading={loading}
                />
                <MetricCard
                    titulo="Volumen Pedidos"
                    valor={formatNumber(reporte.totalPedidos)}
                    icon={<Package className="h-6 w-6" />}
                    subtitulo="Órdenes gestionadas"
                    loading={loading}
                />
                <MetricCard
                    titulo="Ticket Promedio"
                    valor={formatCurrency(reporte.promedioTicket)}
                    icon={<BarChart3 className="h-6 w-6" />}
                    subtitulo="Valor medio por venta"
                    loading={loading}
                />
                <MetricCard
                    titulo="Recaudo Propinas"
                    valor={formatCurrency(reporte.totalPropinas)}
                    icon={<DollarSign className="h-6 w-6" />}
                    subtitulo="Aporte a repartidores"
                    loading={loading}
                />
            </div>

            {/* Service Type Strategy Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <MetricCard
                    titulo="Canal Domicilios"
                    valor={formatNumber(reporte.domicilios.total)}
                    subtitulo={`${formatCurrency(reporte.domicilios.ingresosTotales)} recaudados`}
                    icon={<Truck className="h-6 w-6" />}
                    loading={loading}
                />
                <MetricCard
                    titulo="Ventas en Local"
                    valor={formatNumber(establecimientoData?.cantidad || 0)}
                    subtitulo={`${formatCurrency(establecimientoData?.monto || 0)} recaudados`}
                    icon={<Store className="h-6 w-6" />}
                    loading={loading}
                />
                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200/50 flex flex-col justify-center relative overflow-hidden group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-32 w-32 -mr-10 -mt-10 text-orange-500" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                            <Bike className="h-7 w-7 text-orange-500 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Logística Delivery</h4>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-orange-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Optimizado</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 space-y-2">
                        <p className="text-4xl font-black tracking-tighter text-white">{formatCurrency(reporte.totalCostosDomicilio)}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Truck className="h-3 w-3" />
                            Coste/Envío: {formatCurrency(reporte.domicilios.costoPromedio)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
