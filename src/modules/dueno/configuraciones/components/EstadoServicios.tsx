// src/modules/dueno/configuraciones/components/EstadoServicios.tsx
'use client';

import { FaStore, FaMotorcycle, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useConfiguracionMutaciones } from '../hooks/useConfiguracionMutaciones';

interface EstadoServiciosProps {
    domicilioActivo: boolean;
    establecimientoActivo: boolean;
    onToggle?: (tipo: 'domicilio' | 'establecimiento', activo: boolean) => void;
}

export default function EstadoServicios({
    domicilioActivo,
    establecimientoActivo,
    onToggle
}: EstadoServiciosProps) {
    const { toggleServicio, saving } = useConfiguracionMutaciones();

    const handleToggle = async (tipo: 'domicilio' | 'establecimiento', activo: boolean) => {
        const resultado = await toggleServicio(tipo, activo);
        if (resultado.success && onToggle) {
            onToggle(tipo, activo);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Estado de Servicios
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Venta en Establecimiento */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500 p-3 rounded-lg">
                                <FaStore className="text-xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Venta en Establecimiento</h3>
                                <p className="text-sm text-gray-600">Permitir pedidos para recoger en local</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleToggle('establecimiento', !establecimientoActivo)}
                            disabled={saving}
                            className="focus:outline-none transition-transform hover:scale-105"
                            aria-label={establecimientoActivo ? 'Desactivar establecimiento' : 'Activar establecimiento'}
                        >
                            {establecimientoActivo ? (
                                <FaToggleOn className="text-4xl text-orange-500" />
                            ) : (
                                <FaToggleOff className="text-4xl text-gray-400" />
                            )}
                        </button>
                    </div>
                    <div className={`text-sm font-medium ${establecimientoActivo ? 'text-green-600' : 'text-gray-500'}`}>
                        Estado: {establecimientoActivo ? 'Activo' : 'Inactivo'}
                    </div>
                </div>

                {/* Servicio a Domicilio */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500 p-3 rounded-lg">
                                <FaMotorcycle className="text-xl text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Servicio a Domicilio</h3>
                                <p className="text-sm text-gray-600">Permitir entregas a domicilio</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleToggle('domicilio', !domicilioActivo)}
                            disabled={saving}
                            className="focus:outline-none transition-transform hover:scale-105"
                            aria-label={domicilioActivo ? 'Desactivar domicilio' : 'Activar domicilio'}
                        >
                            {domicilioActivo ? (
                                <FaToggleOn className="text-4xl text-orange-500" />
                            ) : (
                                <FaToggleOff className="text-4xl text-gray-400" />
                            )}
                        </button>
                    </div>
                    <div className={`text-sm font-medium ${domicilioActivo ? 'text-green-600' : 'text-gray-500'}`}>
                        Estado: {domicilioActivo ? 'Activo' : 'Inactivo'}
                    </div>
                </div>
            </div>
        </div>
    );
}