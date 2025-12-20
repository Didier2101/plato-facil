"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaHome,
    FaClipboardList,
    FaInfoCircle,
    FaUserCircle
} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import Logo from "@/src/shared/components/ui/Logo";
import { useClienteStore } from "@/src/modules/cliente/domicilios/store/clienteStore";
import ModalDatosCliente from "../../modules/cliente/domicilios/components/ModalDatosCliente";
import Loading from "../components/ui/Loading";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";

interface LinkItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    mobileLabel?: string;
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

    // Navegación móvil en bottom navigation
    if (mobile) {
        return (
            <Link
                href={href}
                onClick={onClick}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center flex-1 py-3 transition-all duration-200
          ${active
                        ? "text-orange-500"
                        : "text-gray-500 hover:text-orange-500"
                    }`}
            >
                <div className="relative">
                    <Icon className={`text-xl ${active ? "text-orange-500" : "text-gray-500"}`} />
                    {active && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                </div>
                <span className={`text-xs mt-1 font-medium ${active ? "text-orange-500" : "text-gray-600"}`}>
                    {label}
                </span>
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
    const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const headerRef = useRef<HTMLDivElement>(null);

    // Obtener datos del cliente desde el store
    const { cliente } = useClienteStore();

    const links: LinkItem[] = [
        { href: APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS, label: "Pedido", mobileLabel: "Pedir", icon: FaHome },
        { href: APP_ROUTES.PUBLIC.DOMICILIO.MIS_ORDENES, label: "Mis Órdenes", mobileLabel: "Órdenes", icon: FaClipboardList },
        { href: APP_ROUTES.PUBLIC.DOMICILIO.INFORMACION, label: "Información", mobileLabel: "Info", icon: FaInfoCircle },
    ];

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

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

    // Controlar visibilidad del header en scroll
    useEffect(() => {
        const controlHeader = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                // Si el scroll es menor a 50px, siempre mostrar el header
                if (currentScrollY < 10) {
                    setIsHeaderVisible(true);
                    setLastScrollY(currentScrollY);
                    return;
                }

                // Si estamos en la parte superior, mostrar el header
                if (currentScrollY === 0) {
                    setIsHeaderVisible(true);
                }
                // Si hacemos scroll hacia abajo, ocultar el header
                else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsHeaderVisible(false);
                }
                // Si hacemos scroll hacia arriba, mostrar el header
                else if (currentScrollY < lastScrollY) {
                    setIsHeaderVisible(true);
                }

                setLastScrollY(currentScrollY);
            }
        };

        // Solo aplicar este comportamiento en dispositivos móviles/tablets
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            window.addEventListener('scroll', controlHeader, { passive: true });
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', controlHeader);
            }
        };
    }, [lastScrollY]);

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
            {/* Header móvil - ALTURA FIJA con animación */}
            <div
                ref={headerRef}
                className={`fixed top-0 left-0 right-0 h-16 z-40 bg-white border-b border-gray-200 lg:hidden
                   transition-transform duration-300 ease-in-out
                   ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
            >
                <div className="flex items-center justify-between h-full px-4">
                    {/* Logo y datos del cliente */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                            <Logo collapsed={true} tamaño="pequeño" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <p className="text-sm font-semibold text-gray-900 truncate capitalize">
                                    {cliente?.nombre || "Bienvenido"}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 truncate uppercase">
                                {cliente?.direccion || "Ingresa tu dirección"}
                            </p>
                        </div>
                    </div>

                    {/* Botón de perfil/estado */}
                    <div className="flex items-center gap-2">
                        {cliente && (
                            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-gray-700">Listo</span>
                            </div>
                        )}
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <FaUserCircle className="text-white text-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation para móvil */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 lg:hidden z-50">
                <div className="flex items-center justify-around h-full px-2">
                    {links.map((link) => (
                        <DomiciliosNavLink
                            key={link.href}
                            {...link}
                            label={link.mobileLabel || link.label}
                            active={pathname === link.href}
                            mobile
                        />
                    ))}
                </div>
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
                            <div className="flex items-center justify-between">
                                <Logo collapsed={false} />
                                <button
                                    onClick={toggleSidebar}
                                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 
                           rounded-lg flex items-center justify-center transition-colors"
                                    title="Contraer menú"
                                >
                                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={toggleSidebar}
                                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 
                         rounded-lg flex items-center justify-center transition-colors"
                                title="Expandir menú"
                            >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Información del cliente en desktop */}
                {!sidebarCollapsed ? (
                    <div className="p-4 bg-orange-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FaUserCircle className="text-white text-2xl" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate capitalize">
                                    {cliente?.nombre || "Cliente"}
                                </p>
                                <p className="text-xs text-gray-600 truncate uppercase">
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
                            className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center capitalize"
                            title={cliente?.nombre || "Cliente"}
                        >
                            <FaUserCircle className="text-white text-2xl" />
                        </div>
                    </div>
                )}

                {/* Info de domicilio en desktop */}
                {!sidebarCollapsed && (
                    <div className="p-4 bg-blue-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MdDeliveryDining className="text-white text-lg" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900">Pedidos a Domicilio</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
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
                   pt-16 pb-16 lg:pt-0 lg:pb-0 min-w-0
                   ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}
            >
                <div className="w-full h-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}