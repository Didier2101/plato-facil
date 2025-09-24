"use client";

import React from "react";
import { LuChefHat } from "react-icons/lu";

interface LoadingProps {
    texto?: string;
    tamaño?: "pequeño" | "mediano" | "grande";
    color?: string;
}

export default function Loading({
    texto = "Cargando órdenes...",
    tamaño = "mediano",
    color = "orange-500"
}: LoadingProps) {
    const tamaños = {
        pequeño: { icon: "h-8 w-8", circle: "h-12 w-12" },
        mediano: { icon: "h-12 w-12", circle: "h-16 w-16" },
        grande: { icon: "h-16 w-16", circle: "h-24 w-24" }
    };

    const textoTamaño = {
        pequeño: "text-sm",
        mediano: "text-base",
        grande: "text-lg"
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4 min-h-screen bg-gray-50">
            <div className="relative flex items-center justify-center">
                {/* Círculo animado */}
                <div
                    className={`absolute rounded-full border-4 border-${color} border-t-transparent animate-spin ${tamaños[tamaño].circle}`}
                />
                {/* Ícono de chef en el centro */}
                <LuChefHat className={`text-${color} ${tamaños[tamaño].icon} relative z-10`} />
            </div>
            <p className={`text-gray-600 font-medium ${textoTamaño[tamaño]}`}>{texto}</p>
        </div>
    );
}
