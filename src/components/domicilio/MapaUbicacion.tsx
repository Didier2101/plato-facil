import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSpinner, FaTimes, FaRoute, FaClock, FaTruck, FaExclamationTriangle, FaCalculator, } from 'react-icons/fa';
import { calcularDomicilioPorCoordenadasAction, obtenerConfiguracionRestauranteAction } from '@/src/actions/calculoDomicilioAction';

// Interfaces - ACTUALIZADA para incluir campos del desglose
interface UbicacionConfirmada {
    coordenadas: {
        lat: number;
        lng: number;
    };
    distancia_km: number;
    costo_domicilio: number;
    duracion_estimada: number;
    // Campos adicionales para el desglose
    distancia_base_km: number;
    costo_base: number;
    distancia_exceso_km: number;
    costo_exceso: number;
}

interface Props {
    onUbicacionConfirmada: (ubicacion: UbicacionConfirmada) => void;
    onLimpiar: () => void;
    ubicacionActual?: UbicacionConfirmada | null;
}

// Tipos específicos para Leaflet
interface LeafletMap {
    setView: (latlng: [number, number], zoom: number) => LeafletMap;
    on: (event: string, callback: (e: LeafletEvent) => void) => void;
    removeLayer: (layer: LeafletLayer) => void;
    remove: () => void;
}

interface LeafletEvent {
    latlng: {
        lat: number;
        lng: number;
    };
}

interface LeafletLayer {
    addTo: (map: LeafletMap) => LeafletLayer;
    bindPopup: (content: string) => LeafletLayer;
    openPopup?: () => LeafletLayer;
}

interface LeafletIcon {
    iconSize: [number, number];
    iconAnchor: [number, number];
    className?: string;
    html?: string;
}

interface LeafletL {
    map: (id: string) => LeafletMap;
    tileLayer: (url: string, options: { maxZoom: number; attribution: string }) => LeafletLayer;
    marker: (latlng: [number, number], options?: { icon?: LeafletIcon }) => LeafletLayer;
    divIcon: (options: LeafletIcon) => LeafletIcon;
}

declare global {
    interface Window {
        L?: LeafletL;
    }
}

