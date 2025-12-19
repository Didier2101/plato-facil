"use client";

import Link from 'next/link';
import { motion } from "framer-motion";
import { Lock, LogOut } from "lucide-react";
import { logoutAction as signOut } from "@/src/modules/auth/actions/loginActions";

import { PUBLIC_ROUTES } from "../constants/app-routes";
import { useEffect } from 'react';


export default function Unauthorized() {
    useEffect(() => {
        // Cerrar sesión automáticamente por seguridad
        const handleLogout = async () => {
            try {
                await signOut();
                console.log('Sesión cerrada por seguridad');
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        };

        handleLogout();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                {/* Header decorativo */}
                <div className="bg-orange-500 p-6 flex justify-center">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                </div>

                <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
                    <p className="text-gray-600 mb-8">
                        No tienes permisos suficientes para acceder a esta sección. Por seguridad, tu sesión ha sido cerrada.
                    </p>

                    <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href={PUBLIC_ROUTES.LOGIN}
                                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-200"
                            >
                                <LogOut className="w-5 h-5" />
                                Volver al Inicio
                            </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href={PUBLIC_ROUTES.HOME}
                                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                            >
                                Ir a la tienda
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Footer simple */}
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                    <div className="flex justify-center items-center gap-2 text-gray-400 text-sm">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        Sistema de Seguridad Kavvo
                    </div>
                </div>
            </motion.div>
        </div>
    );
}