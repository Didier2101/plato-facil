"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { logoutAction } from '../actions/login/auth';


export default function Unauthorized() {
    useEffect(() => {
        // Cerrar sesión automáticamente por seguridad
        const handleLogout = async () => {
            try {
                await logoutAction();
                console.log('Sesión cerrada por seguridad');
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
            }
        };

        handleLogout();
    }, []);

    return (
        <div className="h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Contenido principal */}
            <div className="text-center relative z-10 max-w-2xl mx-auto">
                {/* Logo KAVVO más grande */}
                <div className="mb-12">
                    <Image
                        src="/assets/logo-kavvo.png"
                        alt="Logo KAVVO"
                        width={500}
                        height={250}
                        className="mx-auto mb-4 h-60 w-auto opacity-90"
                    />
                </div>

                {/* Número 403 grande */}
                <div className="relative mb-8 -mt-12">
                    <h1 className="text-9xl font-black text-orange-500 opacity-90 tracking-tighter">
                        403
                    </h1>
                    <div className="absolute inset-0 text-9xl font-black text-orange-600 opacity-40 blur-sm -z-10">
                        403
                    </div>
                </div>

                {/* Mensaje principal */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Acceso No Autorizado
                    </h2>
                    <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                        No tienes permisos para acceder a esta sección.
                        Tu sesión ha sido cerrada por seguridad.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <Link
                        href="/login"
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Iniciar Sesión
                    </Link>

                    <Link
                        href="/domicilios"
                        className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Ir a Domicilios
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="border-2 border-gray-400 text-gray-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver Atrás
                    </button>
                </div>

                {/* Mensaje de seguridad */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-sm text-red-800">
                        🔒 Por seguridad, tu sesión fue cerrada automáticamente al intentar acceder a un área restringida.
                    </p>
                </div>
            </div>
        </div>
    );
}