// src/modules/dueno/configuraciones/components/LocationPicker.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FaMapMarkerAlt,
    FaSpinner,
    FaSave,
    FaCrosshairs,
    FaInfoCircle
} from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import { toast } from '@/src/shared/services/toast.service';

interface ConfigLeafletMap {
    setView: (latlng: [number, number], zoom: number) => ConfigLeafletMap;
    on: (event: string, callback: (e: ConfigLeafletEvent) => void) => void;
    removeLayer: (layer: ConfigLeafletLayer) => void;
    remove: () => void;
}

interface ConfigLeafletEvent {
    latlng: {
        lat: number;
        lng: number;
    };
}

interface ConfigLeafletLayer {
    addTo: (map: ConfigLeafletMap) => ConfigLeafletLayer;
    bindPopup: (content: string) => ConfigLeafletLayer;
    openPopup?: () => ConfigLeafletLayer;
    on: (event: string, callback: (e: ConfigLeafletMarkerEvent) => void) => void;
    setLatLng: (latlng: [number, number]) => ConfigLeafletLayer;
}

interface ConfigLeafletMarkerEvent {
    target: {
        getLatLng: () => { lat: number; lng: number };
    };
}

interface ConfigLeafletIcon {
    iconSize: [number, number];
    iconAnchor: [number, number];
    className?: string;
    html?: string;
}

interface ConfigLeafletL {
    map: (id: string | HTMLElement) => ConfigLeafletMap;
    tileLayer: (url: string, options: { maxZoom: number; attribution: string }) => ConfigLeafletLayer;
    marker: (latlng: [number, number], options?: { icon?: ConfigLeafletIcon; draggable?: boolean }) => ConfigLeafletLayer;
    divIcon: (options: ConfigLeafletIcon) => ConfigLeafletIcon;
}

interface LocationPickerProps {
    currentLat: number;
    currentLng: number;
    onLocationChange: (lat: number, lng: number) => void;
    address?: string;
}

