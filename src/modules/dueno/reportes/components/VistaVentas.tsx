// src/modules/dueno/reportes/components/VistaVentas.tsx
'use client';

import { IoFastFoodOutline } from "react-icons/io5";
import { FiCalendar, FiActivity } from "react-icons/fi";
import { formatCurrency, formatDate } from '../utils/formatUtils';
import type { ReporteDatos } from '../types/reportesTypes';

interface VistaVentasProps {
    reporte: ReporteDatos;
}

export default function VistaVentas({ reporte }: VistaVentasProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IoFastFoodOutline className="text-orange-500" />
                    Top Productos Más Vendidos
                </h3>
                <div className="space-y-3">
                    {reporte.topProductos.map((producto, idx) => (
                        <div key={producto.nombre} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 text-orange-600 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800">{producto.nombre}</div>
                                    <div className="text-sm text-gray-500">Precio promedio: {formatCurrency(producto.precioPromedio)}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-gray-900">{formatCurrency(producto.ingresos)}</div>
                                <div className="text-sm text-gray-500">{producto.cantidad} vendidos</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiCalendar className="text-orange-500" />
                        Ventas por Día
                    </h3>
                    <div className="space-y-2">
                        {reporte.ventasPorDia.map((dia) => (
                            <div key={dia.fecha} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                <span className="text-sm text-gray-600">{formatDate(dia.fecha)}</span>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-800">{formatCurrency(dia.ventas)}</div>
                                    <div className="text-xs text-gray-500">{dia.pedidos} pedidos</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiActivity className="text-orange-500" />
                        Ventas por Hora
                    </h3>
                    <div className="space-y-2">
                        {reporte.ventasPorHora.map((hora) => (
                            <div key={hora.hora} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                <span className="text-sm text-gray-600 font-medium">{hora.hora}:00 - {hora.hora + 1}:00</span>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-800">{formatCurrency(hora.ventas)}</div>
                                    <div className="text-xs text-gray-500">{hora.pedidos} pedidos</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}