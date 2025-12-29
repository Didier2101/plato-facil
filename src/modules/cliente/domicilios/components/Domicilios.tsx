"use client";

import React from "react";
import TiendaProductos from "@/src/modules/admin/tienda/components/TiendaProductos";
import { useDomicilios } from "../hooks/useDomicilios";
import {
    Clock,
    Moon,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Domicilios() {
    const {
        servicioDisponible,
        horarioInfo
    } = useDomicilios();

    // Mensaje de servicio no disponible
    if (!servicioDisponible || !horarioInfo.abierto) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl shadow-gray-200 border border-gray-100"
                >
                    <div className="mb-8 relative flex justify-center">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center ring-8 ring-orange-50/50">
                            {!servicioDisponible ? (
                                <Moon className="w-10 h-10 text-orange-500" />
                            ) : (
                                <Clock className="w-10 h-10 text-orange-500" />
                            )}
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
                        {!servicioDisponible ? "Pausamos Momentáneamente" : "Estamos Descansando"}
                    </h2>

                    <p className="text-gray-400 font-bold mb-8 leading-relaxed text-sm">
                        {!servicioDisponible
                            ? "Nuestro equipo está recargando energías. Pronto estaremos de vuelta para deleitarte."
                            : `Volveremos pronto para servirte nuestro delicioso menú.\n${horarioInfo.mensaje}`
                        }
                    </p>

                    <div className="bg-gray-900 rounded-3xl p-6 text-left shadow-xl shadow-gray-200">
                        <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Recomendación
                        </p>
                        <p className="text-white text-xs font-bold leading-relaxed opacity-80">
                            Preparamos los mejores platos de la ciudad. ¡No te pierdas nuestra apertura mañana!
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return <TiendaProductos isDomicilio={true} />;
}