// src/modules/auth/components/LogoutButton.tsx
'use client';

import { FiLogOut } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { useLogout } from '../hooks/useLogout';

interface LogoutButtonProps {
    isExpanded?: boolean;
    className?: string;
}

export default function LogoutButton({
    isExpanded = true,
    className = ''
}: LogoutButtonProps) {
    const { logout, loading } = useLogout();

    const handleLogout = async () => {
        if (!loading) {
            await logout();
            // Redirigir al login después de cerrar sesión
        }
    };

    if (!isExpanded) {
        // Versión colapsada (solo ícono)
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className={`p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                title="Cerrar sesión"
            >
                {loading ? (
                    <FaSpinner className="animate-spin text-lg" />
                ) : (
                    <FiLogOut className="text-lg" />
                )}
            </button>
        );
    }

    // Versión expandida (ícono + texto)
    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center justify-center gap-3 w-full px-4 py-3 bg-red-50 hover:bg-red-100 
                text-red-600 hover:text-red-700 rounded-xl transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 ${className}`}
        >
            {loading ? (
                <FaSpinner className="animate-spin text-lg" />
            ) : (
                <FiLogOut className="text-lg" />
            )}
            <span className="font-medium">Cerrar sesión</span>
        </button>
    );
}