"use client";
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { Truck, Menu, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { ConfiguracionRestaurante } from '../../dueno/configuraciones/actions/configuracionRestauranteActions';
import Image from 'next/image';

interface HeaderProps {
    config?: ConfiguracionRestaurante;
}

export default function Header({ config }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: "#inicio", label: "Inicio" },
        { href: "#menu", label: "Menú" },
        { href: "#ubicacion", label: "Ubicación" },
        { href: "#contacto", label: "Contacto" },
    ];

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-orange-100 py-2"
                    : "bg-white py-4"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo & Brand */}
                    <Link href={APP_ROUTES.PUBLIC.HOME} className="flex items-center space-x-3 group">
                        <div className="bg-orange-500 p-2.5 rounded-2xl shadow-orange-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {config?.logo_url ? (
                                <div className="h-8 w-8 relative">
                                    <Image
                                        src={config.logo_url}
                                        alt={config.nombre_restaurante}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <Truck className="h-7 w-7 text-white" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">
                                {config?.nombre_restaurante || "Kavvo Delivery"}
                            </h1>
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">
                                Premium Quality
                            </span>
                        </div>
                    </Link>

                    {/* Navegación Desktop */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-orange-500 rounded-xl hover:bg-orange-50 transition-all duration-200"
                            >
                                {link.label}
                            </a>
                        ))}

                        <div className="h-6 w-[1px] bg-gray-200 mx-4" />

                        <Link
                            href={APP_ROUTES.PUBLIC.LOGIN}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-orange-500 transition-all duration-300 shadow-lg shadow-gray-200 hover:shadow-orange-200 flex items-center space-x-2"
                        >
                            <span>Ingresar</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </nav>

                    {/* Botón menú móvil */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-xl bg-orange-50 text-orange-600"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Menú móvil */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-orange-100 shadow-2xl animate-in slide-in-from-top duration-300">
                        <div className="p-4 space-y-2">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="block p-4 text-lg font-bold text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-2xl transition-all"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <Link
                                href={APP_ROUTES.PUBLIC.LOGIN}
                                className="block p-4 text-center bg-orange-500 text-white font-black rounded-2xl shadow-lg shadow-orange-100 mt-4"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
