"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaHome, FaClipboardList, FaInfoCircle } from "react-icons/fa";
import Logo from "@/src/components/ui/Logo";
import UserWelcomeNotification from "@/src/components/cliente-domicilio/UserWelcomeNotification";

interface LinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

function DomiciliosNavLink({
    href,
    label,
    icon: Icon,
    active,
    mobile = false,
    collapsed = false,
}: LinkItem & { active: boolean; mobile?: boolean; collapsed?: boolean }) {
    // Navegación móvil (bottom bar)
    if (mobile) {
        return (
            <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200
          ${active
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                    }`}
            >
                <Icon className="text-lg mb-1" />
                <span className="text-xs font-medium">{label}</span>
            </Link>
        );
    }

    // Navegación desktop colapsada
    if (collapsed) {
        return (
            <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 group relative
          ${active
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                    }`}
            >
                <Icon className="text-lg" />

                {/* Indicador lateral para sidebar colapsado */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full transition-all duration-200
          ${active ? "opacity-100" : "opacity-0"}
        `} />

                {/* Tooltip */}
                <div className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm 
                           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none 
                           whitespace-nowrap z-50">
                    {label}
                </div>
            </Link>
        );
    }

    // Navegación desktop expandida
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center py-3 px-4 transition-all duration-200 group relative
        ${active
                    ? "text-orange-600 bg-orange-50/50"
                    : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                }`}
        >
            {/* Indicador lateral */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-full transition-all duration-200
          ${active ? "opacity-100" : "opacity-0"}
        `} />

            <div
                className={`p-2 rounded-lg mr-3 transition-colors
          ${active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-orange-500 group-hover:text-white"}
        `}
            >
                <Icon className="text-lg" />
            </div>
            <span className="font-medium">{label}</span>

            {/* Punto indicador alternativo */}
            {active && (
                <div className="ml-auto">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                </div>
            )}
        </Link>
    );
}

export default function DomiciliosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const links: LinkItem[] = [
        { href: "/domicilios", label: "Hacer Pedido", icon: FaHome },
        { href: "/mis-ordenes", label: "Mis Órdenes", icon: FaClipboardList },
        { href: "/informacion", label: "Información", icon: FaInfoCircle },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 overflow-x-hidden">
            {/* ✅ NUEVO: Componente de notificaciones */}
            <UserWelcomeNotification />

            {/* Navegación inferior móvil y tablet */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl z-50 border-t border-gray-200 lg:hidden">
                <div className="flex justify-around items-center py-3 px-4 relative">
                    {links.map((link) => (
                        <DomiciliosNavLink
                            key={link.href}
                            {...link}
                            active={pathname === link.href}
                            mobile
                        />
                    ))}
                </div>
            </div>

            {/* Sidebar Desktop (solo para lg en adelante) */}
            <aside
                className={`hidden lg:flex flex-col bg-white shadow-sm border-r border-gray-200 transition-all duration-300
    ${sidebarCollapsed ? 'w-20' : 'w-72'}
  fixed top-0 left-0 h-screen z-40`}
            >
                {/* Header */}
                <div className={`bg-white text-gray-800 relative border-b border-gray-200 ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
                    {!sidebarCollapsed ? (
                        <Logo collapsed={false} />
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 
                                         rounded-xl flex items-center justify-center transition-colors"
                                title="Expandir menú"
                            >
                                <FaBars className="text-gray-700 text-lg" />
                            </button>
                        </div>
                    )}

                    {/* Botón toggle solo cuando está expandido */}
                    {!sidebarCollapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute top-6 right-6 w-8 h-8 bg-gray-100 hover:bg-gray-200 
                                     rounded-lg flex items-center justify-center transition-colors"
                            title="Contraer menú"
                        >
                            <FaTimes className="text-gray-700 text-sm" />
                        </button>
                    )}
                </div>

                {/* Información de domicilio */}
                {!sidebarCollapsed && (
                    <div className="p-6 bg-orange-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🚚</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-semibold">Pedidos a Domicilio</p>
                                <p className="text-sm text-gray-600">Entregamos en tu ubicación</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 font-medium">30-45 min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Icono colapsado */}
                {sidebarCollapsed && (
                    <div className="p-4 bg-orange-50 border-b border-gray-200 flex justify-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center"
                            title="Pedidos a Domicilio">
                            <span className="text-white font-bold text-lg">🚚</span>
                        </div>
                    </div>
                )}

                {/* Navegación - Tabs principales */}
                <nav className={`flex-1 ${sidebarCollapsed ? 'p-4 space-y-3' : 'p-6 space-y-2'}`}>
                    {links.map((link) => (
                        <DomiciliosNavLink
                            key={link.href}
                            {...link}
                            active={pathname === link.href}
                            collapsed={sidebarCollapsed}
                        />
                    ))}
                </nav>
            </aside>

            {/* Contenido principal */}
            <main
                className={`flex-1 min-w-0 overflow-x-hidden mb-20 lg:mb-0 transition-all duration-300
    ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
            >
                <div className="w-full h-full min-w-0 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}