// src/modules/dueno/configuraciones/components/ConfiguracionDomicilios.tsx
'use client';

import { useState } from 'react';
import {
    FaDollarSign,
    FaRoute,
    FaClock,
    FaGlobe,
    FaBusinessTime,
    FaRulerHorizontal,
    FaCalculator
} from 'react-icons/fa';
import type { ConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';

interface ConfiguracionDomiciliosProps {
    configuracion: ConfiguracionRestaurante;
    onConfigChange: (configuracion: ConfiguracionRestaurante) => void;
}

export default function ConfiguracionDomicilios({
    configuracion,
    onConfigChange
}: ConfiguracionDomiciliosProps) {
    const [formData, setFormData] = useState(configuracion);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? parseFloat(value) || 0 : value;

        const updated = { ...formData, [name]: newValue };
        setFormData(updated);
        onConfigChange(updated);
    };

    // Calcular costo de ejemplo
    const calcularCostoEjemplo = (distancia: number) => {
        if (distancia <= formData.distancia_base_km) {
            return formData.costo_base_domicilio;
        }
        const distanciaExtra = distancia - formData.distancia_base_km;
        return formData.costo_base_domicilio + (distanciaExtra * formData.costo_por_km);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Configuración de Domicilios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaDollarSign className="text-orange-500" />
                        Costo Base
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                            type="number"
                            name="costo_base_domicilio"
                            value={formData.costo_base_domicilio}
                            onChange={handleInputChange}
                            min="0"
                            step="500"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                    </div>
                    <p className="text-xs text-gray-500">Costo mínimo del domicilio</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaRulerHorizontal className="text-orange-500" />
                        Distancia Base
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="distancia_base_km"
                            value={formData.distancia_base_km}
                            onChange={handleInputChange}
                            min="0.1"
                            max="5"
                            step="0.1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">KM</span>
                    </div>
                    <p className="text-xs text-gray-500">Distancia incluida en el costo base</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaRoute className="text-orange-500" />
                        Costo por KM
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                            type="number"
                            name="costo_por_km"
                            value={formData.costo_por_km}
                            onChange={handleInputChange}
                            min="0"
                            step="100"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                    </div>
                    <p className="text-xs text-gray-500">Costo por kilómetro extra</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaGlobe className="text-orange-500" />
                        Distancia Máxima
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="distancia_maxima_km"
                            value={formData.distancia_maxima_km}
                            onChange={handleInputChange}
                            min="1"
                            max="50"
                            step="0.5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">KM</span>
                    </div>
                    <p className="text-xs text-gray-500">Límite de entrega</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaClock className="text-orange-500" />
                        Tiempo de Preparación
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="tiempo_preparacion_min"
                            value={formData.tiempo_preparacion_min}
                            onChange={handleInputChange}
                            min="5"
                            max="120"
                            step="5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">min</span>
                    </div>
                    <p className="text-xs text-gray-500">Tiempo estimado de preparación</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaBusinessTime className="text-orange-500" />
                        Hora de Apertura
                    </label>
                    <input
                        type="time"
                        name="hora_apertura"
                        value={formData.hora_apertura || '08:00'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaBusinessTime className="text-orange-500" />
                        Hora de Cierre
                    </label>
                    <input
                        type="time"
                        name="hora_cierre"
                        value={formData.hora_cierre || '22:00'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                    />
                </div>
            </div>

            {/* Explicación del cálculo de costos */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <FaCalculator className="text-blue-600" />
                    Cálculo de Costo de Domicilio
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                    El costo del domicilio se calcula de la siguiente manera:
                </p>
                <ul className="text-sm text-blue-700 space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                        <span className="font-bold">• Distancia ≤ {formData.distancia_base_km} km:</span>
                        <span className="ml-2">Solo costo base (${formData.costo_base_domicilio.toLocaleString()})</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold">• Distancia {'>'} {formData.distancia_base_km} km:</span>
                        <span className="ml-2">
                            Costo base + (distancia extra × ${formData.costo_por_km.toLocaleString()})
                        </span>
                    </li>
                </ul>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-sm font-medium text-gray-700 mb-1">Ejemplo para 1 km:</p>
                        <p className="text-lg font-bold text-blue-700">
                            ${calcularCostoEjemplo(1).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-sm font-medium text-gray-700 mb-1">Ejemplo para 3 km:</p>
                        <p className="text-lg font-bold text-blue-700">
                            ${calcularCostoEjemplo(3).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <p className="text-sm font-medium text-gray-700 mb-1">Ejemplo para 5 km:</p>
                        <p className="text-lg font-bold text-blue-700">
                            ${calcularCostoEjemplo(5).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}