// src/modules/dueno/reportes/components/ReporteFiltros.tsx
'use client';

import { TbFidgetSpinner } from "react-icons/tb";
import { FiCalendar, FiFilter } from "react-icons/fi";
import { useReporteFilters, type FiltrosData } from '../hooks/useReporteFilters';

interface ReporteFiltrosProps {
    onAplicarFiltros: (filtros: FiltrosData) => void;
    loading?: boolean;
}

export default function ReporteFiltros({ onAplicarFiltros, loading = false }: ReporteFiltrosProps) {
    const { register, handleSubmit, formState } = useReporteFilters();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FiFilter className="text-orange-500" />
                Filtros del Reporte
            </h2>

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FiCalendar className="text-orange-500" />
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            {...register("fechaInicio")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                        {formState.errors.fechaInicio && (
                            <p className="text-sm text-red-600">{formState.errors.fechaInicio.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FiCalendar className="text-orange-500" />
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            {...register("fechaFin")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                        {formState.errors.fechaFin && (
                            <p className="text-sm text-red-600">{formState.errors.fechaFin.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Estado</label>
                        <select
                            {...register("estado")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="orden_tomada">Orden Tomada</option>
                            <option value="lista">Lista</option>
                            <option value="en_camino">En Camino</option>
                            <option value="llegue_a_destino">Llegué a Destino</option>
                            <option value="entregada">Entregada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tipo de Orden</label>
                        <select
                            {...register("tipoOrden")}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="establecimiento">Establecimiento</option>
                            <option value="domicilio">Domicilio</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleSubmit(onAplicarFiltros)}
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 w-full justify-center"
                        >
                            {loading ? (
                                <>
                                    <TbFidgetSpinner className="animate-spin" />
                                    <span>Aplicando...</span>
                                </>
                            ) : (
                                <>
                                    <FiFilter />
                                    <span>Aplicar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}