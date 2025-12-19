import React, { useState } from 'react';
import { FaMapMarkerAlt, FaRoute, FaClock, FaDollarSign, FaSearch, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useDomicilioCalculator } from '@/src/modules/cliente/domicilios/hooks/useDomicilioCalculator';

// Props para el componente principal
interface CalculadorDomicilioProps {
    onDireccionCalculada: (resultado: {
        direccion: {
            direccion_formateada: string;
            coordenadas: { lat: number; lng: number };
        };
        ruta: {
            distancia_km: number;
            duracion_minutos: number;
            costo_domicilio: number;
            fuera_de_cobertura: boolean;
        };
        costo_domicilio: number;
    }) => void;
    onClose: () => void;
}

// Tipos para el componente de mapa
interface MapaVisualizacionProps {
    rutaCalculada: {
        distancia_km: number;
        duracion_minutos: number;
        costo_domicilio: number;
        fuera_de_cobertura: boolean;
    } | null;
    direccionActual: {
        direccion_formateada: string;
        coordenadas: { lat: number; lng: number };
        ciudad?: string;
        barrio?: string;
    } | null;
    loading: boolean;
}

// Componente de Mapa Visual Simulado
const MapaVisualizacion: React.FC<MapaVisualizacionProps> = ({ rutaCalculada, direccionActual, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Calculando ruta...</p>
                </div>
            </div>
        );
    }

    if (!rutaCalculada || !direccionActual) {
        return (
            <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <FaMapMarkerAlt className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Ingresa una dirección para ver la ruta</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border relative overflow-hidden">
            {/* Simulación visual del mapa */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-blue-200/30">
                {/* Punto del restaurante */}
                <div className="absolute top-4 left-4 flex items-center bg-orange-500 text-white px-3 py-2 rounded-full text-xs shadow-lg">
                    <FaMapMarkerAlt className="mr-1" />
                    Restaurante
                </div>

                {/* Punto de destino */}
                <div className="absolute bottom-4 right-4 flex items-center bg-blue-500 text-white px-3 py-2 rounded-full text-xs shadow-lg">
                    <FaMapMarkerAlt className="mr-1" />
                    Destino
                </div>

                {/* Línea de ruta simulada */}
                <svg className="absolute inset-0 w-full h-full">
                    <path
                        d="M 20 20 Q 150 100 280 220"
                        stroke="#f97316"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        fill="none"
                        className="animate-pulse"
                    />
                </svg>

                {/* Info de la ruta */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-3 border">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center text-green-600">
                            <FaRoute className="mr-1" />
                            {rutaCalculada.distancia_km} km
                        </div>
                        <div className="flex items-center text-blue-600">
                            <FaClock className="mr-1" />
                            {rutaCalculada.duracion_minutos} min
                        </div>
                    </div>
                </div>
            </div>

            {rutaCalculada.fuera_de_cobertura && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                        <FaExclamationTriangle className="inline mr-2" />
                        Fuera de zona de cobertura
                    </div>
                </div>
            )}
        </div>
    );
};

export default function CalculadorDomicilio({ onDireccionCalculada, onClose }: CalculadorDomicilioProps) {
    const [direccionInput, setDireccionInput] = useState('');

    const {
        loading,
        error,
        rutaActual,
        direccionActual,
        calcularDomicilio,
        limpiarCalculo,
        tieneRutaCalculada
    } = useDomicilioCalculator();

    const handleBuscarDireccion = async () => {
        if (!direccionInput.trim()) {
            return;
        }

        await calcularDomicilio(direccionInput);

        // El hook ya maneja el estado interno
        // No necesitamos hacer nada más aquí
    };

    const handleConfirmarDireccion = () => {
        if (rutaActual && direccionActual && !rutaActual.fuera_de_cobertura) {
            onDireccionCalculada({
                direccion: direccionActual,
                ruta: rutaActual,
                costo_domicilio: rutaActual.costo_domicilio
            });
        }
    };

    const handleLimpiar = () => {
        setDireccionInput('');
        limpiarCalculo();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBuscarDireccion();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-4 md:inset-20 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FaMapMarkerAlt />
                                Dirección de Entrega
                            </h2>
                            <p className="text-orange-100 mt-1">Calcula el costo de tu domicilio</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-orange-200 text-2xl transition-colors p-2 rounded-full hover:bg-white/10"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Buscador de dirección */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ¿A dónde quieres que llevemos tu pedido?
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={direccionInput}
                                    onChange={(e) => setDireccionInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ej: Carrera 15 #85-30, Bogotá"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                onClick={handleBuscarDireccion}
                                disabled={loading || !direccionInput.trim()}
                                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[120px] justify-center"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                    <>
                                        <FaSearch />
                                        Buscar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <span>{error}</span>
                                <button
                                    onClick={handleLimpiar}
                                    className="ml-3 text-red-600 hover:text-red-800 text-sm underline"
                                >
                                    Intentar otra dirección
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mapa */}
                    <div className="mb-6">
                        <MapaVisualizacion
                            rutaCalculada={rutaActual}
                            direccionActual={direccionActual}
                            loading={loading}
                        />
                    </div>

                    {/* Información de la ruta calculada */}
                    {rutaActual && direccionActual && (
                        <div className="bg-gray-50 rounded-xl p-6 border">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaRoute className="text-orange-500" />
                                Detalles del Domicilio
                            </h3>

                            {rutaActual.fuera_de_cobertura ? (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaExclamationTriangle />
                                        <span className="font-medium">Fuera de zona de cobertura</span>
                                    </div>
                                    <p className="text-sm">
                                        Esta dirección está a {rutaActual.distancia_km} km de distancia.
                                        Actualmente no realizamos entregas a esta zona.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <FaRoute />
                                                <span className="font-medium">Distancia</span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">{rutaActual.distancia_km} km</span>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                                <FaClock />
                                                <span className="font-medium">Tiempo estimado</span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">{rutaActual.duracion_minutos} min</span>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="flex items-center gap-2 text-orange-600 mb-1">
                                                <FaDollarSign />
                                                <span className="font-medium">Costo domicilio</span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                ${rutaActual.costo_domicilio.toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Dirección confirmada */}
                                    <div className="bg-white p-4 rounded-lg border mb-4">
                                        <p className="text-sm text-gray-600 mb-1">Dirección de entrega:</p>
                                        <p className="font-medium text-gray-900">{direccionActual.direccion_formateada}</p>
                                    </div>

                                    {/* Desglose del costo */}
                                    <div className="bg-white p-4 rounded-lg border">
                                        <p className="text-sm text-gray-600 mb-2">Desglose del costo:</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Costo base de domicilio:</span>
                                                <span>Incluido en cálculo</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Distancia ({rutaActual.distancia_km} km):</span>
                                                <span>Incluido en cálculo</span>
                                            </div>
                                            <div className="border-t pt-1 font-medium flex justify-between">
                                                <span>Total domicilio:</span>
                                                <span>${rutaActual.costo_domicilio.toLocaleString('es-CO')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>

                        {tieneRutaCalculada && (
                            <button
                                onClick={handleLimpiar}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                            >
                                Cambiar Dirección
                            </button>
                        )}

                        {rutaActual && !rutaActual.fuera_de_cobertura && (
                            <button
                                onClick={handleConfirmarDireccion}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <FaMapMarkerAlt />
                                Confirmar Dirección
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}