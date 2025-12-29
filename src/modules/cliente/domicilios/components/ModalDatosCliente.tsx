"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCliente } from "../hooks/useCliente";
import { User, Phone, MapPin, X, ArrowLeft, CheckCircle, Smartphone } from "lucide-react";

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
        if (!nombre || !telefono || !direccion) return;

        const success = await guardarDatosCliente({ nombre, telefono, direccion });
        if (success) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {/* Overlay with subtle blur */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] transition-all"
                onClick={onClose}
            />

            {/* Modal - Modern App Style */}
            <motion.div
                key="modal"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="
                    fixed inset-x-0 bottom-0 lg:inset-auto 
                    lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                    bg-white z-[100] 
                    rounded-t-[3rem] lg:rounded-[3rem] 
                    shadow-2xl shadow-gray-900/20
                    lg:max-w-md lg:w-full max-h-[90vh]
                    flex flex-col overflow-hidden
                    border-t-8 border-orange-500 lg:border-t-0
                "
            >
                {/* Visual Handle for Mobile */}
                <div className="lg:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2" />

                {/* Header Section */}
                <div className="px-8 pt-8 pb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-200">
                                <Smartphone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Tu Perfil</h2>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Delivery Premium</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100/50">
                        <p className="text-sm text-orange-700 font-bold leading-relaxed">
                            {cliente ? "Actualiza tus datos para tus próximos pedidos." : "Ingresa tus datos para brindarte la mejor experiencia en tu pedido."}
                        </p>
                    </div>
                </div>

                {/* Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-2 no-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Field: Nombre */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="¿Cómo te llamas?"
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-gray-900"
                                    required
                                />
                                {nombre.length > 3 && (
                                    <div className="absolute inset-y-0 right-5 flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Field: Teléfono */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Celular / WhatsApp</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-orange-500">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Tu número de contacto"
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-gray-900"
                                    required
                                />
                            </div>
                        </div>

                        {/* Field: Dirección */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Dirección de Entrega</label>
                            <div className="relative group">
                                <div className="absolute top-5 left-5 pointer-events-none transition-colors group-focus-within:text-orange-500">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <textarea
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Ej: Calle 45 #12-34, Apto 501"
                                    rows={3}
                                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-orange-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-gray-900 resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Action Section */}
                <div className="p-8 mt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !nombre || !telefono || !direccion}
                        className="
                            w-full bg-gray-900 hover:bg-orange-500 text-white font-black py-5 rounded-[2rem] 
                            transition-all duration-300 shadow-xl hover:shadow-orange-200 
                            disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none
                            flex items-center justify-center gap-3 text-lg
                        "
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Guardando...</span>
                            </div>
                        ) : (
                            <>
                                <span>Confirmar Datos</span>
                                <ArrowLeft className="h-5 w-5 rotate-180" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-6">
                        Seguridad de datos Kavvo ©
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}