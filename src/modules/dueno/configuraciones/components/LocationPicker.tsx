"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    MapPin,
    Navigation,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Info,
    Compass,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/src/shared/services/toast.service';

interface ConfigLeafletMap {
    setView: (latlng: [number, number], zoom: number) => ConfigLeafletMap;
    on: (event: string, callback: (e: ConfigLeafletEvent) => void) => void;
    removeLayer: (layer: ConfigLeafletLayer) => void;
    remove: () => void;
}

interface ConfigLeafletEvent {
    latlng: { lat: number; lng: number; };
}

interface ConfigLeafletLayer {
    addTo: (map: ConfigLeafletMap) => ConfigLeafletLayer;
    bindPopup: (content: string) => ConfigLeafletLayer;
    openPopup?: () => ConfigLeafletLayer;
    on: (event: string, callback: (e: ConfigLeafletMarkerEvent) => void) => void;
    setLatLng: (latlng: [number, number]) => ConfigLeafletLayer;
}

interface ConfigLeafletMarkerEvent {
    target: { getLatLng: () => { lat: number; lng: number }; };
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

    useEffect(() => {
        const cargarLeaflet = async () => {
            if ((window as { L?: ConfigLeafletL }).L) {
                setMapLoaded(true);
                return;
            }

            try {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => setMapLoaded(true);
                document.head.appendChild(script);
            } catch (error) {
                console.error('Error cargando Leaflet:', error);
                toast.error('Mapa No Disponible', { description: 'No se pudo cargar el servicio de mapas.' });
            }
        };

        cargarLeaflet();

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

    const initializeMap = useCallback(() => {
        const L = (window as { L?: ConfigLeafletL }).L;
        if (!L || mapRef.current || !mapContainerRef.current) return;

        try {
            const map = L.map(mapContainerRef.current as HTMLElement, {
                zoomControl: false
            }).setView([selectedLocation.lat, selectedLocation.lng], 15);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            const restaurantIcon = L.divIcon({
                html: `
                    <div class="relative flex items-center justify-center">
                        <div class="absolute w-12 h-12 bg-orange-500/20 rounded-full animate-ping"></div>
                        <div class="relative h-10 w-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl border-2 border-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>
                    </div>
                `,
                className: 'custom-div-icon',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
                icon: restaurantIcon,
                draggable: true
            }).addTo(map);

            map.on('click', (e: ConfigLeafletEvent) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                setSelectedLocation({ lat, lng });
            });

            marker.on('dragend', (e: ConfigLeafletMarkerEvent) => {
                const { lat, lng } = e.target.getLatLng();
                setSelectedLocation({ lat, lng });
            });

            mapRef.current = map;
            markerRef.current = marker;
        } catch (error) {
            console.error('Error inicializando mapa:', error);
            toast.error('Error de Inicialización', { description: 'Hubo un problema al renderizar el mapa.' });
        }
    }, [selectedLocation.lat, selectedLocation.lng]);

    useEffect(() => {
        if (mapLoaded && mapContainerRef.current && !mapRef.current) {
            initializeMap();
        }
    }, [mapLoaded, initializeMap]);

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('No Soportado', { description: 'Tu navegador no permite geolocalización.' });
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setSelectedLocation({ lat, lng });

                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([lat, lng], 17);
                    markerRef.current.setLatLng([lat, lng]);
                }
                setLoading(false);
                toast.success('Ubicación Detectada', { description: 'Hemos encontrado tu posición actual.' });
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);
                toast.error('Error GPS', { description: 'No pudimos acceder a tu ubicación exacta.' });
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    };

    const handleResetToBogota = () => {
        const bogotaLat = 4.7110;
        const bogotaLng = -74.0721;
        setSelectedLocation({ lat: bogotaLat, lng: bogotaLng });

        if (mapRef.current && markerRef.current) {
            mapRef.current.setView([bogotaLat, bogotaLng], 14);
            markerRef.current.setLatLng([bogotaLat, bogotaLng]);
        }
        toast.info('Restablecido', { description: 'Mapa centrado en Bogotá.' });
    };

    const handleConfirmLocation = () => {
        onLocationChange(selectedLocation.lat, selectedLocation.lng);
        toast.success('Configuración Guardada', { description: 'Las coordenadas GPS han sido actualizadas.' });
    };

    const hasLocationChanged = Math.abs(selectedLocation.lat - currentLat) > 0.0001 ||
        Math.abs(selectedLocation.lng - currentLng) > 0.0001;

    return (
        <div className="space-y-8">
            {/* Coordinates Display Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-50 shadow-xl shadow-slate-100/50 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordenadas Actuales</h4>
                            <p className="text-xl font-black text-slate-900 tracking-tighter">Lat: {selectedLocation.lat.toFixed(6)}</p>
                        </div>
                    </div>
                    <div className="h-px bg-slate-50 w-full" />
                    <p className="text-xl font-black text-slate-900 tracking-tighter pl-13">Long: {selectedLocation.lng.toFixed(6)}</p>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4 shadow-2xl shadow-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dirección de Referencia</h4>
                            <p className="text-sm font-bold text-white leading-tight mt-1 line-clamp-2 italic">
                                &quot;{address || 'Sin dirección asignada'}&quot;
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full w-fit">
                        <Sparkles className="h-3 w-3 text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Ubicación Maestra</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative group">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[500px] rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100 z-10"
                />

                <AnimatePresence>
                    {!mapLoaded && (
                        <motion.div
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50 rounded-[3rem]"
                        >
                            <div className="text-center space-y-4">
                                <div className="h-16 w-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                                    <Compass className="h-8 w-8 text-orange-500" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Iniciando Cartografía...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Glassmorphism Controls Over Map */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGetCurrentLocation}
                        className="h-14 w-14 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-white/50 hover:bg-orange-500 hover:text-white transition-all"
                    >
                        {loading ? <RotateCcw className="h-6 w-6 animate-spin" /> : <Navigation className="h-6 w-6" />}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleResetToBogota}
                        className="h-14 w-14 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center text-slate-900 shadow-xl border border-white/50 hover:text-orange-500 transition-all"
                    >
                        <RotateCcw className="h-6 w-6" />
                    </motion.button>
                </div>

                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl max-w-[200px]">
                        <div className="flex items-center gap-3 mb-2">
                            <Info className="h-4 w-4 text-orange-500" />
                            <h5 className="text-[9px] font-black text-white uppercase tracking-widest">Guía de Uso</h5>
                        </div>
                        <p className="text-[8px] font-bold text-white/50 leading-relaxed uppercase tracking-tighter">
                            Arrastra el pin naranja o toca cualquier punto del mapa para ajustar la precisión.
                        </p>
                    </div>
                </div>

                {/* Change Notification Overlay */}
                <AnimatePresence>
                    {hasLocationChanged && (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto"
                        >
                            <div className="bg-orange-500 text-white rounded-[2rem] p-6 shadow-2xl shadow-orange-200 flex flex-col md:flex-row items-center gap-6 border-4 border-white">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h4 className="text-sm font-black uppercase tracking-tighter">¡Cambios Detectados!</h4>
                                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-0.5">La nueva posición no ha sido guardada.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleConfirmLocation}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-orange-500 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Confirmar Ahora
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
