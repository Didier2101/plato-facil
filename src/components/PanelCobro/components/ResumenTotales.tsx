import React from 'react';
import { OrdenParaCobro } from '../types/cobro';
import { formatearPrecioCOP } from '../utils/calculosCobro';

/**
 * Componente que muestra el resumen de totales de la orden
 * Incluye desglose de productos, domicilio, propina y total final
 * Ahora con un diseño consistente
 */

interface Props {
    orden: OrdenParaCobro;
    propina: number;
}

export const ResumenTotales: React.FC<Props> = ({ orden, propina }) => {
    // Calcular totales usando los campos específicos de OrdenParaCobro
    const subtotalProductos = Number(orden.subtotal_productos || 0);
    const costoDomicilio = Number(orden.costo_domicilio || 0);
    const totalOrden = subtotalProductos + costoDomicilio;
    const totalConPropina = totalOrden + propina;

    return (
        // Contenedor principal estilo 'Tarjeta' limpia y borde sutil
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">

            {/* Contenedor de Desglose de Precios */}
            <div className="space-y-3 text-sm">

                {/* Línea de productos */}
                <div className="flex justify-between items-center text-gray-700">
                    <span className="font-normal">Subtotal Productos</span>
                    <span className="font-medium text-gray-900">
                        {formatearPrecioCOP(subtotalProductos)}
                    </span>
                </div>

                {/* Línea de domicilio (solo si tiene costo) */}
                {costoDomicilio > 0 && (
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-normal">Costo de Domicilio</span>
                        <span className="font-medium text-gray-900">
                            {formatearPrecioCOP(costoDomicilio)}
                        </span>
                    </div>
                )}

                {/* Línea de propina (solo si hay propina) */}
                {propina > 0 && (
                    <div className="flex justify-between items-center text-gray-700">
                        <span className="font-normal">Propina</span>
                        <span className="font-medium text-gray-900">
                            {formatearPrecioCOP(propina)}
                        </span>
                    </div>
                )}
            </div>

            {/* Separador */}
            <hr className="border-t border-gray-200" />

            {/* Total final destacado como línea separada y principal */}
            {/* Destacamos el total usando un color de fondo ligero (simula el énfasis de Airbnb) */}
            <div className="flex justify-between font-bold text-lg bg-gray-50 rounded-lg p-3 border border-gray-200">
                <span className="text-gray-900">TOTAL A COBRAR</span>
                <span className="text-gray-900">{formatearPrecioCOP(totalConPropina)}</span>
            </div>
        </div>
    );
};