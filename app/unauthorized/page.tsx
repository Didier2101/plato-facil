"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useUserStore } from "@/src/store/useUserStore";

export default function UnauthorizedPage() {
    const router = useRouter();
    const { rol } = useUserStore();
    const [countdown, setCountdown] = useState(10);

    // ✅ Contador con redirección automática
    useEffect(() => {
        if (countdown === 0) {
            // Lógica de redirección directamente en el useEffect
            if (!rol) {
                router.replace("/login");
                return;
            }

            switch (rol) {
                case "admin":
                    router.replace("/admin/caja");
                    break;
                case "dueno":
                    router.replace("/dueno/reportes");
                    break;
                case "repartidor":
                    router.replace("/repartidor");
                    break;
                default:
                    router.replace("/login");
            }
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, rol, router]); // ✅ Todas las dependencias incluidas

    // Función auxiliar para el botón "Ir al inicio"
    const handleGoHome = () => {
        if (!rol) {
            router.replace("/login");
            return;
        }

        switch (rol) {
            case "admin":
                router.replace("/admin/caja");
                break;
            case "dueno":
                router.replace("/dueno/reportes");
                break;
            case "repartidor":
                router.replace("/repartidor");
                break;
            default:
                router.replace("/login");
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
            <div className="max-w-md w-full">
                {/* Card principal */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-red-100">
                    {/* Icono animado */}
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                        <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full">
                            <ShieldAlert className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    {/* Título */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Acceso Denegado
                        </h1>
                        <p className="text-gray-600">
                            No tienes permisos para acceder a esta sección
                        </p>
                    </div>

                    {/* Mensaje adicional */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <p className="text-sm text-gray-600">
                            Esta página está restringida. Por favor, accede a las secciones autorizadas para tu cuenta.
                        </p>
                    </div>

                    {/* Contador de redirección */}
                    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 border border-orange-200">
                        <p className="text-sm text-gray-700">
                            Serás redirigido automáticamente en
                        </p>
                        <p className="text-4xl font-bold text-orange-600 mt-2">
                            {countdown}s
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={handleGoBack}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver atrás
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <Home className="w-4 h-4" />
                            Ir al inicio
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Si crees que esto es un error, contacta al administrador
                </p>
            </div>
        </div>
    );
}