// src/modules/dueno/reportes/components/VistaResumen.tsx
'use client';

import { FiActivity } from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";
import { getEstadoColor } from '../utils/formatUtils';
import { formatCurrency } from '../utils/formatUtils';
import type { ReporteDatos } from '../types/reportesTypes';

interface VistaResumenProps {
    reporte: ReporteDatos;
}

export default function VistaResumen({ reporte }: VistaResumenProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiActivity className="text-orange-500" />
                        Estados de Órdenes
                    </h3>
                    <div className="space-y-3">
                        {reporte.estadisticasEstados.map((est) => (
                            <div key={est.estado} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getEstadoColor(est.estado)}`}
                                >
                                    {est.estado.replace('_', ' ')}
                                </span>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-800">{est.cantidad}</div>
                                    <div className="text-sm text-gray-500">{est.porcentaje.toFixed(1)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FaMoneyBillWave className="text-orange-500" />
                        Métodos de Pago
                    </h3>
                    <div className="space-y-3">
                        {reporte.ventasPorMetodoPago.map((metodo) => (
                            <div key={metodo.metodo} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                <span className="capitalize text-gray-700 font-medium">{metodo.metodo}</span>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-800">{formatCurrency(metodo.monto)}</div>
                                    <div className="text-sm text-gray-500">{metodo.cantidad} transacciones</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}