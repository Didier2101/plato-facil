"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Store, Package, Menu, X } from "lucide-react";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { useUserStore } from "@/src/store/useUserStore";
import { formatearNombrePropio } from "@/src/utils/texto";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { nombre, email } = useUserStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si estamos en un dispositivo móvil
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
            // En móviles, el menú debe estar cerrado por defecto
            if (window.innerWidth < 768) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    const links = [
        { href: "/admin/productos", label: "Productos", icon: Package },
        { href: "/admin/caja", label: "Caja", icon: ShoppingCart },
        { href: "/admin/tienda", label: "Tienda", icon: Store },
        { href: "/admin/ordenes", label: "Ordenes", icon: Store },
    ];

    // Cerrar menú al hacer clic en un enlace (solo en móviles)
    const handleLinkClick = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
            {/* Overlay para móviles */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-green bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-screen bg-white shadow-xl z-40 w-64 flex flex-col transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                    md:translate-x-0`}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <Store className="text-yellow-600 text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">PlatoFácil</h1>
                            <p className="text-xs text-gray-500">Panel Administrador</p>
                        </div>
                    </div>
                    {/* Botón cerrar en móviles */}
                    <button
                        className="p-1 rounded-md hover:bg-gray-100 md:hidden transition"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* Información de usuario */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    {nombre ? (
                        <div>
                            <p className="text-gray-800 font-medium truncate">
                                {formatearNombrePropio(nombre)}
                            </p>
                            {email && (
                                <p className="text-gray-500 text-xs truncate mt-1">
                                    {email}
                                </p>
                            )}
                        </div>
                    ) : email ? (
                        <p className="text-gray-700 text-sm truncate">{email}</p>
                    ) : (
                        <p className="text-gray-500 text-sm">👤 Administrador</p>
                    )}
                </div>

                {/* Navegación */}
                <nav className="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
                    {links.map(({ href, label, icon: Icon }) => {
                        const active = pathname?.startsWith(href);
                        const baseClasses = "flex items-center px-4 py-3 rounded-lg transition-all duration-200";
                        const activeClasses = "bg-yellow-100 text-yellow-700 font-semibold shadow-sm";
                        const inactiveClasses = "text-gray-700 hover:bg-gray-100";

                        const content = (
                            <>
                                <Icon className={`text-lg ${active ? "text-yellow-600" : "text-gray-500"}`} />
                                <span className="ml-3">{label}</span>
                            </>
                        );


                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
                                onClick={handleLinkClick}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </nav>

                {/* Botón de cerrar sesión */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <LogoutButton isExpanded={true} />
                </div>
            </aside>

            {/* Botón para abrir sidebar - Solo se muestra cuando el menú está cerrado y en móviles */}
            {!isOpen && isMobile && (
                <button
                    className="fixed top-2 right-2 z-50 p-2 bg-white shadow-md rounded-lg md:hidden flex items-center justify-center"
                    onClick={() => setIsOpen(true)}
                >
                    <Menu size={20} className="text-gray-700" />

                </button>
            )}

            {/* Contenido principal */}
            <main className="flex-1 min-h-screen transition-all duration-300 md:ml-64">

                <div className="max-w-8xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}