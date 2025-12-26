// src/shared/services/toast.service.tsx
import React from 'react';
import { toast as sonnerToast } from 'sonner';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    Loader2
} from 'lucide-react';
import NotificationAppDelivery, { NotificationType } from '../components/ui/NotificationAppDelivery';

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
    private renderCustom(message: string, type: NotificationType, options?: ToastOptions) {
        return sonnerToast.custom((t) => (
            <NotificationAppDelivery
                title={message}
                description={options?.description}
                type={type}
                action={options?.action}
                onClose={() => sonnerToast.dismiss(t)}
                icon={this.getIconForType(type)}
            />
        ), {
            duration: options?.duration || (type === 'error' ? 5000 : 3500),
        });
    }

    private getIconForType(type: NotificationType) {
        const className = "h-7 w-7";
        switch (type) {
            case 'success': return <CheckCircle2 className={className} />;
            case 'error': return <AlertCircle className={className} />;
            case 'warning': return <AlertTriangle className={className} />;
            case 'info': return <Info className={className} />;
            case 'loading': return <Loader2 className={`${className} animate-spin`} />;
        }
    }

    /**
     * Muestra un toast de éxito
     */
    success(message: string, options?: ToastOptions) {
        return this.renderCustom(message, "success", options);
    }

    /**
     * Muestra un toast de error
     */
    error(message: string, options?: ToastOptions) {
        return this.renderCustom(message, "error", options);
    }

    /**
     * Muestra un toast de advertencia
     */
    warning(message: string, options?: ToastOptions) {
        return this.renderCustom(message, "warning", options);
    }

    /**
     * Muestra un toast informativo
     */
    info(message: string, options?: ToastOptions) {
        return this.renderCustom(message, "info", options);
    }

    /**
     * Muestra un toast de carga
     */
    loading(message: string) {
        return this.renderCustom(message, "loading");
    }

    /**
     * Muestra un toast personalizado (Fallback to Info)
     */
    custom(message: string, options?: ToastOptions) {
        return this.renderCustom(message, "info", options);
    }

    /**
     * Muestra un toast de promesa
     */
    promise<T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string);
        }
    ) {
        const toastId = this.loading(messages.loading);

        promise
            .then((data) => {
                const successMsg = typeof messages.success === 'function' ? messages.success(data) : messages.success;
                sonnerToast.dismiss(toastId);
                this.success(successMsg);
            })
            .catch((err) => {
                const errorMsg = typeof messages.error === 'function' ? messages.error(err) : messages.error;
                sonnerToast.dismiss(toastId);
                this.error(errorMsg);
            });

        return toastId;
    }

    /**
     * Cierra un toast específico por ID
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
