"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaShoppingCart, FaStore, FaBoxOpen, FaUtensils, FaUser, FaBars, FaTimes } from "react-icons/fa";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { useUserStore } from "@/src/store/useUserStore";
import { formatearNombrePropio } from "@/src/utils/texto";

interface LinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

function AdminNavLink({
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
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all
          ${active
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-gray-500 hover:text-orange-500 hover:bg-gray-100"
                    }`}
            >
                <Icon className="text-lg mb-1" />
                <span className="text-xs font-medium">{label}</span>
            </Link>
        );
    }

    // Navegación desktop
    if (collapsed) {
        return (
            <Link
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all group relative
          ${active
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
            >
                <Icon className="text-lg" />

                {/* Tooltip */}
                <div className="absolute left-14 bg-gray-900 text-white px-2 py-1 rounded text-sm 
                           opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none 
                           whitespace-nowrap z-50">
                    {label}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center p-4 rounded-xl transition-all
        ${active
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
        >
            <div
                className={`p-2 rounded-lg mr-3
          ${active ? "bg-white/20" : "bg-orange-500 text-white"}
        `}
            >
                <Icon className="text-sm" />
            </div>
            <span className="font-medium">{label}</span>
        </Link>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { nombre, email } = useUserStore();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    const links: LinkItem[] = [
        { href: "/admin/productos", label: "Productos", icon: FaBoxOpen },
        { href: "/admin/caja", label: "Caja", icon: FaShoppingCart },
        { href: "/admin/tienda", label: "Tienda", icon: FaStore },
        { href: "/admin/ordenes", label: "Órdenes", icon: FaUtensils },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Navegación inferior móvil (solo visible en pantallas pequeñas) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl z-50 border-t border-gray-200 md:hidden">
                <div className="flex justify-around items-center py-3 relative">
                    {links.map((link) => (
                        <AdminNavLink
                            key={link.href}
                            {...link}
                            active={pathname?.startsWith(link.href) ?? false}
                            mobile
                        />
                    ))}

                    {/* Botón de usuario móvil */}
                    <button
                        onClick={() => setShowUserMenu((prev) => !prev)}
                        className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${showUserMenu
                            ? "bg-orange-500 text-white shadow-lg"
                            : "text-gray-500 hover:text-orange-500 hover:bg-gray-100"
                            }`}
                    >
                        <FaUser className="text-lg mb-1" />
                        <span className="text-xs font-medium">Cuenta</span>
                    </button>

                    {/* Dropdown móvil */}
                    {showUserMenu && (
                        <div className="absolute bottom-16 right-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-56 z-50">
                            <div className="mb-3">
                                {nombre ? (
                                    <>
                                        <p className="font-semibold text-gray-900">
                                            {formatearNombrePropio(nombre)}
                                        </p>
                                        {email && <p className="text-sm text-gray-500">{email}</p>}
                                    </>
                                ) : (
                                    <p className="font-semibold text-gray-900">Administrador</p>
                                )}
                            </div>
                            <LogoutButton isExpanded={true} />
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Desktop (oculto en móvil) */}
            <aside
                className={`hidden md:flex flex-col bg-white shadow-lg border-r border-gray-200 transition-all duration-300
    ${sidebarCollapsed ? 'w-20' : 'w-72'}
  fixed top-0 left-0 h-screen z-40`}
            >

                {/* Header */}
                <div className={`bg-orange-500 text-white relative ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaStore className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">PlatoFácil</h1>
                                <p className="text-orange-100 text-sm">Panel Administrativo</p>
                            </div>
                        </div>
                    ) : (
                        /* Solo el botón de menú cuando está colapsado */
                        <div className="flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="w-8 h-8 bg-white/20 hover:bg-white/30 
                                         rounded-lg flex items-center justify-center transition-colors"
                                title="Expandir menú"
                            >
                                <FaBars className="text-white text-sm" />
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
                            <FaTimes className="text-white text-sm" />
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
                                    <span className="text-white font-bold text-lg">A</span>
                                </div>
                                <p className="text-gray-900 font-semibold">Administrador</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Avatar colapsado */}
                {sidebarCollapsed && (
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center"
                            title={nombre ? formatearNombrePropio(nombre) : "Administrador"}>
                            <span className="text-white font-bold text-lg">
                                {nombre ? formatearNombrePropio(nombre).charAt(0) : "A"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navegación */}
                <nav className={`flex-1 ${sidebarCollapsed ? 'p-4 space-y-3' : 'p-6 space-y-2'}`}>
                    {links.map((link) => (
                        <AdminNavLink
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
                className={`flex-1 min-w-0 overflow-x-hidden mb-20 md:mb-0 
    ${sidebarCollapsed ? "md:ml-20" : "md:ml-72"}`}
            >


                <div className="w-full h-full min-w-0 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}