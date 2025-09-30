"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { logoutAction } from "@/src/actions/login/auth";
import { useUserStore } from "@/src/store/useUserStore";

interface LogoutButtonProps {
    isExpanded?: boolean;
}

export default function LogoutButton({ isExpanded = true }: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const clearUser = useUserStore((state) => state.clearUser);
    const router = useRouter();

    const handleLogout = async () => {
        try {
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

            // Limpiar store y localStorage
            clearUser();
            localStorage.removeItem('user-storage');

            startTransition(async () => {
                try {
                    const logoutResult = await logoutAction();

                    if (logoutResult.success) {
                        // Redirect desde el cliente con router.push
                        router.push('/login');
                    } else {
                        setIsLoading(false);
                        Swal.fire({
                            title: 'Error',
                            text: logoutResult.error || 'No se pudo cerrar la sesión',
                            icon: 'error',
                            confirmButtonColor: '#ef4444',
                        });
                    }
                } catch {
                    setIsLoading(false);
                    Swal.fire({
                        title: 'Error',
                        text: 'Error al cerrar sesión',
                        icon: 'error',
                        confirmButtonColor: '#ef4444',
                    });
                }
            });

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            setIsLoading(false);
            Swal.fire({
                title: 'Error',
                text: error instanceof Error ? error.message : 'No se pudo cerrar la sesión',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        }
    };

    const loading = isLoading || isPending;

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 w-full
                ${loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100"
                }
                ${isExpanded ? "gap-4" : "gap-2 justify-center"}`}
            title={isExpanded ? "" : "Cerrar sesión"}
        >
            <div className={`flex-shrink-0 w-8 flex items-center justify-center ${isExpanded ? "" : "-mr-1"}`}>
                {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <LogOut />
                )}
            </div>

            <span
                className={`transition-all duration-300 whitespace-nowrap font-medium ${isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                    }`}
            >
                {loading ? "Cerrando..." : "Cerrar sesión"}
            </span>
        </button>
    );
}