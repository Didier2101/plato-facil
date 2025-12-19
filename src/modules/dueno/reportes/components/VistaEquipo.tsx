// src/modules/dueno/reportes/components/VistaEquipo.tsx
'use client';

import { FiUsers } from "react-icons/fi";
import { formatCurrency } from '../utils/formatUtils';
import type { ReporteDatos } from '../types/reportesTypes';

interface VistaEquipoProps {
    reporte: ReporteDatos;
}

export default function VistaEquipo({ reporte }: VistaEquipoProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUsers className="text-orange-500" />
                    Rendimiento por Empleado
                </h3>
                <div className="space-y-4">
                    {reporte.ventasPorUsuario.map((usuario) => (
                        <div key={usuario.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-lg">{usuario.nombre}</h4>
                                    <span className="text-sm text-gray-500 capitalize">{usuario.rol}</span>
                                </div>
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {usuario.pedidos} pedidos
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Total Ventas</div>
                                    <div className="font-bold text-gray-900">{formatCurrency(usuario.totalVentas)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Ticket Promedio</div>
                                    <div className="font-bold text-gray-900">{formatCurrency(usuario.promedioTicket)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Propinas</div>
                                    <div className="font-bold text-green-600">{formatCurrency(usuario.propinasRecibidas)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}