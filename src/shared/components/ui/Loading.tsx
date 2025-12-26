"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface LoadingProps {
    texto?: string;
    subtexto?: string;
    tamaño?: "pequeño" | "mediano" | "grande";
    color?: string;
}

export default function Loading({
    texto = "Preparando delicias...",
    subtexto = "Nuestro chef está en ello",
    tamaño = "mediano",
}: LoadingProps) {
    const tamaños = {
        pequeño: {
            spinner: "w-20 h-20",
            logo: "w-10 h-10",
            texto: "text-[10px]",
            subtexto: "text-[8px]",
            gap: "gap-4"
        },
        mediano: {
            spinner: "w-32 h-32",
            logo: "w-16 h-16",
            texto: "text-xs",
            subtexto: "text-[10px]",
            gap: "gap-6"
        },
        grande: {
            spinner: "w-44 h-44",
            logo: "w-24 h-24",
            texto: "text-sm",
            subtexto: "text-xs",
            gap: "gap-8"
        }
    };

    return (
        <div className="min-h-[400px] w-full flex items-center justify-center bg-slate-50/50 backdrop-blur-sm rounded-[3rem]">
            <div className={`flex flex-col items-center ${tamaños[tamaño].gap}`}>
                <div className="relative flex items-center justify-center">
                    {/* Outer Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`${tamaños[tamaño].spinner} absolute bg-orange-500 rounded-full blur-3xl`}
                    />

                    {/* Animated Rings */}
                    <div className={`${tamaños[tamaño].spinner} relative`}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-slate-200 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full"
                        />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-2 border-2 border-transparent border-b-slate-900 rounded-full opacity-60"
                        />
                    </div>

                    {/* Center Logo */}
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Image
                            src="/assets/logo-kavvo-solo.png"
                            alt="Logo"
                            width={120}
                            height={120}
                            className={`${tamaños[tamaño].logo} object-contain filter drop-shadow-xl`}
                            priority
                        />
                    </motion.div>
                </div>

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <h3 className={`font-black text-slate-900 uppercase tracking-[0.3em] ${tamaños[tamaño].texto}`}>
                        {texto}
                    </h3>
                    {subtexto && (
                        <p className={`font-black text-orange-500/50 uppercase tracking-[0.4em] ${tamaños[tamaño].subtexto}`}>
                            {subtexto}
                        </p>
                    )}
                </motion.div>

                {/* Loading Bar Decoration */}
                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden relative">
                    <motion.div
                        animate={{ x: [-64, 64] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 w-8 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                    />
                </div>
            </div>
        </div>
    );
}