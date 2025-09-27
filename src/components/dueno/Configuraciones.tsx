"use client"

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    FaStore,
    FaMotorcycle,
    FaClock,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaSave,
    FaToggleOn,
    FaToggleOff,
    FaDollarSign,
    FaRoute,
    FaImage,
    FaSpinner,
    FaGlobe,
    FaBusinessTime,
    FaUpload,
    FaTrash,
    FaCamera,
    FaRulerHorizontal
} from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import Swal from 'sweetalert2';
import {
    obtenerConfiguracionRestaurante,
    guardarConfiguracionRestaurante,
    toggleDomicilio,
    toggleEstablecimiento,
    subirImagenLogo,
    type ConfiguracionRestaurante
} from '@/src/actions/dueno/configuracionRestauranteActions';
import Loading from '../ui/Loading';

// Tipos para Leaflet (reutilizados de MapaUbicacion.tsx - sin redeclarar Window.L)
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

// Componente de subida de imagen
const ImageUploader = ({ currentImageUrl, onImageChange }: {
    currentImageUrl: string;
    onImageChange: (url: string) => void;
}) => {
    const [imagePreview, setImagePreview] = useState(currentImageUrl);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setImagePreview(currentImageUrl);
    }, [currentImageUrl]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor selecciona solo archivos de imagen',
                icon: 'error'
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                title: 'Error',
                text: 'La imagen debe ser menor a 5MB',
                icon: 'error'
            });
            return;
        }

        setUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            const resultado = await subirImagenLogo(file);

            if (resultado.success && resultado.url) {
                onImageChange(resultado.url);
                Swal.fire({
                    title: 'Éxito',
                    text: 'Imagen subida correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(resultado.error || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al subir la imagen',
                icon: 'error'
            });
            setImagePreview(currentImageUrl);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        onImageChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaImage className="text-orange-500" />
                Logo del Restaurante
            </label>

            {imagePreview ? (
                <div className="relative inline-block">
                    <Image
                        src={imagePreview}
                        alt="Logo preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        priority
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <FaSpinner className="text-white text-xl animate-spin" />
                        </div>
                    )}
                    {!uploading && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                            <FaTrash className="text-xs" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                    <FaCamera className="mx-auto text-4xl text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">Sube el logo de tu restaurante</p>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                        {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                        {uploading ? 'Subiendo...' : 'Seleccionar imagen'}
                    </button>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <p className="text-xs text-gray-500">
                Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
            </p>
        </div>
    );
};

// Componente de selector de ubicación GPS con mapa
const LocationPicker = ({
    currentLat,
    currentLng,
    onLocationChange,
    address
}: {
    currentLat: number;
    currentLng: number;
    onLocationChange: (lat: number, lng: number) => void;
    address: string;
}) => {
    const [loading, setLoading] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState({
        lat: currentLat || 4.7110,
        lng: currentLng || -74.0721
    });
    const mapRef = useRef<ConfigLeafletMap | null>(null);
    const markerRef = useRef<ConfigLeafletLayer | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Cargar Leaflet dinámicamente (misma lógica que MapaUbicacion)
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
            }
        };

        cargarLeaflet();
    }, []);

    useEffect(() => {
        if (mapLoaded && mapContainerRef.current && !mapRef.current) {
            initializeMap();
        }
    }, [mapLoaded]);

    useEffect(() => {
        const newLocation = {
            lat: currentLat || 4.7110,
            lng: currentLng || -74.0721
        };
        setSelectedLocation(newLocation);

        // Actualizar el mapa si ya está inicializado
        if (mapRef.current && markerRef.current) {
            mapRef.current.setView([newLocation.lat, newLocation.lng], 15);
            markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
        }
    }, [currentLat, currentLng]);

    const initializeMap = () => {
        const L = (window as { L?: ConfigLeafletL }).L;
        if (!L || mapRef.current || !mapContainerRef.current) {
            return;
        }

        try {
            const map = L.map(mapContainerRef.current).setView([selectedLocation.lat, selectedLocation.lng], 15);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Crear marcador inicial con ícono personalizado
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
        }
    };

    // Limpiar recursos al desmontar
    useEffect(() => {
        return () => {
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

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            Swal.fire({
                title: 'Error',
                text: 'La geolocalización no está soportada en este navegador',
                icon: 'error'
            });
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

                Swal.fire({
                    title: 'Error de ubicación',
                    text: errorMessage,
                    icon: 'error'
                });
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    };

    const handleConfirmLocation = () => {
        onLocationChange(selectedLocation.lat, selectedLocation.lng);
        Swal.fire({
            title: 'Ubicación actualizada',
            text: 'La ubicación del restaurante ha sido actualizada correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    };

    const handleResetToBogota = () => {
        const bogotaLat = 4.7110;
        const bogotaLng = -74.0721;

        setSelectedLocation({ lat: bogotaLat, lng: bogotaLng });

        if (mapRef.current && markerRef.current) {
            mapRef.current.setView([bogotaLat, bogotaLng], 13);
            markerRef.current.setLatLng([bogotaLat, bogotaLng]);
        }
    };

    const hasLocationChanged = Math.abs(selectedLocation.lat - currentLat) > 0.0001 ||
        Math.abs(selectedLocation.lng - currentLng) > 0.0001;

    return (
        <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Ubicación GPS del Restaurante</h3>

                {/* Información actual */}
                <div className="bg-white rounded-lg p-4 mb-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Ubicación guardada:</p>
                            <p className="text-lg text-gray-900">
                                {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Ubicación seleccionada:</p>
                            <p className="text-lg text-orange-600 font-medium">
                                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </p>
                        </div>
                    </div>
                    {address && (
                        <div className="flex items-center mt-2">
                            <FaMapMarkerAlt className="text-orange-500 text-xl mr-2" />
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
                        {loading ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
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
                        <p className="text-yellow-800 text-sm font-medium">
                            ⚠️ Has seleccionado una nueva ubicación. Haz clic en Confirmar ubicación para guardar los cambios.
                        </p>
                    </div>
                )}

                {/* Instrucciones */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Cómo usar el mapa:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Haz clic en cualquier punto del mapa para seleccionar la ubicación</li>
                        <li>• Arrastra el marcador naranja para ajustar la posición exacta</li>
                        <li>• Usa Mi ubicación para obtener tu posición GPS actual</li>
                        <li>• Haz zoom con la rueda del mouse o los controles +/-</li>
                        <li>• Confirma la ubicación para aplicar los cambios</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default function Configuraciones() {
    const [, setConfiguracion] = useState<ConfiguracionRestaurante | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        nombre_restaurante: '',
        logo_url: '',
        telefono: '',
        email: '',
        direccion_completa: '',
        costo_base_domicilio: 3000,
        costo_por_km: 1500,
        distancia_base_km: 1,
        distancia_maxima_km: 10,
        tiempo_preparacion_min: 20,
        latitud: 4.7110,
        longitud: -74.0721,
        hora_apertura: '08:00',
        hora_cierre: '22:00',
        domicilio_activo: true,
        establecimiento_activo: true
    });

    useEffect(() => {
        cargarConfiguracion();
    }, []);

    const cargarConfiguracion = async () => {
        try {
            setLoading(true);
            const resultado = await obtenerConfiguracionRestaurante();

            if (resultado.success) {
                if (resultado.configuracion) {
                    setConfiguracion(resultado.configuracion);
                    setFormData({
                        nombre_restaurante: resultado.configuracion.nombre_restaurante,
                        logo_url: resultado.configuracion.logo_url || '',
                        telefono: resultado.configuracion.telefono || '',
                        email: resultado.configuracion.email || '',
                        direccion_completa: resultado.configuracion.direccion_completa,
                        costo_base_domicilio: resultado.configuracion.costo_base_domicilio,
                        costo_por_km: resultado.configuracion.costo_por_km,
                        distancia_base_km: resultado.configuracion.distancia_base_km,
                        distancia_maxima_km: resultado.configuracion.distancia_maxima_km,
                        tiempo_preparacion_min: resultado.configuracion.tiempo_preparacion_min,
                        latitud: resultado.configuracion.latitud,
                        longitud: resultado.configuracion.longitud,
                        hora_apertura: resultado.configuracion.hora_apertura || '',
                        hora_cierre: resultado.configuracion.hora_cierre || '',
                        domicilio_activo: resultado.configuracion.domicilio_activo,
                        establecimiento_activo: resultado.configuracion.establecimiento_activo
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error',
                    text: resultado.error || 'No se pudo cargar la configuración',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error inesperado al cargar la configuración',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleToggle = async (campo: string, valor: boolean) => {
        try {
            setSaving(true);
            let resultado;

            if (campo === 'domicilio_activo') {
                resultado = await toggleDomicilio(valor);
            } else {
                resultado = await toggleEstablecimiento(valor);
            }

            if (resultado.success) {
                setFormData(prev => ({ ...prev, [campo]: valor }));
                if (resultado.configuracion) {
                    setConfiguracion(resultado.configuracion);
                }
                Swal.fire({
                    title: 'Éxito',
                    text: 'Configuración actualizada correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: resultado.error || 'No se pudo actualizar la configuración',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error en toggle:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error inesperado al actualizar la configuración',
                icon: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSaving(true);

            if (!formData.nombre_restaurante.trim()) {
                Swal.fire({
                    title: 'Error',
                    text: 'El nombre del restaurante es requerido',
                    icon: 'error'
                });
                return;
            }

            if (!formData.direccion_completa.trim()) {
                Swal.fire({
                    title: 'Error',
                    text: 'La dirección es requerida',
                    icon: 'error'
                });
                return;
            }

            if (formData.latitud === 0 || formData.longitud === 0) {
                Swal.fire({
                    title: 'Error',
                    text: 'Por favor configura la ubicación GPS del restaurante',
                    icon: 'error'
                });
                return;
            }

            const resultado = await guardarConfiguracionRestaurante(formData);

            if (resultado.success && resultado.configuracion) {
                setConfiguracion(resultado.configuracion);
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Configuración guardada correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: resultado.error || 'No se pudo guardar la configuración',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error guardando configuración:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error inesperado al guardar la configuración',
                icon: 'error'
            });
        } finally {
            setSaving(false);
        }
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

    return (
        <div>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-4 rounded-xl">
                            <FiSettings className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Configuración del Restaurante</h1>
                            <p className="text-gray-600 mt-1">Administra la información básica y opciones de servicio de tu restaurante</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Estado de Servicios */}
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
                                    onClick={() => handleToggle('establecimiento_activo', !formData.establecimiento_activo)}
                                    disabled={saving}
                                    className="focus:outline-none transition-transform hover:scale-105"
                                >
                                    {formData.establecimiento_activo ? (
                                        <FaToggleOn className="text-4xl text-orange-500" />
                                    ) : (
                                        <FaToggleOff className="text-4xl text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <div className={`text-sm font-medium ${formData.establecimiento_activo ? 'text-green-600' : 'text-gray-500'}`}>
                                Estado: {formData.establecimiento_activo ? 'Activo' : 'Inactivo'}
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
                                    onClick={() => handleToggle('domicilio_activo', !formData.domicilio_activo)}
                                    disabled={saving}
                                    className="focus:outline-none transition-transform hover:scale-105"
                                >
                                    {formData.domicilio_activo ? (
                                        <FaToggleOn className="text-4xl text-orange-500" />
                                    ) : (
                                        <FaToggleOff className="text-4xl text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <div className={`text-sm font-medium ${formData.domicilio_activo ? 'text-green-600' : 'text-gray-500'}`}>
                                Estado: {formData.domicilio_activo ? 'Activo' : 'Inactivo'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información Básica */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Información Básica
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Nombre del Restaurante *
                            </label>
                            <input
                                type="text"
                                name="nombre_restaurante"
                                value={formData.nombre_restaurante}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                placeholder="Ej: Mi Restaurante"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <ImageUploader
                                currentImageUrl={formData.logo_url}
                                onImageChange={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaPhone className="text-orange-500" />
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                placeholder="+57 123 456 7890"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaEnvelope className="text-orange-500" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                placeholder="contacto@mirestaurante.com"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaMapMarkerAlt className="text-orange-500" />
                                Dirección Completa *
                            </label>
                            <input
                                type="text"
                                name="direccion_completa"
                                value={formData.direccion_completa}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                placeholder="Calle 123 #45-67, Ciudad"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Ubicación GPS */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Ubicación GPS
                    </h2>

                    <LocationPicker
                        currentLat={formData.latitud}
                        currentLng={formData.longitud}
                        onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitud: lat, longitud: lng }))}
                        address={formData.direccion_completa}
                    />
                </div>

                {/* Configuración de Domicilios */}
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
                            <p className="text-xs text-gray-500">
                                Distancia incluida en el costo base
                            </p>
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
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FaBusinessTime className="text-orange-500" />
                                Hora de Apertura
                            </label>
                            <input
                                type="time"
                                name="hora_apertura"
                                value={formData.hora_apertura}
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
                                value={formData.hora_cierre}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                        </div>
                    </div>

                    {/* Explicación del cálculo de costos */}
                    <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <FaDollarSign className="text-blue-600" />
                            Cálculo de Costo de Domicilio
                        </h3>
                        <p className="text-sm text-blue-800 mb-2">
                            El costo del domicilio se calcula de la siguiente manera:
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• <strong>Distancia ≤ {formData.distancia_base_km} km:</strong> Solo costo base (${formData.costo_base_domicilio.toLocaleString()})</li>
                            <li>• <strong>Distancia {'>'} {formData.distancia_base_km} km:</strong> Costo base + (distancia extra × ${formData.costo_por_km.toLocaleString()})</li>
                            <li>• <strong>Ejemplo:</strong> Para 3 km = ${formData.costo_base_domicilio.toLocaleString()} + ({Math.max(3 - formData.distancia_base_km, 0).toFixed(1)} km × ${formData.costo_por_km.toLocaleString()}) = ${(formData.costo_base_domicilio + Math.max(3 - formData.distancia_base_km, 0) * formData.costo_por_km).toLocaleString()}</li>
                        </ul>
                    </div>
                </div>

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