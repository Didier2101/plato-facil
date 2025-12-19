"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCliente } from "../hooks/useCliente";
import { FiUser, FiPhone, FiMapPin, FiX, FiArrowLeft } from "react-icons/fi";

interface ModalDatosClienteProps {
    onClose: () => void;
}

export default function ModalDatosCliente({ onClose }: ModalDatosClienteProps) {
    const { cliente, loading, guardarDatosCliente } = useCliente();

    const [nombre, setNombre] = useState(cliente?.nombre || "");
    const [telefono, setTelefono] = useState(cliente?.telefono || "");
    const [direccion, setDireccion] = useState(cliente?.direccion || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await guardarDatosCliente({ nombre, telefono, direccion });
        if (success) {
            onClose();
        }
    };


    return (
        <AnimatePresence>
            {/* Overlay con animación de entrada/salida */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Modal principal */}
            <motion.div
                key="modal"
                initial={{
                    x: "100%",
                    opacity: 0
                }}
                animate={{
                    x: 0,
                    opacity: 1
                }}
                exit={{
                    x: "100%",
                    opacity: 0
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeInOut"
                }}
                className="
                    fixed inset-0 lg:inset-auto 
                    lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                    bg-white z-50 
                    lg:rounded-3xl lg:shadow-2xl
                    lg:max-w-md lg:w-full lg:max-h-[90vh]
                    flex flex-col
                "
            >
                {/* Header fijo */}
                <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 lg:rounded-t-3xl">
                    {/* Header móvil - Botón flecha y título */}
                    <div className="lg:hidden flex items-center gap-3 p-4">
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <FiArrowLeft className="text-lg" />
                        </button>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Bienvenido</h2>
                            <p className="text-orange-100 text-sm">
                                Ingresa tus datos para continuar
                            </p>
                        </div>
                    </div>

                    {/* Header desktop - Botón X */}
                    <div className="hidden lg:flex items-center justify-between p-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Bienvenido</h2>
                            <p className="text-orange-100 mt-1">
                                Por favor ingresa tus datos para continuar con tu pedido
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        >
                            <FiX className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Contenido con scroll */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Nombre completo
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Juan Pérez"
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                                    />
                                </div>
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiPhone className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                                        placeholder="Ej: 3001234567"
                                        disabled={loading}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
                                    />
                                </div>
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Dirección de entrega
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FiMapPin className="text-gray-400" />
                                    </div>
                                    <textarea
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                        placeholder="Ej: Calle 123 #45-67, Apto 801"
                                        disabled={loading}
                                        rows={4}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none text-base"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Footer fijo */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-white lg:rounded-b-3xl">
                    <div className="p-6">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-all duration-200 hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 text-base"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                "Continuar con mi pedido"
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}