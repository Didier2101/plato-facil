// src/modules/auth/components/LogoutButton.tsx
'use client';

import { LogOut, Loader2 } from 'lucide-react';
import { useLogout } from '../hooks/useLogout';

interface LogoutButtonProps {
    variant?: 'ghost' | 'expanded' | 'sidebar';
    className?: string;
}

export default function LogoutButton({
    variant = 'expanded',
    className = ''
}: LogoutButtonProps) {
    const { logout, loading } = useLogout();

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loading) {
            await logout();
        }
    };

    if (variant === 'ghost') {
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className={`p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 disabled:opacity-50 ${className}`}
                title="Cerrar sesión"
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <LogOut className="h-5 w-5" />
                )}
            </button>
        );
    }

    if (variant === 'sidebar') {
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 disabled:opacity-50 group font-bold text-xs uppercase tracking-widest ${className}`}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
                <span>Cerrar sesión</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={`flex items-center justify-center gap-3 w-full px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-[1.5rem] transition-all duration-300 disabled:opacity-50 font-black text-xs uppercase tracking-[0.2em] border border-red-100 shadow-sm hover:shadow-red-100 active:scale-95 ${className}`}
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <LogOut className="h-5 w-5" />
            )}
            <span>Cerrar sesión</span>
        </button>
    );
}
