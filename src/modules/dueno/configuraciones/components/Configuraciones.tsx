// src/modules/dueno/configuraciones/components/Configuraciones.tsx
'use client';

import { FiSettings } from 'react-icons/fi';
import { FaSpinner, FaSave } from 'react-icons/fa';
import Loading from '@/src/shared/components/ui/Loading';
import { ErrorState, PageHeader } from '@/src/shared/components';
import { useConfiguracion } from '../hooks/useConfiguracion';
import { useConfiguracionMutaciones } from '../hooks/useConfiguracionMutaciones';
import type { ConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';
import EstadoServicios from './EstadoServicios';
import InformacionBasica from './InformacionBasica';
import ConfiguracionDomicilios from './ConfiguracionDomicilios';
import LocationPicker from './LocationPicker';

export default function Configuraciones() {
    const { configuracion, loading, error, setConfiguracion } = useConfiguracion();
    const { guardarConfiguracion, saving } = useConfiguracionMutaciones();

    const handleToggle = (tipo: 'domicilio' | 'establecimiento', activo: boolean) => {
        if (!configuracion) return;

        setConfiguracion({
            ...configuracion,
            [tipo === 'domicilio' ? 'domicilio_activo' : 'establecimiento_activo']: activo
        });
    };

    const handleConfigChange = (updatedConfig: ConfiguracionRestaurante) => {
        setConfiguracion(updatedConfig);
    };

    const handleLocationChange = (lat: number, lng: number) => {
        if (!configuracion) return;

        setConfiguracion({
            ...configuracion,
            latitud: lat,
            longitud: lng
        });
    };

    const handleSubmit = async () => {
        if (!configuracion) return;

        // Las validaciones ahora están en el action, pero mantenemos validación local para feedback inmediato
        if (!configuracion.nombre_restaurante.trim()) {
            return; // El action mostrará el error
        }

        if (!configuracion.direccion_completa.trim()) {
            return; // El action mostrará el error
        }

        await guardarConfiguracion(configuracion);
    };

    if (loading) {
        return (
            <Loading
                texto="Cargando configuración"
                tamaño="grande"
                color="orange-500"
            />
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                title="Error al cargar configuración"
                retryText="Reintentar"
                onRetry={() => window.location.reload()}
            />
        );
    }

    if (!configuracion) return null;

    return (
        <div>
            {/* Header reutilizable */}
            <PageHeader
                title="Configuración del Restaurante"
                description="Administra la información básica y opciones de servicio de tu restaurante"
                icon={<FiSettings />}
                variant="configuraciones"
                showBorder={true}
            />

            <div className="px-6 py-8 space-y-8">
                <EstadoServicios
                    domicilioActivo={configuracion.domicilio_activo}
                    establecimientoActivo={configuracion.establecimiento_activo}
                    onToggle={handleToggle}
                />

                <InformacionBasica
                    configuracion={configuracion}
                    onConfigChange={handleConfigChange}
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Ubicación GPS
                    </h2>
                    <LocationPicker
                        currentLat={configuracion.latitud}
                        currentLng={configuracion.longitud}
                        onLocationChange={handleLocationChange}
                        address={configuracion.direccion_completa}
                    />
                </div>

                <ConfiguracionDomicilios
                    configuracion={configuracion}
                    onConfigChange={handleConfigChange}
                />

                {/* Botón Guardar */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        {saving ? (
                            <>
                                <FaSpinner className="animate-spin text-lg" />
                                <span>Guardando configuración...</span>
                            </>
                        ) : (
                            <>
                                <FaSave className="text-lg" />
                                <span>Guardar Configuración</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}