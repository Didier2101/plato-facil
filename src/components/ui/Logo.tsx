"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { BsFillBookmarkStarFill } from 'react-icons/bs';
import { obtenerConfiguracionRestaurante } from '@/src/actions/dueno/configuracionRestauranteActions';

interface LogoProps {
    collapsed?: boolean;
}

export default function Logo({ collapsed = false }: LogoProps) {
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
                    nombre_restaurante: 'PlatoFácil'
                });
            }
        } catch (error) {
            console.error('Error cargando configuración para logo:', error);
            setConfiguracion({
                nombre_restaurante: 'PlatoFácil'
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
            // Verificar que sea HTTP/HTTPS
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch {
            return false;
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'}`}>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm animate-pulse">
                    <BsFillBookmarkStarFill className="text-white text-2xl" />
                </div>
                {!collapsed && (
                    <div className="animate-pulse">
                        <div className="h-6 bg-white/20 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-white/10 rounded w-24"></div>
                    </div>
                )}
            </div>
        );
    }

    const nombreRestaurante = configuracion?.nombre_restaurante || 'PlatoFácil';
    const logoUrl = configuracion?.logo_url;
    const puedeMostrarImagen = logoUrl && !imageError && isValidImageUrl(logoUrl);

    if (collapsed) {
        return (
            <div className="flex justify-center">
                {puedeMostrarImagen ? (
                    <div className="relative w-12 h-12">
                        <Image
                            src={logoUrl}
                            alt={`Logo ${nombreRestaurante}`}
                            fill
                            className="rounded-xl object-cover border-2 border-white/20"
                            onError={handleImageError}
                            sizes="48px"
                            priority={true}
                            unoptimized={true}
                        />
                    </div>
                ) : (
                    <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                        <BsFillBookmarkStarFill className="text-white text-2xl" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {puedeMostrarImagen ? (
                <div className="relative w-16 h-16">
                    <Image
                        src={logoUrl}
                        alt={`Logo ${nombreRestaurante}`}
                        fill
                        className="rounded-xl object-cover border-2 border-white/20 shadow-lg"
                        onError={handleImageError}
                        sizes="64px"
                        priority={true}
                        unoptimized={true}
                    />
                </div>
            ) : (
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm shadow-lg">
                    <BsFillBookmarkStarFill className="text-white text-2xl" />
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold">{nombreRestaurante}</h1>
                <p className="text-orange-100 text-sm font-medium">Panel de Administración</p>
            </div>
        </div>
    );
}