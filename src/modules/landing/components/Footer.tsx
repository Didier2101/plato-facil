"use client";
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { Phone, MapPin, Mail, ExternalLink, Heart, Instagram, Facebook, Twitter } from 'lucide-react';
import Link from 'next/link';
import type { ConfiguracionRestaurante } from '../../dueno/configuraciones/actions/configuracionRestauranteActions';

interface FooterProps {
    config?: ConfiguracionRestaurante;
}

export default function Footer({ config }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contacto" className="bg-gray-900 border-t border-gray-800 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-orange-500 p-3 rounded-2xl">
                                <span className="text-white font-black text-2xl tracking-tighter">K</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tighter">
                                {config?.nombre_restaurante || "Kavvo Delivery"}
                            </h3>
                        </div>
                        <p className="text-gray-400 font-medium leading-relaxed max-w-xs">
                            Elevando la comida rápida a una experiencia premium.
                            Calidad, rapidez y sabor en cada pedido.
                        </p>
                        <div className="flex space-x-4">
                            {[Instagram, Facebook, Twitter].map((Icon, i) => (
                                <a key={i} href="#" className="bg-gray-800 p-2.5 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-gray-700 transition-all">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Contact */}
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Contacto</h4>
                        <ul className="space-y-6">
                            <li className="group flex items-start space-x-4">
                                <div className="bg-gray-800 p-2.5 rounded-xl group-hover:bg-orange-500/10 transition-colors">
                                    <Phone className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
                                    <p className="text-gray-300 font-bold group-hover:text-white transition-colors">
                                        {config?.telefono || "300 000 0000"}
                                    </p>
                                </div>
                            </li>
                            <li className="group flex items-start space-x-4">
                                <div className="bg-gray-800 p-2.5 rounded-xl group-hover:bg-orange-500/10 transition-colors">
                                    <MapPin className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Dirección</p>
                                    <p className="text-gray-300 font-bold group-hover:text-white transition-colors leading-snug">
                                        {config?.direccion_completa || "Calle Principal #123"}
                                    </p>
                                </div>
                            </li>
                            <li className="group flex items-start space-x-4">
                                <div className="bg-gray-800 p-2.5 rounded-xl group-hover:bg-orange-500/10 transition-colors">
                                    <Mail className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-gray-300 font-bold group-hover:text-white transition-colors">
                                        {config?.email || "hola@kavvo.com"}
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8">Empresa</h4>
                        <ul className="space-y-4">
                            {["Sobre nosotros", "Privacidad", "Términos", "Ayuda"].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-white font-bold transition-colors flex items-center space-x-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100" />
                                        <span>{link}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Administrative Access */}
                    <div className="bg-gray-800/50 p-6 rounded-[2rem] border border-gray-800">
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Administración</h4>
                        <p className="text-gray-400 text-xs font-medium mb-6 leading-relaxed">
                            Acceso exclusivo para personal autorizado y gestión de pedidos.
                        </p>
                        <Link
                            href={APP_ROUTES.PUBLIC.LOGIN}
                            className="w-full bg-white text-gray-900 px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                            <span>Panel Control</span>
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-2 text-gray-500 text-xs font-bold">
                        <span>© {currentYear}</span>
                        <span className="text-gray-700">|</span>
                        <span>{config?.nombre_restaurante || "Kavvo Delivery"}</span>
                        <span className="text-gray-700">|</span>
                        <span className="flex items-center space-x-1">
                            <span>Hecho con</span>
                            <Heart className="h-3 w-3 text-orange-500 fill-orange-500" />
                            <span>por</span>
                            <a href="https://www.ibug.space/" target="_blank" className="text-orange-500 hover:underline">Aurora Luminis</a>
                        </span>
                    </div>

                    <div className="flex space-x-6">
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                            Plato Fácil OS v1.0
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
