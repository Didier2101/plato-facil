// app/components/restaurant/LocationSection.tsx
import { APP_ROUTES } from '@/src/constants/app-routes';
import { MapPin, Clock, Phone } from 'lucide-react';

export default function LocationSection() {
    const restaurantLocation = {
        lat: 4.60971,
        lng: -74.08175,
        address: "Carrera 18 # 1h 12, Bogotá, Colombia",
        phone: "302 864 5014"
    };

    return (
        <section id="ubicacion" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Nuestra Ubicación
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Visítanos o pide a domicilio desde cualquier parte de la ciudad
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Mapa */}
                    <div className="rounded-xl overflow-hidden shadow-lg h-96 border border-gray-200">
                        <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${restaurantLocation.lng - 0.01},${restaurantLocation.lat - 0.01},${restaurantLocation.lng + 0.01},${restaurantLocation.lat + 0.01}&layer=mapnik&marker=${restaurantLocation.lat},${restaurantLocation.lng}`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación de Kavvo Delivery"
                        ></iframe>
                    </div>

                    {/* Información */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <MapPin className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Dirección</h3>
                                    <p className="text-gray-700">{restaurantLocation.address}</p>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantLocation.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-orange-500 hover:text-orange-600 font-medium inline-flex items-center mt-2 text-sm"
                                    >
                                        Abrir en Google Maps →
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Horarios</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Lunes - Viernes</span>
                                            <span className="font-medium text-gray-900">10:00 AM - 11:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Sábados</span>
                                            <span className="font-medium text-gray-900">11:00 AM - 12:00 AM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Domingos</span>
                                            <span className="font-medium text-gray-900">12:00 PM - 10:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 p-3 rounded-lg">
                                    <Phone className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Contacto</h3>
                                    <a
                                        href={`tel:+57${restaurantLocation.phone.replace(/\s/g, '')}`}
                                        className="text-xl font-bold text-gray-900 hover:text-orange-500 transition-colors"
                                    >
                                        {restaurantLocation.phone}
                                    </a>
                                    <p className="text-gray-600 text-sm mt-2">Llámanos para pedidos telefónicos o consultas</p>
                                    <p className="text-gray-600 text-sm mt-3">
                                        <strong className="font-semibold">Zona de cobertura:</strong> 10km a la redonda
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón para pedir a domicilio */}
                        <div className="mt-8">
                            <a
                                href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                                className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-lg font-bold transition-colors"
                            >
                                🚚 Pedir a Domicilio desde Aquí
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}