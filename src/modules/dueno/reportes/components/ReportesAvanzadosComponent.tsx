// src/modules/dueno/reportes/components/ReportesAvanzadosComponent.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiTrendingUp, FiUsers, FiBarChart2 } from "react-icons/fi";
import { MdOutlineAnalytics } from "react-icons/md";
import Loading from '@/src/shared/components/ui/Loading';
import { ErrorState, PageHeader } from '@/src/shared/components'; // Importamos los nuevos componentes
import { useReporteData } from '../hooks/useReporteData';
import { useReporteFilters, type FiltrosData } from '../hooks/useReporteFilters';
import ReporteFiltros from './ReporteFiltros';
import MetricasResumen from './MetricasResumen';
import VistaResumen from './VistaResumen';
import VistaVentas from './VistaVentas';
import VistaEquipo from './VistaEquipo';

export default function ReportesAvanzadosComponent() {
    const [vistaActiva, setVistaActiva] = useState<'resumen' | 'ventas' | 'equipo'>('resumen');
    const { filtros, setFiltros } = useReporteFilters();
    const { reporte, loading, error, cargarReporte, clearError } = useReporteData();
    const [saving, setSaving] = useState(false);

    // Cargar reporte inicial
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
                texto="Cargando reportes..."
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
                retryText="Reintentar carga de reportes"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Reportes de Ventas"
                variant="reportes"
                icon={<MdOutlineAnalytics />}
            />

            <div className=" px-6 py-8 space-y-8">
                <ReporteFiltros
                    onAplicarFiltros={handleAplicarFiltros}
                    loading={saving}
                />

                {/* Navegación entre vistas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setVistaActiva('resumen')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${vistaActiva === 'resumen'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            aria-label="Ver resumen ejecutivo"
                            aria-pressed={vistaActiva === 'resumen'}
                        >
                            <FiTrendingUp />
                            Resumen Ejecutivo
                        </button>
                        <button
                            onClick={() => setVistaActiva('ventas')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${vistaActiva === 'ventas'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            aria-label="Ver análisis de ventas"
                            aria-pressed={vistaActiva === 'ventas'}
                        >
                            <FiBarChart2 />
                            Análisis de Ventas
                        </button>
                        <button
                            onClick={() => setVistaActiva('equipo')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${vistaActiva === 'equipo'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            aria-label="Ver rendimiento del equipo"
                            aria-pressed={vistaActiva === 'equipo'}
                        >
                            <FiUsers />
                            Rendimiento del Equipo
                        </button>
                    </div>
                </div>

                {!reporte ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-500">No se encontraron ventas para el período seleccionado</p>
                    </div>
                ) : (
                    <>
                        <MetricasResumen reporte={reporte} />

                        {/* Vista activa */}
                        <div className="transition-opacity duration-200">
                            {vistaActiva === 'resumen' && <VistaResumen reporte={reporte} />}
                            {vistaActiva === 'ventas' && <VistaVentas reporte={reporte} />}
                            {vistaActiva === 'equipo' && <VistaEquipo reporte={reporte} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}