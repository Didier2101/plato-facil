// src/hooks/useLogin.ts
'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { LoginFormData } from '../schemas/auth';
import { loginAction } from '../actions/login/loginActions';
import { APP_ROUTES } from '../constants/app-routes';


export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const showSuccessToast = useCallback((nombre?: string | null, email?: string) => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#10b981',
            color: 'white',
            customClass: {
                popup: 'swal2-toast-custom',
            },
        });

        Toast.fire({
            icon: 'success',
            title: `¡Bienvenido ${nombre || email}!`,
        });
    }, []);

    const showErrorAlert = useCallback((errorMessage: string) => {
        Swal.fire({
            icon: 'error',
            title: 'Error de Acceso',
            text: errorMessage,
            confirmButtonColor: '#f97316',
            confirmButtonText: 'Entendido',
            background: '#ffffff',
            color: '#1f2937',
            customClass: {
                popup: 'swal2-popup-custom',
                confirmButton: 'swal2-confirm-custom',
            },
        });
    }, []);

    const login = useCallback((data: LoginFormData) => {
        // Resetear estado
        setError(null);
        setLoading(true);

        // Crear FormData
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);

        startTransition(async () => {
            try {
                // Ejecutar acción del servidor
                const result = await loginAction(formData);

                if (result.success && result.user) {
                    // Mostrar éxito
                    showSuccessToast(result.user.nombre, result.user.email);

                    // Redirigir según rol usando app-routes
                    const dashboardRoute = APP_ROUTES.getDashboardByRole(result.user.rol);

                    // Pequeño delay para UX
                    setTimeout(() => {
                        router.push(dashboardRoute);
                    }, 500);
                } else {
                    // Mostrar error
                    setError(result.error || 'Error desconocido');
                    showErrorAlert(result.error || 'Error desconocido');
                }
            } catch (err) {
                // Manejo de errores inesperados
                const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
                setError(errorMessage);
                showErrorAlert(errorMessage);
            } finally {
                setLoading(false);
            }
        });
    }, [router, showSuccessToast, showErrorAlert]);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return {
        login,
        loading: loading || isPending,
        error,
        resetError,
    };
}