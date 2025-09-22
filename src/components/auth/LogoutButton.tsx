"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { logoutAction } from "@/src/actions/auth";
import { useUserStore } from "@/src/store/useUserStore";

interface LogoutButtonProps {
    isExpanded?: boolean;
}

export default function LogoutButton({ isExpanded = true }: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const clearUser = useUserStore((state) => state.clearUser); // Obtener función clearUser

    const handleLogout = async () => {
        try {
            // Mostrar confirmación
            const result = await Swal.fire({
                title: '¿Cerrar sesión?',
                text: 'Tu sesión será cerrada',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, salir',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                reverseButtons: true
            });

            if (!result.isConfirmed) return;

            setIsLoading(true);

            // Ejecutar server action
            const result_logout = await logoutAction();

            if (!result_logout.success) {
                throw new Error(result_logout.error);
            }

            // IMPORTANTE: Limpiar el store de usuario
            clearUser();

            // Eliminar completamente la entrada del localStorage
            localStorage.removeItem('user-storage');

            // Mostrar éxito
            await Swal.fire({
                title: '¡Hasta luego!',
                text: 'Sesión cerrada correctamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            // Redirigir
            router.push('/');

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Swal.fire({
                title: '❌ Error',
                text: error instanceof Error ? error.message : 'No se pudo cerrar la sesión',
                icon: 'error',
                confirmButtonText: 'Intentar de nuevo'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 w-full
                ${isLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100"
                }
                ${isExpanded ? "gap-4" : "gap-2 justify-center"}`}
            title={isExpanded ? "" : "Cerrar sesión"}
        >
            {/* Icon */}
            <div className={`flex-shrink-0 w-8 flex items-center justify-center ${isExpanded ? "" : "-mr-1"}`}>
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <LogOut />
                )}
            </div>

            {/* Label */}
            <span
                className={`transition-all duration-300 whitespace-nowrap font-medium ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                    }`}
            >
                {isLoading ? "Cerrando..." : "Cerrar sesión"}
            </span>
        </button>
    );
}