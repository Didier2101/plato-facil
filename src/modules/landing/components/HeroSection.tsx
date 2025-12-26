"use client";
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { Truck, Store, ChevronRight, Star, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ConfiguracionRestaurante } from '../../dueno/configuraciones/actions/configuracionRestauranteActions';
import Image from 'next/image';

interface HeroSectionProps {
    config?: ConfiguracionRestaurante;
}

export default function HeroSection({ config }: HeroSectionProps) {
    return (
        <section id="inicio" className="relative overflow-hidden bg-white pt-10 pb-20 lg:pt-16 lg:pb-32">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl opacity-40" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl mb-6">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                            <span className="text-sm font-black text-orange-600 uppercase tracking-wider">
                                {config?.domicilio_activo ? "Abierto para Domicilios" : "Solo en Establecimiento"}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8">
                            Sabor Premium <br />
                            <span className="text-orange-500 underline decoration-orange-200 underline-offset-8">
                                {config?.nombre_restaurante || "Kavvo Delivery"}
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed font-medium">
                            Disfruta de la mejor experiencia gastronómica de la ciudad.
                            Ingredientes frescos, preparación experta y entrega ultra rápida.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                                className="group bg-orange-500 hover:bg-gray-900 text-white px-8 py-5 rounded-[2rem] text-lg font-black flex items-center justify-center space-x-3 transition-all duration-300 shadow-2xl shadow-orange-200 hover:shadow-gray-200"
                            >
                                <Truck className="h-6 w-6" />
                                <span>Pedir a Domicilio</span>
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href={APP_ROUTES.PUBLIC.ESTABLECIMIENTO}
                                className="bg-white border-4 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-5 rounded-[2rem] text-lg font-black flex items-center justify-center space-x-3 transition-all duration-300"
                            >
                                <Store className="h-6 w-6" />
                                <span>En Local</span>
                            </Link>
                        </div>

                        {/* Stats / Trust */}
                        <div className="mt-12 flex flex-wrap gap-8">
                            <div className="flex items-center space-x-3">
                                <div className="bg-orange-100 p-2 rounded-xl">
                                    <Star className="h-5 w-5 text-orange-600 fill-orange-600" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900">4.9/5</div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reviews</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-xl">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900">
                                        {config?.tiempo_preparacion_min || 30} min
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Preparación</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-100 p-2 rounded-xl">
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-gray-900">Seguro</div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Calidad</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Image / Illustration Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl rotate-3 border-8 border-white h-[500px] w-full">
                            <Image
                                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop"
                                alt="Hero Pizza"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Decorative cards overlay */}
                        <div className="absolute -top-10 -right-10 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 z-20 animate-bounce-slow">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                    %
                                </div>
                                <div>
                                    <div className="font-black text-gray-900">Descuento</div>
                                    <div className="text-sm text-gray-500">Primera compra</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
