// app/components/restaurant/Header.tsx

"use client";
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { Truck, Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link href={APP_ROUTES.PUBLIC.HOME} className="flex items-center space-x-3">
                        <div className="bg-orange-500 p-2 rounded-lg">
                            <Truck className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Kavvo Delivery</h1>
                            <p className="text-sm text-gray-600">Comida rápida de calidad</p>
                        </div>
                    </Link>

                    {/* Navegación Desktop */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#inicio" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                            Inicio
                        </a>
                        <a href="#menu" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                            Menú
                        </a>
                        <a href="#ubicacion" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                            Ubicación
                        </a>
                        <a href="#contacto" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                            Contacto
                        </a>

                        {/* Enlace discreto para usuarios */}

                    </nav>

                    {/* Botón menú móvil */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-gray-700"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                {/* Menú móvil */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col space-y-3">
                            <a
                                href="#inicio"
                                className="text-gray-700 hover:text-orange-500 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Inicio
                            </a>
                            <a
                                href="#menu"
                                className="text-gray-700 hover:text-orange-500 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Menú
                            </a>
                            <a
                                href="#ubicacion"
                                className="text-gray-700 hover:text-orange-500 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Ubicación
                            </a>
                            <a
                                href="#contacto"
                                className="text-gray-700 hover:text-orange-500 font-medium py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contacto
                            </a>

                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}