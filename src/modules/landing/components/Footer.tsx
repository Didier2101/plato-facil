// app/components/restaurant/Footer.tsx
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { Truck, Phone, MapPin, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Información del restaurante */}
                    <div>
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-orange-500 p-2 rounded-lg">
                                <Truck className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold">Kavvo Delivery</h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            Los mejores platos de comida rápida entregados directamente a tu puerta desde 2014.
                        </p>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contacto</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-orange-500" />
                                <span className="text-gray-400">302 864 5014</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-orange-500" />
                                <span className="text-gray-400">Carrera 18 # 1h 12</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-orange-500" />
                                <span className="text-gray-400">pedidos@kavvodelivery.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Enlaces */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Enlaces</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#inicio" className="text-gray-400 hover:text-orange-500 transition-colors">
                                    Inicio
                                </a>
                            </li>
                            <li>
                                <a href="#menu" className="text-gray-400 hover:text-orange-500 transition-colors">
                                    Menú
                                </a>
                            </li>
                            <li>
                                <a href="#ubicacion" className="text-gray-400 hover:text-orange-500 transition-colors">
                                    Ubicación
                                </a>
                            </li>
                            <li>
                                <a href="#contacto" className="text-gray-400 hover:text-orange-500 transition-colors">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Desarrollador y acceso administrativo */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Información</h4>
                        <div className="space-y-6">
                            {/* Enlace al desarrollador */}
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Desarrollado por:</p>
                                <a
                                    href="https://www.ibug.space/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    <span className="font-medium">Aurora Luminis</span>
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </div>

                            {/* Separador */}
                            <div className="border-t border-gray-800 pt-4">
                                <p className="text-gray-400 text-sm mb-3">Acceso administrativo:</p>
                                <Link
                                    href={APP_ROUTES.PUBLIC.LOGIN}
                                    className="text-gray-300 hover:text-white text-sm inline-flex items-center transition-colors"
                                >
                                    <span>Panel Administrativo</span>
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Línea divisoria y derechos */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} Kavvo Delivery. Todos los derechos reservados.
                        </p>
                        <p className="text-gray-500 text-sm mt-2 md:mt-0">
                            Sistema desarrollado por{' '}
                            <a
                                href="https://www.ibug.space/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 hover:text-orange-300"
                            >
                                Aurora Luminis
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}