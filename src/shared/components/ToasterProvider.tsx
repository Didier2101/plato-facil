// src/shared/components/ToasterProvider.tsx
'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
    return (
        <Toaster
            position="top-center"
            expand={true}
            richColors={false}
            closeButton
            duration={3000}
            offset="80px"
            toastOptions={{
                classNames: {
                    // Toast base con sombra pronunciada y bordes redondeados
                    toast: 'bg-white shadow-2xl rounded-2xl border-none backdrop-blur-sm',

                    // Success con acento orange-500
                    success: 'border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white',

                    // Error con acento orange-500 (versión roja)
                    error: 'border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-white',

                    // Warning con acento orange-500
                    warning: 'border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-white',

                    // Info con acento orange-500
                    info: 'border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white',

                    // Loading con acento orange-500
                    loading: 'border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white',

                    // Título con fuente bold
                    title: 'text-gray-900 font-bold text-base',

                    // Descripción más sutil
                    description: 'text-gray-600 text-sm mt-1',

                    // Botón de acción con orange-500
                    actionButton: 'bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors',

                    // Botón de cancelar
                    cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg',

                    // Botón de cerrar con orange-500
                    closeButton: 'bg-orange-100 hover:bg-orange-200 text-orange-600 border-none rounded-full transition-all',

                    // Iconos con orange-500
                    icon: 'text-orange-500',
                },
            }}
        />
    );
}