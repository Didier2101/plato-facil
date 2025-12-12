// app/components/restaurant/HeroSection.tsx

"use client";
import { APP_ROUTES } from '@/src/constants/app-routes';
import { Truck, Store } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section id="inicio" className="relative bg-gradient-to-b from-gray-50 to-white">
            {/* Patrón decorativo sutil */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-orange-500"></div>
                <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-orange-500"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                        Kavvo Delivery
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto">
                        Los mejores platos de comida rápida, directamente a tu puerta o para disfrutar en nuestro establecimiento
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        {/* Botón principal: Pedir a Domicilio */}
                        <Link
                            href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg"
                        >
                            <Truck className="h-7 w-7" />
                            <span>Pedir a Domicilio</span>
                        </Link>

                        {/* Botón secundario: Pedir en Establecimiento */}
                        <Link
                            href={APP_ROUTES.PUBLIC.ESTABLECIMIENTO}
                            className="bg-white text-gray-800 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center space-x-3 transition-all border-2 border-gray-200 shadow-sm hover:shadow"
                        >
                            <Store className="h-7 w-7 text-orange-500" />
                            <span>Pedir en Establecimiento</span>
                        </Link>
                    </div>

                    {/* Info rápida */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-3xl font-bold text-gray-900">30 min</div>
                            <div className="text-gray-600">Entrega promedio</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-3xl font-bold text-gray-900">4.8★</div>
                            <div className="text-gray-600">Calificación</div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="text-3xl font-bold text-gray-900">24/7</div>
                            <div className="text-gray-600">Servicio</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}