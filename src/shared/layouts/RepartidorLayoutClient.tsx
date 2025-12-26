"use client";

import React from "react";
import { ROLES } from "@/src/shared/constants/rol";
import type { Usuario } from "@/src/shared/types/rol";
import { obtenerRutasMenu } from "@/src/shared/constants/app-routes";
import AppShell from "../components/layout/AppShell";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface RepartidorLayoutClientProps {
    children: React.ReactNode;
    user: Usuario;
}

// Helper para mapear strings a iconos de Lucide
function getIcon(iconName: string): LucideIcon {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    const mapping: Record<string, LucideIcon> = {
        'dashboard': LucideIcons.LayoutDashboard,
        'package': LucideIcons.Package,
        'users': LucideIcons.Users,
        'settings': LucideIcons.Settings,
        'file-text': LucideIcons.FileText,
        'shopping-cart': LucideIcons.ShoppingCart,
        'credit-card': LucideIcons.CreditCard,
        'bike': LucideIcons.Bike,
        'calendar': LucideIcons.Calendar,
        'bar-chart': LucideIcons.BarChart3,
        'trending-up': LucideIcons.TrendingUp,
        'clipboard': LucideIcons.ClipboardList,
        'clock': LucideIcons.Clock,
        'map-pin': LucideIcons.MapPin,
    };

    return mapping[iconName] || icons[iconName] || LucideIcons.CircleHelp;
}

export default function RepartidorLayoutClient({
    children,
    user,
}: RepartidorLayoutClientProps) {
    // Validar que el usuario tiene el rol correcto
    if (user.rol !== ROLES.REPARTIDOR) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 max-w-md mx-4 animate-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-red-500 shadow-inner">
                        <LucideIcons.ShieldAlert className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        Acceso Denegado
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Esta sección es exclusiva para personal de reparto.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all active:scale-95 shadow-lg hover:shadow-orange-200"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const rutasMenu = obtenerRutasMenu(user.rol);
    const links = rutasMenu.map((ruta) => ({
        name: ruta.label,
        href: ruta.path,
        icon: getIcon(ruta.icon || 'CircleHelp'),
    }));

    return (
        <AppShell title="Repartidor" user={user} links={links}>
            {children}
        </AppShell>
    );
}