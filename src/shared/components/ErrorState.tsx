// src/shared/components/ErrorState.tsx
'use client';

import { ReactNode } from 'react';

interface ErrorStateProps {
    title?: string;
    message: string;
    error?: Error | string | null;
    retryText?: string;
    onRetry?: () => void;
    children?: ReactNode;
    className?: string;
}

export default function ErrorState({
    title = "Error",
    message,
    error,
    retryText = "Reintentar",
    onRetry,
    children,
    className = ""
}: ErrorStateProps) {
    const errorMessage = error instanceof Error ? error.message : error || message;

    return (
        <div className={`min-h-screen flex items-center justify-center ${className}`}>
            <div className="text-center max-w-md mx-auto p-6">
                <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-red-600 mb-3">{title}</h2>

                <p className="text-gray-600 mb-4">{errorMessage}</p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        {retryText}
                    </button>
                )}

                {children}
            </div>
        </div>
    );
}

// Variante para uso en contextos específicos
interface ModuleErrorStateProps extends Omit<ErrorStateProps, 'title'> {
    moduleName?: string;
}

export function ModuleErrorState({
    moduleName = "el módulo",
    ...props
}: ModuleErrorStateProps) {
    return (
        <ErrorState
            title={`Error en ${moduleName}`}
            retryText="Reintentar carga"
            {...props}
        />
    );
}