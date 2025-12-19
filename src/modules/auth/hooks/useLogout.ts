// src/modules/auth/hooks/useLogout.ts
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '../actions/loginActions';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { toast } from '@/src/shared/services/toast.service';

export function useLogout() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await logoutAction();

            if (result.success) {
                // Toast de éxito con duración corta
                toast.success('¡Sesión cerrada!', {
                    description: 'Hasta pronto',
                    duration: 2000,
                });

                // Redirigir al login
                setTimeout(() => {
                    router.push(APP_ROUTES.PUBLIC.LOGIN);
                    router.refresh();
                }, 500);
            } else {
                const errorMessage = result.error || 'Error desconocido';
                setError(errorMessage);

                toast.error('Error al cerrar sesión', {
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
    }, [router]);

    return {
        logout,
        loading,
        error,
    };
}