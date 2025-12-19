// src/shared/services/toast.service.ts
import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
    duration?: number;
    description?: string;
    action?: {
        label: React.ReactNode;
        onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    };
    cancel?: {
        label: React.ReactNode;
        onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    };
}



class ToastService {
    /**
     * Muestra un toast de éxito
     * @param message - Mensaje principal
     * @param options - Opciones adicionales
     */
    success(message: string, options?: ToastOptions) {
        return sonnerToast.success(message, {
            duration: options?.duration || 3000,
            description: options?.description,
            action: options?.action,
            cancel: options?.cancel,
        });
    }

    /**
     * Muestra un toast de error
     * @param message - Mensaje principal
     * @param options - Opciones adicionales
     */
    error(message: string, options?: ToastOptions) {
        return sonnerToast.error(message, {
            duration: options?.duration || 4000,
            description: options?.description,
            action: options?.action,
            cancel: options?.cancel,
        });
    }

    /**
     * Muestra un toast de advertencia
     * @param message - Mensaje principal
     * @param options - Opciones adicionales
     */
    warning(message: string, options?: ToastOptions) {
        return sonnerToast.warning(message, {
            duration: options?.duration || 3500,
            description: options?.description,
            action: options?.action,
            cancel: options?.cancel,
        });
    }

    /**
     * Muestra un toast informativo
     * @param message - Mensaje principal
     * @param options - Opciones adicionales
     */
    info(message: string, options?: ToastOptions) {
        return sonnerToast.info(message, {
            duration: options?.duration || 3000,
            description: options?.description,
            action: options?.action,
            cancel: options?.cancel,
        });
    }

    /**
     * Muestra un toast de carga
     * @param message - Mensaje principal
     */
    loading(message: string) {
        return sonnerToast.loading(message);
    }

    /**
     * Muestra un toast personalizado
     * @param message - Mensaje principal
     * @param options - Opciones adicionales
     */
    custom(message: string, options?: ToastOptions) {
        return sonnerToast(message, {
            duration: options?.duration || 3000,
            description: options?.description,
            action: options?.action,
            cancel: options?.cancel,
        });
    }

    /**
     * Muestra un toast de promesa (útil para operaciones async)
     * @param promise - Promesa a ejecutar
     * @param messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string);
        }
    ) {
        return sonnerToast.promise(promise, messages);
    }

    /**
     * Cierra un toast específico por ID
     * @param toastId - ID del toast a cerrar
     */
    dismiss(toastId?: string | number) {
        sonnerToast.dismiss(toastId);
    }

    /**
     * Cierra todos los toasts
     */
    dismissAll() {
        sonnerToast.dismiss();
    }
}

// Exportar instancia singleton
export const toast = new ToastService();