export default function MapaUbicacion({ onUbicacionConfirmada, onLimpiar, ubicacionActual }: Props) {
    const [coordenadasSeleccionadas, setCoordenadasSeleccionadas] = useState<{ lat: number; lng: number } | null>(null);
    const [mostrarMapa, setMostrarMapa] = useState(false);
    const [calculandoRuta, setCalculandoRuta] = useState(false);
    const [error, setError] = useState<string>('');
    const [leafletCargado, setLeafletCargado] = useState(false);
    const [configuracionRestaurante, setConfiguracionRestaurante] = useState<{
        nombre: string;
        latitud: number;
        longitud: number;
        domicilio_activo: boolean;
        distancia_base_km?: number; // NUEVO CAMPO OPCIONAL
        costo_base_domicilio?: number;
    } | null>(null);
    const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false);

    const mapRef = useRef<LeafletMap | null>(null);
    const markerRef = useRef<LeafletLayer | null>(null);

    // Cargar configuración del restaurante cuando se necesite
    useEffect(() => {
        const cargarConfiguracion = async () => {
            if (configuracionRestaurante || cargandoConfiguracion) return;

            setCargandoConfiguracion(true);
            try {
                const result = await obtenerConfiguracionRestauranteAction();

                if (result.success && result.configuracion) {
                    setConfiguracionRestaurante({
                        nombre: result.configuracion.nombre_restaurante || 'Mi Restaurante',
                        latitud: result.configuracion.latitud,
                        longitud: result.configuracion.longitud,
                        domicilio_activo: result.configuracion.domicilio_activo,
                        distancia_base_km: result.configuracion.distancia_base_km || 2, // NUEVO
                        costo_base_domicilio: result.configuracion.costo_base_domicilio || 4000 // NUEVO
                    });
                } else {
                    // Fallback a valores por defecto si hay error
                    setError(result.error || 'No se pudo cargar la configuración del restaurante');
                    setConfiguracionRestaurante({
                        nombre: 'Mi Restaurante',
                        latitud: 4.7110,
                        longitud: -74.0721,
                        domicilio_activo: true,
                        distancia_base_km: 2,
                        costo_base_domicilio: 4000
                    });
                }
            } catch (error) {
                console.error('Error cargando configuración del restaurante:', error);
                setError('Error cargando configuración del restaurante');
                // Fallback a valores por defecto
                setConfiguracionRestaurante({
                    nombre: 'Mi Restaurante',
                    latitud: 4.7110,
                    longitud: -74.0721,
                    domicilio_activo: true,
                    distancia_base_km: 2,
                    costo_base_domicilio: 4000
                });
            } finally {
                setCargandoConfiguracion(false);
            }
        };

        cargarConfiguracion();
    }, [configuracionRestaurante, cargandoConfiguracion]);

    // Cargar Leaflet dinámicamente
    useEffect(() => {
        const cargarLeaflet = async () => {
            if (window.L) {
                setLeafletCargado(true);
                return;
            }

            try {
                // Cargar CSS de Leaflet
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);

                // Cargar JS de Leaflet
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => setLeafletCargado(true);
                document.head.appendChild(script);
            } catch (error) {
                console.error('Error cargando Leaflet:', error);
                setError('Error cargando el mapa');
            }
        };

        cargarLeaflet();
    }, []);

    // Inicializar mapa cuando se muestra
    useEffect(() => {
        if (!mostrarMapa || !leafletCargado || !configuracionRestaurante || mapRef.current) return;

        const mapContainer = document.getElementById('leaflet-map');
        if (!mapContainer) return;

        try {
            // Crear mapa centrado en las coordenadas del restaurante
            if (!window.L) return;

            const { latitud, longitud, nombre } = configuracionRestaurante;
            const map = window.L.map('leaflet-map').setView([latitud, longitud], 11);

            // Agregar tiles de OpenStreetMap
            window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Marcador del restaurante con datos reales
            const restaurantIcon = window.L.divIcon({
                html: '<div style="background: #f97316; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🍽️</div>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            // Usar coordenadas reales del restaurante
            window.L.marker([latitud, longitud], { icon: restaurantIcon })
                .addTo(map)
                .bindPopup(`<strong>${nombre}</strong><br>Punto de partida<br><small>Lat: ${latitud.toFixed(4)}, Lng: ${longitud.toFixed(4)}</small>`)
                .openPopup?.();

            // Manejar clicks en el mapa
            map.on('click', (e: LeafletEvent) => {
                if (!window.L) return;

                const { lat, lng } = e.latlng;
                setCoordenadasSeleccionadas({ lat, lng });

                // Remover marcador anterior
                if (markerRef.current) {
                    map.removeLayer(markerRef.current);
                }

                // Agregar nuevo marcador
                const userIcon = window.L.divIcon({
                    html: '<div style="background: #ef4444; color: white; border-radius: 50% 50% 50% 0; width: 25px; height: 25px; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍</div>',
                    className: 'custom-div-icon',
                    iconSize: [25, 25],
                    iconAnchor: [12, 24]
                });

                markerRef.current = window.L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup(`<strong>Ubicación seleccionada</strong><br>Para calcular costo de envío<br><small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>`);
            });

            mapRef.current = map;

        } catch (error) {
            console.error('Error inicializando mapa:', error);
            setError('Error inicializando el mapa');
        }
    }, [mostrarMapa, leafletCargado, configuracionRestaurante]);

    // Limpiar mapa al cerrar
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Confirmar ubicación seleccionada en el mapa
    const confirmarUbicacion = async () => {
        if (!coordenadasSeleccionadas) {
            setError('Debes seleccionar tu ubicación en el mapa');
            return;
        }

        setCalculandoRuta(true);
        setError('');

        try {
            const resultado = await calcularDomicilioPorCoordenadasAction(coordenadasSeleccionadas);

            if (resultado.success && resultado.ruta) {
                if (resultado.ruta.fuera_de_cobertura) {
                    setError(`Esta ubicación está fuera de nuestra zona de cobertura (distancia: ${resultado.ruta.distancia_km} km)`);
                    return;
                }

                const ubicacionConfirmada: UbicacionConfirmada = {
                    coordenadas: coordenadasSeleccionadas,
                    distancia_km: resultado.ruta.distancia_km,
                    costo_domicilio: resultado.ruta.costo_domicilio,
                    duracion_estimada: resultado.ruta.duracion_minutos,
                    // NUEVOS CAMPOS DEL DESGLOSE
                    distancia_base_km: resultado.ruta.distancia_base_km,
                    costo_base: resultado.ruta.costo_base,
                    distancia_exceso_km: resultado.ruta.distancia_exceso_km,
                    costo_exceso: resultado.ruta.costo_exceso
                };

                onUbicacionConfirmada(ubicacionConfirmada);
                setMostrarMapa(false);

            } else {
                setError(resultado.error || 'No se pudo calcular el costo de domicilio para esta ubicación');
            }

        } catch (error) {
            console.error('Error calculando ruta:', error);
            setError('Error interno calculando el costo de domicilio');
        } finally {
            setCalculandoRuta(false);
        }
    };

    // Cancelar selección
    const cancelarSeleccion = () => {
        setMostrarMapa(false);
        setCoordenadasSeleccionadas(null);
        setError('');
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };

    // Cambiar ubicación confirmada
    const cambiarUbicacion = () => {
        onLimpiar();
        setCoordenadasSeleccionadas(null);
        setMostrarMapa(false);
        setError('');
    };

    // Si ya hay una ubicación confirmada, mostrar resumen
    if (ubicacionActual) {
        return (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 text-lg mb-3 flex items-center gap-2">
                    <FaCalculator className="text-blue-600" />
                    Costo de Domicilio Calculado
                </h4>

                <div className="bg-white rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <FaRoute className="mx-auto text-blue-600 mb-1" />
                            <p className="text-xs text-gray-600">Distancia</p>
                            <p className="font-bold text-blue-900 text-sm">{ubicacionActual.distancia_km} km</p>
                        </div>
                        <div>
                            <FaClock className="mx-auto text-green-600 mb-1" />
                            <p className="text-xs text-gray-600">Tiempo est.</p>
                            <p className="font-bold text-green-900 text-sm">{ubicacionActual.duracion_estimada} min</p>
                        </div>
                        <div>
                            <span className="text-orange-600 mb-1 block text-lg">$</span>
                            <p className="text-xs text-gray-600">Costo envío</p>
                            <p className="font-bold text-orange-900 text-sm">${ubicacionActual.costo_domicilio.toLocaleString('es-CO')}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">
                        Costo calculado basado en tu ubicación seleccionada
                    </p>
                    <button
                        onClick={cambiarUbicacion}
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                        Recalcular en otra ubicación
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 text-lg mb-3 flex items-center gap-2">
                <FaCalculator className="text-blue-600" />
                Calcular Costo de Domicilio
            </h4>

            <div className="mb-4 space-y-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-gray-700 mb-2">
                        <strong>Paso 1:</strong> Selecciona tu ubicación en el mapa para calcular el costo exacto del envío.
                    </p>
                    <p className="text-xs text-gray-600">
                        Esto es solo para el cálculo del precio. La dirección exacta la escribirás después.
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (!leafletCargado) {
                            setError('El mapa aún se está cargando, espera un momento');
                            return;
                        }
                        if (!configuracionRestaurante) {
                            setError('Cargando configuración del restaurante, espera un momento');
                            return;
                        }
                        if (!configuracionRestaurante.domicilio_activo) {
                            setError('El servicio de domicilio está desactivado actualmente');
                            return;
                        }
                        setMostrarMapa(true);
                        setError('');
                    }}
                    disabled={!leafletCargado || !configuracionRestaurante || cargandoConfiguracion}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {!leafletCargado ? (
                        <>
                            <FaSpinner className="animate-spin" size={14} />
                            Cargando mapa...
                        </>
                    ) : cargandoConfiguracion ? (
                        <>
                            <FaSpinner className="animate-spin" size={14} />
                            Cargando configuración...
                        </>
                    ) : !configuracionRestaurante?.domicilio_activo ? (
                        <>
                            <FaTruck size={14} />
                            Domicilio no disponible
                        </>
                    ) : (
                        <>
                            <FaMapMarkerAlt size={14} />
                            Abrir mapa y calcular costo
                        </>
                    )}
                </button>
            </div>

            {/* Modal del mapa */}
            {mostrarMapa && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Selecciona tu ubicación para calcular el costo
                            </h3>
                            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                Solo para cálculo
                            </div>
                        </div>

                        {/* Contenedor del mapa */}
                        <div className="flex-1 relative">
                            {!leafletCargado ? (
                                <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                                    <div className="text-center">
                                        <FaSpinner className="animate-spin mx-auto text-blue-600 mb-2" size={24} />
                                        <p className="text-gray-600">Cargando mapa...</p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    id="leaflet-map"
                                    className="w-full h-96 rounded-lg border-2 border-blue-200"
                                ></div>
                            )}

                            {/* Instrucciones sobre el mapa */}
                            <div className="absolute top-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg max-w-xs">
                                <p className="text-sm text-gray-700 font-medium mb-1">
                                    🍽️ = {configuracionRestaurante?.nombre || 'Mi Restaurante'} (punto de partida)
                                </p>
                                <p className="text-xs text-gray-600 mb-2">
                                    Haz clic donde quieres que llegue el pedido
                                </p>
                                {coordenadasSeleccionadas && (
                                    <div className="bg-green-50 text-green-700 text-xs p-2 rounded-md border border-green-200">
                                        ✓ Ubicación seleccionada para cálculo
                                    </div>
                                )}
                            </div>

                            {/* Info adicional */}
                            <div className="absolute bottom-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg max-w-xs">
                                <p className="text-xs text-gray-600">
                                    <strong>Nota:</strong> Esta ubicación es solo para calcular el costo.
                                    Después escribirás la dirección exacta.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4 flex items-start gap-2">
                                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={cancelarSeleccion}
                                disabled={calculandoRuta}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <FaTimes size={14} />
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarUbicacion}
                                disabled={calculandoRuta || !coordenadasSeleccionadas}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {calculandoRuta ? (
                                    <>
                                        <FaSpinner className="animate-spin" size={14} />
                                        Calculando precio...
                                    </>
                                ) : (
                                    <>
                                        <FaCalculator size={14} />
                                        Calcular costo de envío
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && !mostrarMapa && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3 flex items-start gap-2">
                    <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="text-center text-blue-700 text-sm mt-3">
                <p className="font-medium mb-1">¿Por qué necesito seleccionar mi ubicación?</p>
                <p className="text-xs">
                    Para calcular el costo exacto del domicilio basado en la distancia real desde nuestro restaurante
                </p>
            </div>
        </div>
    );
}