"use client";

import React from "react";
import Image from "next/image";

interface LoadingProps {
    texto?: string;
    subtexto?: string;
    tamaño?: "pequeño" | "mediano" | "grande";
    color?: string;
}

export default function Loading({
    texto = "Cargando...",
    subtexto = "Por favor espera un momento...",
    tamaño = "mediano",
    color = "orange-500"
}: LoadingProps) {
    const tamaños = {
        pequeño: {
            spinner: "w-16 h-16",
            logo: "w-8 h-8",
            texto: "text-sm",
            subtexto: "text-xs",
            borderWidth: "border-2"
        },
        mediano: {
            spinner: "w-24 h-24",
            logo: "w-12 h-12",
            texto: "text-base",
            subtexto: "text-sm",
            borderWidth: "border-4"
        },
        grande: {
            spinner: "w-32 h-32",
            logo: "w-16 h-16",
            texto: "text-lg",
            subtexto: "text-base",
            borderWidth: "border-4"
        }
    };

    const colorClasses = {
        'orange-500': 'border-orange-500',
        'blue-500': 'border-blue-500',
        'green-500': 'border-green-500',
        'red-500': 'border-red-500',
        'purple-500': 'border-purple-500',
        'gray-500': 'border-gray-500'
    };

    const borderColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses['orange-500'];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-6">
                {/* Spinner circular con logo en el centro */}
                <div className="relative flex items-center justify-center">
                    {/* Spinner animado */}
                    <div
                        className={`
                            ${tamaños[tamaño].spinner} 
                            ${tamaños[tamaño].borderWidth}
                            ${borderColorClass}
                            border-t-transparent
                            rounded-full
                            animate-spin
                        `}
                    />

                    {/* Logo en el centro */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Image
                            src="/assets/logo-kavvo-solo.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className={`${tamaños[tamaño].logo} object-contain`}
                            priority
                        />
                    </div>
                </div>

                {/* Textos */}
                <div className="text-center">
                    <p className={`text-gray-900 font-semibold ${tamaños[tamaño].texto}`}>
                        {texto}
                    </p>
                    {subtexto && (
                        <p className={`text-gray-500 mt-1 ${tamaños[tamaño].subtexto}`}>
                            {subtexto}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}