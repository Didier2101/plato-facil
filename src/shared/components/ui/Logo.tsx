"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MdDeliveryDining } from 'react-icons/md';

import { obtenerConfiguracionRestaurante } from '@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions';

interface LogoProps {
    collapsed?: boolean;
    tamaño?: 'pequeño' | 'mediano' | 'grande';
    mostrarTexto?: boolean;
}

export default function Logo({
    collapsed = false,
    tamaño = 'mediano',
    mostrarTexto = true
}: LogoProps) {
    const [configuracion, setConfiguracion] = useState<{
        nombre_restaurante: string;
        logo_url?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        cargarConfiguracion();
    }, []);

    const cargarConfiguracion = async () => {
        try {
            const resultado = await obtenerConfiguracionRestaurante();
            if (resultado.success && resultado.configuracion) {
                setConfiguracion({
                    nombre_restaurante: resultado.configuracion.nombre_restaurante,
                    logo_url: resultado.configuracion.logo_url
                });
            } else {
                setConfiguracion({
                    nombre_restaurante: 'Restaurante'
                });
            }
        } catch (error) {
            console.error('Error cargando configuración para logo:', error);
            setConfiguracion({
                nombre_restaurante: 'Kavvo Delivery'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = () => {
        console.warn('Error cargando imagen del logo, usando fallback');
        setImageError(true);
    };

    // Función para validar si la URL es segura para Image de Next.js
    const isValidImageUrl = (url?: string): boolean => {
        if (!url) return false;

        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch {
            return false;
        }
    };

    // Tamaños configurados
    const sizeConfig = {
        pequeño: {
            container: collapsed ? 'w-10 h-10' : 'w-12 h-12',
            icon: 'text-lg',
            text: 'text-sm',
            imageSize: 40
        },
        mediano: {
            container: collapsed ? 'w-12 h-12' : 'w-16 h-16',
            icon: 'text-2xl',
            text: 'text-lg',
            imageSize: 60
        },
        grande: {
            container: collapsed ? 'w-16 h-16' : 'w-24 h-24',
            icon: 'text-3xl',
            text: 'text-xl',
            imageSize: 90
        }
    };

    const { container, icon, text, imageSize } = sizeConfig[tamaño];

    if (loading) {
        return (
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className={`${container} bg-orange-100 rounded-xl flex items-center justify-center animate-pulse`}>
                    <div className="w-3/4 h-3/4 bg-orange-200 rounded-lg"></div>
                </div>
                {!collapsed && mostrarTexto && (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded w-16"></div>
                    </div>
                )}
            </div>
        );
    }

    const nombreRestaurante = configuracion?.nombre_restaurante || 'Kavvo Delivery';
    const logoUrl = configuracion?.logo_url;
    const puedeMostrarImagen = logoUrl && !imageError && isValidImageUrl(logoUrl);

    // Dividir el nombre para mostrar en dos líneas si es largo
    const nombrePartes = nombreRestaurante.split(' ');
    const primeraParte = nombrePartes[0];
    const restoNombre = nombrePartes.slice(1).join(' ');

    return (
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            {/* Contenedor del logo/imagen */}
            <div className={`${container} bg-gradient-to-br from-orange-500 to-orange-600 
                           rounded-xl flex items-center justify-center 
                           shadow-md hover:shadow-lg transition-shadow duration-300
                           ${!collapsed && 'ring-2 ring-orange-100'}`}>
                {puedeMostrarImagen ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={logoUrl}
                            alt={`Logo ${nombreRestaurante}`}
                            fill
                            className="rounded-xl object-contain p-1"
                            onError={handleImageError}
                            sizes={`${imageSize}px`}
                            priority={true}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        {/* Icono de delivery como fallback */}
                        <MdDeliveryDining className={`${icon} text-white`} />
                    </div>
                )}
            </div>

            {/* Texto del logo - solo mostrar si no está colapsado */}
            {!collapsed && mostrarTexto && (
                <div className="flex flex-col">
                    <span className={`${text} font-bold text-gray-900 tracking-tight leading-tight`}>
                        {primeraParte}
                    </span>
                    {restoNombre && (
                        <span className="text-xs font-medium text-orange-500 tracking-wider uppercase">
                            {restoNombre}
                        </span>
                    )}
                    {!restoNombre && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600">Delivery</span>
                        </div>
                    )}
                </div>
            )}

            {/* Versión colapsada con tooltip */}
            {collapsed && (
                <div className="relative group">
                    {/* Tooltip con nombre del restaurante */}
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 
                                  bg-gray-900 text-white px-3 py-2 rounded-lg text-sm 
                                  opacity-0 group-hover:opacity-100 transition-opacity 
                                  pointer-events-none whitespace-nowrap z-50
                                  shadow-lg">
                        <div className="font-semibold">{nombreRestaurante}</div>
                        <div className="text-xs text-gray-300 mt-1">Delivery App</div>
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 
                                      w-0 h-0 border-t-4 border-b-4 border-l-0 
                                      border-r-4 border-transparent border-r-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
}