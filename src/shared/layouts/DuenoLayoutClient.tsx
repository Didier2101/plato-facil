"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import LogoutButton from "@/src/modules/auth/components/LogoutButton";
import { formatearNombrePropio } from "@/src/shared/utils/texto";
import { obtenerRutasMenu } from "@/src/shared/constants/app-routes";
import { ROLES, ROL_LABELS, obtenerLabelRol } from "@/src/shared/constants/rol";
import type { Usuario } from "@/src/shared/types/rol";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface LinkItem {
    href: string;
    label: string;
    icon: string;
}

interface DuenoLayoutClientProps {
    children: React.ReactNode;
    user: Usuario;
}

// Helper type-safe para obtener iconos de lucide-react
function getLucideIcon(iconName: string): LucideIcon {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || LucideIcons.CircleHelp;
}

function DuenoNavLink({
    href,
    label,
    icon,
    active,
    mobile = false,
    collapsed = false,
}: LinkItem & { active: boolean; mobile?: boolean; collapsed?: boolean }) {
    // Obtener el icono de lucide-react dinámicamente
    const IconComponent = getLucideIcon(icon);

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
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
            </Link>
        );
    }

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
                <IconComponent className="w-5 h-5" />
                <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full transition-all duration-200
          ${active ? "opacity-100" : "opacity-0"}
        `}
                />
                <div
                    className="absolute left-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm 
                           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none 
                           whitespace-nowrap z-50"
                >
                    {label}
                </div>
            </Link>
        );
    }

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
            <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-full transition-all duration-200
          ${active ? "opacity-100" : "opacity-0"}
        `}
            />
            <div
                className={`p-2 rounded-lg mr-3 transition-colors
          ${active
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-orange-500 group-hover:text-white"
                    }
        `}
            >
                <IconComponent className="w-5 h-5" />
            </div>
            <span className="font-medium">{label}</span>
            {active && (
                <div className="ml-auto">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                </div>
            )}
        </Link>
    );
}

export default function DuenoLayoutClient({
    children,
    user,
}: DuenoLayoutClientProps) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const displayName = user.nombre
        ? formatearNombrePropio(user.nombre)
        : obtenerLabelRol(user.rol);
    const userInitial = displayName.charAt(0);

    // Obtener rutas del menú dinámicamente según el rol
    const rutasMenu = obtenerRutasMenu(user.rol);
    const links: LinkItem[] = rutasMenu.map((ruta) => ({
        href: ruta.path,
        label: ruta.label,
        icon: ruta.icon || "CircleHelp",
    }));

    // Validar que el usuario tiene el rol correcto
    if (user.rol !== ROLES.DUENO) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">
                        Acceso Denegado
                    </h2>
                    <p className="text-gray-600">
                        No tienes permisos para acceder a esta sección.
                    </p>
                </div>
            </div>
        );
    }

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-white overflow-x-hidden">
            {/* Navegación inferior móvil y tablet */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl z-50 border-t border-gray-200 lg:hidden">
                <div className="flex justify-around items-center py-3 px-4 relative">
                    {links.map((link) => (
                        <DuenoNavLink
                            key={link.href}
                            {...link}
                            active={pathname?.startsWith(link.href) ?? false}
                            mobile
                        />
                    ))}

                    <button
                        onClick={() => setShowUserMenu((prev) => !prev)}
                        className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${showUserMenu
                            ? "bg-orange-500 text-white shadow-lg"
                            : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                            }`}
                    >
                        <FaUser className="text-lg mb-1" />
                        <span className="text-xs font-medium">Cuenta</span>
                    </button>

                    {/* Dropdown móvil/tablet */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/20 z-40"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-6 w-64 z-50">
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">
                                                {userInitial}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {displayName}
                                            </p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                            <p className="text-xs text-orange-600 font-medium mt-1">
                                                {ROL_LABELS[user.rol]}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <LogoutButton isExpanded={true} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Sidebar Desktop (solo en lg+) */}
            <aside
                className={`hidden lg:flex flex-col bg-white shadow-sm border-r border-gray-200 transition-all duration-300
    ${sidebarCollapsed ? "w-20" : "w-72"}
  fixed top-0 left-0 h-screen z-40`}
            >
                {/* Header */}
                <div className={`relative ${sidebarCollapsed ? "p-4" : "p-6"}`}>
                    {!sidebarCollapsed ? (
                        <div>
                            <h1 className="text-2xl text-gray-900 font-bold">
                                {ROL_LABELS[user.rol]}
                            </h1>
                            <p className="text-gray-600 font-medium truncate text-sm mt-1">
                                Gestión del negocio
                            </p>
                        </div>
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

                {/* Info usuario expandido */}
                {!sidebarCollapsed && (
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {userInitial}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-gray-900 font-semibold truncate">
                                    {displayName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                <p className="text-xs text-orange-600 font-medium mt-1">
                                    {ROL_LABELS[user.rol]}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Avatar colapsado */}
                {sidebarCollapsed && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-center">
                        <div
                            className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center"
                            title={displayName}
                        >
                            <span className="text-white font-bold text-lg">
                                {userInitial}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navegación */}
                <nav
                    className={`flex-1 ${sidebarCollapsed ? "p-4 space-y-3" : "p-6 space-y-2"
                        }`}
                >
                    {links.map((link) => (
                        <DuenoNavLink
                            key={link.href}
                            {...link}
                            active={pathname?.startsWith(link.href) ?? false}
                            collapsed={sidebarCollapsed}
                        />
                    ))}
                </nav>

                {/* Logout */}
                <div
                    className={`border-t border-gray-200 ${sidebarCollapsed ? "p-4" : "p-6"
                        }`}
                >
                    {sidebarCollapsed ? (
                        <div className="flex justify-center">
                            <LogoutButton isExpanded={false} />
                        </div>
                    ) : (
                        <LogoutButton isExpanded={true} />
                    )}
                </div>
            </aside>

            {/* Contenido principal */}
            <main
                className={`flex-1 min-w-0 overflow-x-hidden mb-20 lg:mb-0 transition-all duration-300
    ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
            >
                <div className="w-full h-full min-w-0 overflow-x-hidden">{children}</div>
            </main>
        </div>
    );
}