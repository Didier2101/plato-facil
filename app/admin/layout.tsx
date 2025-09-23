"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaShoppingCart, FaStore, FaBoxOpen, FaUtensils } from "react-icons/fa";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { useUserStore } from "@/src/store/useUserStore";
import { formatearNombrePropio } from "@/src/utils/texto";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { nombre, email } = useUserStore();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    const links = [
        { href: "/admin/productos", label: "Productos", icon: FaBoxOpen },
        { href: "/admin/caja", label: "Caja", icon: FaShoppingCart },
        { href: "/admin/tienda", label: "Tienda", icon: FaStore },
        { href: "/admin/ordenes", label: "Órdenes", icon: FaUtensils },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Navegación inferior móvil */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl z-50 border-t border-gray-200">
                    <div className="flex justify-around items-center py-3">
                        {links.map(({ href, label, icon: Icon }) => {
                            const active = pathname?.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${active
                                            ? "bg-orange-500 text-white shadow-lg"
                                            : "text-gray-500 hover:text-orange-500 hover:bg-gray-100"
                                        }`}
                                >
                                    <Icon className="text-lg mb-1" />
                                    <span className="text-xs font-medium">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sidebar Desktop */}
            {!isMobile && (
                <aside className="w-72 bg-white shadow-lg flex flex-col border-r border-gray-200">
                    {/* Header */}
                    <div className="p-6 bg-orange-500 text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaStore className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">PlatoFácil</h1>
                                <p className="text-orange-100 text-sm">Panel Administrativo</p>
                            </div>
                        </div>
                    </div>

                    {/* Info usuario */}
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
                                    {email && (
                                        <p className="text-gray-500 text-sm">{email}</p>
                                    )}
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

                    {/* Navegación */}
                    <nav className="flex-1 p-6 space-y-2">
                        {links.map(({ href, label, icon: Icon }) => {
                            const active = pathname?.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center p-4 rounded-xl transition-all ${active
                                            ? "bg-orange-500 text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 ${active
                                            ? "bg-white/20"
                                            : "bg-orange-500 text-white"
                                        }`}>
                                        <Icon className="text-sm" />
                                    </div>
                                    <span className="font-medium">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-6 border-t border-gray-200">
                        <LogoutButton isExpanded={true} />
                    </div>
                </aside>
            )}

            {/* Header móvil */}
            {isMobile && (
                <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white shadow-lg z-40">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <FaStore className="text-white text-lg" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">PlatoFácil</h1>
                                <p className="text-xs text-orange-100">Panel Admin</p>
                            </div>
                        </div>

                        {nombre && (
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {formatearNombrePropio(nombre).charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <main className={`flex-1 ${isMobile ? 'pt-16 pb-16' : ''}`}>
                <div className="w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}