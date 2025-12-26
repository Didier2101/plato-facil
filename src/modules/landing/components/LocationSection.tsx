"use client";
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import type { ConfiguracionRestaurante } from '../../dueno/configuraciones/actions/configuracionRestauranteActions';
import { motion } from 'framer-motion';

interface LocationSectionProps {
    config?: ConfiguracionRestaurante;
}

export default function LocationSection({ config }: LocationSectionProps) {
    // Si no hay coordenadas, usamos unas por defecto para el placeholder del mapa
    const lat = config?.latitud || 4.570868;
    const lng = config?.longitud || -74.297333;

    return (
        <section id="ubicacion" className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center space-x-2 bg-orange-100/50 px-4 py-2 rounded-2xl mb-4"
                    >
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Encuéntranos</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
                        Visítanos en nuestro local
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Estamos ubicados en el corazón de la ciudad, listos para brindarte la mejor atención.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8 items-stretch">
                    {/* Info Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start space-x-6">
                            <div className="bg-orange-500 p-4 rounded-2xl shadow-lg shadow-orange-100">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">Nuestra Dirección</h3>
                                <p className="text-gray-600 font-bold leading-relaxed italic">
                                    {config?.direccion_completa || "Cargando ubicación..."}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start space-x-6">
                            <div className="bg-gray-900 p-4 rounded-2xl">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">Horario</h3>
                                <div className="space-y-1">
                                    <p className="text-gray-600 font-bold">Lunes - Domingo</p>
                                    <p className="text-orange-600 font-black">
                                        {config?.hora_apertura || "08:00 AM"} - {config?.hora_cierre || "10:00 PM"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-500 p-8 rounded-[2.5rem] shadow-2xl shadow-orange-200 text-white flex items-start space-x-6">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                                <Phone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black mb-1">Dudas o Pedidos</h3>
                                <p className="text-4xl font-black tracking-tighter">
                                    {config?.telefono?.slice(-4) || "..."}
                                </p>
                                <p className="text-orange-100 text-sm font-bold opacity-80">Llámanos ahora</p>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder/Preview */}
                    <div className="lg:col-span-3 bg-white p-4 rounded-[3rem] shadow-2xl shadow-gray-200/50 border-8 border-white">
                        <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-[2.5rem] relative overflow-hidden group">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_GOOGLE_MAPS_API_KEY&q=${lat},${lng}&zoom=15`}
                                allowFullScreen
                                className="grayscale contrast-125 opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            ></iframe>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-gray-900/90 backdrop-blur-md px-8 py-6 rounded-[2rem] border border-gray-700 shadow-2xl text-center transform group-hover:scale-95 transition-transform duration-500">
                                    <Navigation className="h-8 w-8 text-orange-500 mx-auto mb-3 animate-pulse" />
                                    <h4 className="text-white font-black tracking-tighter">Vista Satelital</h4>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Requiere Conexión</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}