"use client";

import React from "react";
import { FaSpinner } from "react-icons/fa";

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
            container: "w-12 h-12",
            icon: "text-lg",
            texto: "text-sm",
            subtexto: "text-xs"
        },
        mediano: {
            container: "w-16 h-16",
            icon: "text-2xl",
            texto: "text-base",
            subtexto: "text-sm"
        },
        grande: {
            container: "w-20 h-20",
            icon: "text-3xl",
            texto: "text-lg",
            subtexto: "text-base"
        }
    };

    const colorClasses = {
        'orange-500': 'bg-orange-500',
        'blue-500': 'bg-blue-500',
        'green-500': 'bg-green-500',
        'red-500': 'bg-red-500',
        'purple-500': 'bg-purple-500',
        'gray-500': 'bg-gray-500'
    };

    const backgroundClass = colorClasses[color as keyof typeof colorClasses] || colorClasses['orange-500'];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className={`${backgroundClass} rounded-xl flex items-center justify-center ${tamaños[tamaño].container}`}>
                    <FaSpinner className={`${tamaños[tamaño].icon} text-white animate-spin`} />
                </div>
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