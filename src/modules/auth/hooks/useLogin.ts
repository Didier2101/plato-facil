'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions/loginActions';
import type { LoginFormData } from '../schemas/auth';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { toast } from '@/src/shared/services/toast.service';

export type UseLoginReturn = {
    login: (data: LoginFormData) => Promise<void>;
    loading: boolean;
    error: string | null;
    resetError: () => void;
};

export function useLogin(): UseLoginReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    const login = useCallback(async (data: LoginFormData) => {
        resetError();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('email', data.email);
            formData.append('password', data.password);

            const result = await loginAction(formData);

            if (result.success && result.user) {
                // Toast de éxito con nombre del usuario
                toast.success(`¡Bienvenido ${result.user.nombre || 'de vuelta'}!`, {
                    duration: 2000,
                });

                // Redirigir según el rol
                const dashboardRoute = APP_ROUTES.getDashboardByRole(result.user.rol);

                // Pequeño delay para UX
                setTimeout(() => {
                    router.push(dashboardRoute);
                    router.refresh();
                }, 500);
            } else {
                const errorMessage = result.error || 'Error desconocido';
                setError(errorMessage);
                toast.error('Error de inicio de sesión', {
                    description: errorMessage,
                    duration: 4000,
                });
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
            setError(errorMessage);
            toast.error('Error inesperado', {
                description: errorMessage,
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    }, [router, resetError]);

    return {
        login,
        loading,
        error,
        resetError,
    };
}