export default function LocationPicker({
    currentLat,
    currentLng,
    onLocationChange,
    address = ''
}: LocationPickerProps) {
    const [selectedLocation, setSelectedLocation] = useState({
        lat: currentLat || 4.7110,
        lng: currentLng || -74.0721
    });
    const [loading, setLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef<ConfigLeafletMap | null>(null);
    const markerRef = useRef<ConfigLeafletLayer | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Cargar Leaflet dinámicamente
    useEffect(() => {
        const cargarLeaflet = async () => {
            if ((window as { L?: ConfigLeafletL }).L) {
                setMapLoaded(true);
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
                script.onload = () => setMapLoaded(true);
                document.head.appendChild(script);
            } catch (error) {
                console.error('Error cargando Leaflet:', error);
                toast.error('Error', { description: 'No se pudo cargar el mapa' });
            }
        };

        cargarLeaflet();

        return () => {
            // Limpiar recursos al desmontar
            if (mapRef.current) {
                try {
                    mapRef.current.remove();
                } catch (error) {
                    console.error('Error limpiando mapa:', error);
                }
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    const initializeMap = useCallback(() => {
        const L = (window as { L?: ConfigLeafletL }).L;
        if (!L || mapRef.current || !mapContainerRef.current) {
            return;
        }

        try {
            const map = L.map(mapContainerRef.current).setView([selectedLocation.lat, selectedLocation.lng], 15);

            // Capa de tiles de OpenStreetMap
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Crear marcador personalizado
            const restaurantIcon = L.divIcon({
                html: '<div style="background: #f97316; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">📍</div>',
                className: 'custom-div-icon',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
                icon: restaurantIcon,
                draggable: true
            }).addTo(map);

            // Evento de click en el mapa
            map.on('click', (e: ConfigLeafletEvent) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                setSelectedLocation({ lat, lng });
            });

            // Evento de drag del marcador
            marker.on('dragend', (e: ConfigLeafletMarkerEvent) => {
                const { lat, lng } = e.target.getLatLng();
                setSelectedLocation({ lat, lng });
            });

            mapRef.current = map;
            markerRef.current = marker;
        } catch (error) {
            console.error('Error inicializando mapa:', error);
            toast.error('Error', { description: 'No se pudo inicializar el mapa' });
        }
    }, [selectedLocation.lat, selectedLocation.lng]);

    // Inicializar mapa cuando Leaflet esté cargado
    useEffect(() => {
        if (mapLoaded && mapContainerRef.current && !mapRef.current) {
            initializeMap();
        }
    }, [mapLoaded, initializeMap]);


    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Error', { description: 'La geolocalización no está soportada en este navegador' });
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setSelectedLocation({ lat, lng });

                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 15);
                    markerRef.current.setLatLng([lat, lng]);
                }

                setLoading(false);

                toast.success('Ubicación obtenida', {
                    description: `Tu ubicación actual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                    duration: 3000
                });
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                let errorMessage = 'No se pudo obtener la ubicación actual';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permiso denegado. Por favor permite el acceso a la ubicación';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado';
                        break;
                }

                toast.error('Error de ubicación', { description: errorMessage });
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    };

    const handleResetToBogota = () => {
        const bogotaLat = 4.7110;
        const bogotaLng = -74.0721;

        setSelectedLocation({ lat: bogotaLat, lng: bogotaLng });

        if (mapRef.current && markerRef.current) {
            mapRef.current.setView([bogotaLat, bogotaLng], 13);
            markerRef.current.setLatLng([bogotaLat, bogotaLng]);
        }

        toast.info('Ubicación restablecida', {
            description: 'Ubicación configurada a Bogotá centro',
            duration: 2000
        });
    };

    const handleConfirmLocation = () => {
        onLocationChange(selectedLocation.lat, selectedLocation.lng);

        toast.success('Ubicación actualizada', {
            description: 'La ubicación del restaurante ha sido actualizada correctamente',
            duration: 2500
        });
    };


    const hasLocationChanged = Math.abs(selectedLocation.lat - currentLat) > 0.0001 ||
        Math.abs(selectedLocation.lng - currentLng) > 0.0001;

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-500" />
                    Ubicación GPS del Restaurante
                </h3>

                {/* Información actual */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Ubicación guardada:</p>
                            <p className="text-lg text-gray-900 font-mono">
                                {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Ubicación seleccionada:</p>
                            <p className="text-lg text-orange-600 font-medium font-mono">
                                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>

                    {address && (
                        <div className="flex items-start mt-3 pt-3 border-t border-gray-200">
                            <FaMapMarkerAlt className="text-orange-500 text-sm mt-1 mr-2 flex-shrink-0" />
                            <p className="text-sm text-gray-600">{address}</p>
                        </div>
                    )}
                </div>

                {/* Controles principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : <FaCrosshairs />}
                        Mi ubicación
                    </button>

                    <button
                        type="button"
                        onClick={handleResetToBogota}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
                    >
                        <FiSettings />
                        Bogotá centro
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirmLocation}
                        disabled={!hasLocationChanged}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
                    >
                        <FaSave />
                        Confirmar ubicación
                    </button>
                </div>

                {/* Mapa */}
                <div className="relative mb-4">
                    <div
                        ref={mapContainerRef}
                        className="w-full h-96 rounded-lg border border-gray-300 bg-gray-100"
                        style={{ minHeight: '400px' }}
                    />

                    {!mapLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                            <div className="text-center">
                                <FaSpinner className="text-4xl text-orange-500 animate-spin mx-auto mb-2" />
                                <p className="text-gray-600">Cargando mapa...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Advertencia si hay cambios pendientes */}
                {hasLocationChanged && (
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                        <div className="flex items-start gap-3">
                            <FaInfoCircle className="text-yellow-600 text-lg mt-0.5" />
                            <div>
                                <p className="text-yellow-800 text-sm font-medium">
                                    Has seleccionado una nueva ubicación.
                                </p>
                                <p className="text-yellow-700 text-sm mt-1">
                                    Haz clic en Confirmar ubicación para guardar los cambios.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instrucciones */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-blue-600 text-lg mt-0.5" />
                        <div>
                            <h4 className="font-medium text-blue-900 mb-2">Cómo usar el mapa:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• <strong>Haz clic</strong> en cualquier punto del mapa para seleccionar la ubicación</li>
                                <li>• <strong>Arrastra</strong> el marcador naranja para ajustar la posición exacta</li>
                                <li>• Usa <strong>Mi ubicación</strong> para obtener tu posición GPS actual</li>
                                <li>• Usa <strong>Bogotá centro</strong> para restaurar la ubicación por defecto</li>
                                <li>• <strong>Confirma</strong> la ubicación para aplicar los cambios</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}