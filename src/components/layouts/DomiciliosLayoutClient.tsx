"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes, FaHome, FaClipboardList, FaInfoCircle } from "react-icons/fa";
import Logo from "@/src/components/ui/Logo";
import { useClienteStore } from "@/src/store/clienteStore";
import ModalDatosCliente from "../cliente-domicilio/ModalDatosCliente";
import Loading from "../ui/Loading";

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
    onClick,
}: LinkItem & { active: boolean; mobile?: boolean; collapsed?: boolean; onClick?: () => void }) {
    // ... (el código de DomiciliosNavLink se mantiene igual)
    // Navegación móvil en menú hamburguesa
    if (mobile) {
        return (
            <Link
                href={href}
                onClick={onClick}
                aria-current={active ? "page" : undefined}
                className={`flex items-center py-4 px-6 transition-all duration-200 border-b border-gray-100
          ${active
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                    }`}
            >
                <div
                    className={`p-3 rounded-lg mr-4 transition-colors
          ${active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}
        `}
                >
                    <Icon className="text-lg" />
                </div>
                <span className="font-medium text-base">{label}</span>

                {active && (
                    <div className="ml-auto">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    </div>
                )}
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Obtener datos del cliente desde el store
    const { cliente } = useClienteStore();

    const links: LinkItem[] = [
        { href: "/domicilios", label: "Hacer Pedido", icon: FaHome },
        { href: "/mis-ordenes", label: "Mis Órdenes", icon: FaClipboardList },
        { href: "/informacion", label: "Información", icon: FaInfoCircle },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Cerrar menú móvil al cambiar de ruta
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // ✅ CORREGIDO: Esperar a que el store se hidrate completamente
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // ✅ CORREGIDO: Verificar cliente solo después de la hidratación
    useEffect(() => {
        if (isHydrated) {
            // Solo mostrar el modal si no hay cliente después de la hidratación
            if (!cliente) {
                setMostrarModalCliente(true);
            }
        }
    }, [isHydrated, cliente]);

    // ✅ CORREGIDO: Manejar el cierre del modal correctamente
    const handleCloseModal = () => {
        setMostrarModalCliente(false);
    };

    // Bloquear scroll cuando el menú móvil está abierto
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    // Mostrar loading mientras se hidrata
    if (!isHydrated) {
        return (
            <Loading
                texto="Cargando..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    return (
        <div className="flex min-h-screen overflow-x-hidden">
            {/* ✅ Componente de notificaciones */}


            {/* Header móvil - ALTURA FIJA */}
            <div className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-gray-200 lg:hidden">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Logo y datos del cliente */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                            <Logo collapsed={true} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {cliente?.nombre || "Cliente"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {cliente?.direccion || "Sin dirección"}
                            </p>
                        </div>
                    </div>

                    {/* Botón hamburguesa */}
                    <button
                        onClick={toggleMobileMenu}
                        className="w-10 h-10 bg-orange-500 hover:bg-orange-600 
                                 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                        aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    >
                        {mobileMenuOpen ? (
                            <FaTimes className="text-white text-lg" />
                        ) : (
                            <FaBars className="text-white text-lg" />
                        )}
                    </button>
                </div>
            </div>

            {/* Overlay del menú móvil */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[45] lg:hidden"
                    onClick={toggleMobileMenu}
                />
            )}

            {/* Menú móvil - Panel deslizable desde la derecha */}
            <div
                className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 lg:hidden
                           transform transition-transform duration-300 ease-in-out shadow-2xl
                           ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >

                {/* Navegación móvil */}
                <nav className="flex-1 overflow-y-auto">
                    {links.map((link) => (
                        <DomiciliosNavLink
                            key={link.href}
                            {...link}
                            active={pathname === link.href}
                            mobile
                            onClick={toggleMobileMenu}
                        />
                    ))}
                </nav>
            </div>

            {/* Sidebar Desktop */}
            <aside
                className={`hidden lg:flex flex-col bg-white shadow-sm border-r border-gray-200 transition-all duration-300
                           ${sidebarCollapsed ? 'w-20' : 'w-72'}
                           fixed top-0 left-0 h-screen z-40`}
            >
                {/* Header con logo */}
                <div className={`bg-white border-b border-gray-200 ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
                    {!sidebarCollapsed ? (
                        <div className="relative">
                            <Logo collapsed={false} />
                            <button
                                onClick={toggleSidebar}
                                className="absolute top-0 right-0 w-8 h-8 bg-gray-100 hover:bg-gray-200 
                                         rounded-lg flex items-center justify-center transition-colors"
                                title="Contraer menú"
                            >
                                <FaTimes className="text-gray-700 text-sm" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 
                                         rounded-lg flex items-center justify-center transition-colors"
                                title="Expandir menú"
                            >
                                <FaBars className="text-gray-700 text-lg" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Información del cliente en desktop */}
                {!sidebarCollapsed ? (
                    <div className="p-4 bg-orange-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl">👤</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {cliente?.nombre || "Cliente"}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                    {cliente?.direccion || "Sin dirección"}
                                </p>
                                {cliente?.telefono && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-gray-500">
                                            {cliente.telefono}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-orange-50 border-b border-gray-200 flex justify-center">
                        <div
                            className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center"
                            title={cliente?.nombre || "Cliente"}
                        >
                            <span className="text-white text-xl">👤</span>
                        </div>
                    </div>
                )}

                {/* Info de domicilio en desktop */}
                {!sidebarCollapsed && (
                    <div className="p-4 bg-blue-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-lg">🚚</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">Pedidos a Domicilio</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-gray-600 font-medium">30-45 min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navegación desktop */}
                <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'p-4 space-y-3' : 'p-6 space-y-2'}`}>
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

            {/* ✅ CORREGIDO: Solo mostrar modal después de la hidratación y si no hay cliente */}
            {mostrarModalCliente && (
                <ModalDatosCliente
                    onClose={handleCloseModal}
                />
            )}

            {/* Contenido principal - AJUSTADO PARA SCROLL HORIZONTAL */}
            <main
                className={`flex-1 transition-all duration-300 overflow-x-hidden
                           pt-16 lg:pt-0 min-w-0
                           ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
            >
                <div className="w-full h-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}