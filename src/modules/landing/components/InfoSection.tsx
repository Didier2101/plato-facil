"use client";
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { CreditCard, Shield, Truck, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ConfiguracionRestaurante } from '../../dueno/configuraciones/actions/configuracionRestauranteActions';

interface InfoSectionProps {
    config?: ConfiguracionRestaurante;
}

export default function InfoSection({ config }: InfoSectionProps) {
    const services = [
        {
            icon: <Truck className="h-8 w-8" />,
            title: "Delivery Rápido",
            description: `Entregas en promedio de ${config?.tiempo_preparacion_min || 30} min en nuestra zona.`
        },
        {
            icon: <CreditCard className="h-8 w-8" />,
            title: "Pagos Seguros",
            description: "Aceptamos tarjetas, efectivo y transferencias digitales."
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Calidad Premium",
            description: "Ingredientes seleccionados diariamente para el mejor sabor."
        },
        {
            icon: <ShoppingBag className="h-8 w-8" />,
            title: "Para Llevar",
            description: "Pide online y recoge en nuestro local sin filas."
        }
    ];

    const steps = [
        "Elige tus platillos",
        "Personaliza todo",
        "Cocinamos para ti",
        "Disfruta en casa"
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* How it works Title */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-6">
                        Experiencia <span className="text-orange-500">Sin Esfuerzo</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Desde tu primer clic hasta el último bocado, diseñamos un proceso simple y delicioso.
                    </p>
                </div>

                {/* Pasos Modernos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group"
                        >
                            <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border-2 border-transparent group-hover:border-orange-200 transition-all duration-300 text-center h-full">
                                <div className="w-16 h-16 bg-white shadow-xl shadow-orange-100/50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl font-black mb-6 mx-auto group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                                <h3 className="font-black text-gray-900 text-lg mb-3 tracking-tight">{step}</h3>
                                <div className="flex items-center justify-center">
                                    <div className="h-1 w-8 bg-orange-200 rounded-full group-hover:w-12 transition-all" />
                                </div>
                            </div>
                            {index < 3 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-orange-200">
                                    <ChevronRight className="h-8 w-8" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Servicios High-End */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-32">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-gray-900 p-10 rounded-[3rem] text-white hover:bg-orange-500 group transition-all duration-500"
                        >
                            <div className="text-orange-500 group-hover:text-white mb-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 tracking-tighter">{service.title}</h3>
                            <p className="text-gray-400 group-hover:text-orange-50 text-sm font-medium leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Final CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-orange-500 rounded-[4rem] p-12 md:p-20 overflow-hidden shadow-2xl shadow-orange-200"
                >
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none" />
                    <div className="relative text-center max-w-3xl mx-auto">
                        <h3 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                            El momento de comer <br /> premium es <span className="underline decoration-white/30 underline-offset-8">ahora</span>.
                        </h3>
                        <p className="text-xl text-orange-50 mb-12 font-medium opacity-90">
                            Ordena ahora y recibe tu pedido con la calidad que {config?.nombre_restaurante || "nos"} caracteriza.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <a
                                href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                                className="bg-gray-900 border-4 border-gray-900 hover:bg-white hover:border-white hover:text-gray-900 text-white px-10 py-5 rounded-[2rem] text-xl font-black transition-all duration-300 shadow-2xl"
                            >
                                Iniciar Pedido
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
