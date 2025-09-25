"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUsers, FiBarChart2, FiUser, FiSettings, FiMenu, FiX } from "react-icons/fi";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { useUserStore } from "@/src/store/useUserStore";
import { formatearNombrePropio } from "@/src/utils/texto";
import Logo from "@/src/components/ui/Logo";


interface LinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

function DuenoNavLink({
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
                className={`flex flex-col items-center py-3 px-3 rounded-xl transition-all
          ${active
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
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
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group relative
          ${active
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
            >
                <Icon className="text-xl" />

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
            className={`flex items-center p-4 rounded-xl transition-all
        ${active
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
        >
            <div
                className={`p-3 rounded-lg mr-4
          ${active ? "bg-white/20" : "bg-orange-500 text-white"}
        `}
            >
                <Icon className="text-lg" />
            </div>
            <span className="font-semibold">{label}</span>
        </Link>
    );
}

export default function DuenoLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { nombre, email } = useUserStore();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const links: LinkItem[] = [
        { href: "/dueno/usuarios", label: "Usuarios", icon: FiUsers },
        { href: "/dueno/reportes", label: "Reportes", icon: FiBarChart2 },
        { href: "/dueno/configuraciones", label: "Configuración", icon: FiSettings },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Navegación inferior móvil */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl z-50 border-t border-gray-200 md:hidden">
                <div className="flex justify-around items-center py-3 relative">
                    {links.map((link) => (
                        <DuenoNavLink
                            key={link.href}
                            {...link}
                            active={pathname?.startsWith(link.href) ?? false}
                            mobile
                        />
                    ))}

                    {/* Botón de usuario móvil */}
                    <button
                        onClick={() => setShowUserMenu((prev) => !prev)}
                        className={`flex flex-col items-center py-3 px-3 rounded-xl transition-all ${showUserMenu
                            ? "bg-orange-500 text-white shadow-lg"
                            : "text-gray-500 hover:text-orange-500 hover:bg-orange-50"
                            }`}
                    >
                        <FiUser className="text-lg mb-1" />
                        <span className="text-xs font-medium">Cuenta</span>
                    </button>

                    {/* Dropdown móvil */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/20 z-40"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-6 w-64 z-50">
                                <div className="mb-4">
                                    {nombre ? (
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {formatearNombrePropio(nombre).charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {formatearNombrePropio(nombre)}
                                                </p>
                                                {email && <p className="text-sm text-gray-500">{email}</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-gray-900">Dueño</p>
                                    )}
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <LogoutButton isExpanded={true} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Sidebar Desktop */}
            <aside
                className={`hidden md:flex flex-col bg-white shadow-lg border-r border-gray-200 transition-all duration-300
    ${sidebarCollapsed ? 'w-20' : 'w-72'}
  fixed top-0 left-0 h-screen z-40`}
            >
                {/* Header */}
                <div className={`bg-orange-500 text-white relative ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
                    {!sidebarCollapsed ? (
                        <Logo collapsed={false} />
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="w-8 h-8 bg-white/20 hover:bg-white/30 
                                         rounded-lg flex items-center justify-center transition-colors"
                                title="Expandir menú"
                            >
                                <FiMenu className="text-white text-sm" />
                            </button>
                        </div>
                    )}

                    {/* Botón toggle solo cuando está expandido */}
                    {!sidebarCollapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 
                                     rounded-lg flex items-center justify-center transition-colors"
                            title="Contraer menú"
                        >
                            <FiX className="text-white text-sm" />
                        </button>
                    )}
                </div>

                {/* Info usuario */}
                {!sidebarCollapsed && (
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        {nombre ? (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {formatearNombrePropio(nombre).charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-900 font-semibold">
                                        {formatearNombrePropio(nombre)}
                                    </p>
                                    {email && <p className="text-gray-500 text-sm">{email}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">D</span>
                                </div>
                                <p className="text-gray-900 font-semibold">Dueño</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Avatar colapsado */}
                {sidebarCollapsed && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center"
                            title={nombre ? formatearNombrePropio(nombre) : "Dueño"}>
                            <span className="text-white font-bold text-lg">
                                {nombre ? formatearNombrePropio(nombre).charAt(0) : "D"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navegación */}
                <nav className={`flex-1 ${sidebarCollapsed ? 'p-4 space-y-3' : 'p-6 space-y-2'}`}>
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
                <div className={`border-t border-gray-200 ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
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
                className={`flex-1 min-w-0 overflow-x-hidden mb-20 md:mb-0 transition-all duration-300
    ${sidebarCollapsed ? "md:ml-20" : "md:ml-72"}`}
            >
                <div className="w-full h-full min-w-0 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}