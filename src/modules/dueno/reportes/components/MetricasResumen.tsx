// src/modules/dueno/reportes/components/MetricasResumen.tsx
'use client';

import {
    FiTrendingUp,
    FiPackage,
    FiBarChart2,
    FiDollarSign,
} from "react-icons/fi";
import {
    FaStore,
    FaMotorcycle
} from "react-icons/fa";
import { MdOutlineDeliveryDining } from "react-icons/md";
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    titulo="Total Ventas"
                    valor={formatCurrency(reporte.totalVentas)}
                    icon={<FiTrendingUp />}
                    colorClass="bg-orange-500"
                    loading={loading}
                />
                <MetricCard
                    titulo="Total Pedidos"
                    valor={formatNumber(reporte.totalPedidos)}
                    icon={<FiPackage />}
                    colorClass="bg-blue-500"
                    loading={loading}
                />
                <MetricCard
                    titulo="Ticket Promedio"
                    valor={formatCurrency(reporte.promedioTicket)}
                    icon={<FiBarChart2 />}
                    colorClass="bg-purple-500"
                    loading={loading}
                />
                <MetricCard
                    titulo="Total Propinas"
                    valor={formatCurrency(reporte.totalPropinas)}
                    icon={<FiDollarSign />}
                    colorClass="bg-green-500"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    titulo="Domicilios"
                    valor={formatNumber(reporte.domicilios.total)}
                    subtitulo={`${formatCurrency(reporte.domicilios.ingresosTotales)} en ingresos`}
                    icon={<MdOutlineDeliveryDining />}
                    colorClass="bg-orange-500"
                    loading={loading}
                />
                <MetricCard
                    titulo="Establecimiento"
                    valor={formatNumber(establecimientoData?.cantidad || 0)}
                    subtitulo={`${formatCurrency(establecimientoData?.monto || 0)} en ingresos`}
                    icon={<FaStore />}
                    colorClass="bg-indigo-500"
                    loading={loading}
                />
                <MetricCard
                    titulo="Costos Domicilio"
                    valor={formatCurrency(reporte.totalCostosDomicilio)}
                    subtitulo={`Promedio: ${formatCurrency(reporte.domicilios.costoPromedio)}`}
                    icon={<FaMotorcycle />}
                    colorClass="bg-red-500"
                    loading={loading}
                />
            </div>
        </div>
    );
}