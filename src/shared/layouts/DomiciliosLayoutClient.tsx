"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    UserCircle,
    ShoppingBag,
    Menu,
    MapPin,
    Truck,
    Star,
    ClipboardList
} from "lucide-react";
import Logo from "@/src/shared/components/ui/Logo";
import { useClienteStore } from "@/src/modules/cliente/domicilios/store/clienteStore";
import ModalDatosCliente from "../../modules/cliente/domicilios/components/ModalDatosCliente";
import Loading from "../components/ui/Loading";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { motion, AnimatePresence } from "framer-motion";
import type { ConfiguracionRestaurante } from "../../modules/dueno/configuraciones/actions/configuracionRestauranteActions";
import Image from "next/image";

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

    if (mobile) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className="flex flex-col items-center justify-center flex-1 py-1"
            >
                <div className="relative">
                    <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "text-gray-400"}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {active && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"
                        />
                    )}
                </div>
                <span className={`text-[10px] mt-1 font-black uppercase tracking-widest ${active ? "text-orange-600" : "text-gray-400"}`}>
                    {label}
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`flex items-center group relative py-3 px-4 rounded-2xl transition-all duration-300
                ${active
                    ? "bg-orange-500 text-white shadow-xl shadow-orange-200 translate-x-1"
                    : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"}`}
        >
            <div className={`p-2 rounded-xl transition-colors ${active ? "bg-white/20" : "bg-gray-100 group-hover:bg-white"}`}>
                <Icon className={`h-5 w-5 ${collapsed ? "" : "mr-0"}`} />
            </div>
            {!collapsed && (
                <span className="ml-4 font-black uppercase text-xs tracking-[0.15em]">{label}</span>
            )}

            {active && !collapsed && (
                <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                />
            )}
        </Link>
    );
}

interface DomiciliosLayoutProps {
    children: React.ReactNode;
    config?: ConfiguracionRestaurante;
}

export default function DomiciliosLayout({ children, config }: DomiciliosLayoutProps) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cliente, mostrarModal, setMostrarModal } = useClienteStore();
    const mainRef = React.useRef<HTMLElement>(null);

    const links: LinkItem[] = [
        { href: APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS, label: "Menú", mobileLabel: "Menú", icon: ShoppingBag },
        { href: APP_ROUTES.PUBLIC.DOMICILIO.MIS_ORDENES, label: "Mis Órdenes", mobileLabel: "Pedidos", icon: ClipboardList },
    ];

    useEffect(() => {
        setIsHydrated(true);
        const mainElement = mainRef.current;
        const handleScroll = () => {
            if (mainElement) {
                setScrolled(mainElement.scrollTop > 20);
            }
        };

        if (mainElement) {
            mainElement.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (mainElement) {
                mainElement.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    useEffect(() => {
        if (isHydrated && !cliente) {
            setMostrarModal(true);
        }
    }, [isHydrated, cliente, setMostrarModal]);

    if (!isHydrated) {
        return <Loading texto="Preparando tu experiencia..." tamaño="grande" color="orange-500" />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
            {/* Mobile Header - Glassmorphism */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 lg:hidden px-4 py-3
                    ${scrolled
                        ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-orange-100"
                        : "bg-white border-b border-gray-100"}`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200 flex-shrink-0">
                            {config?.logo_url ? (
                                <div className="h-6 w-6 relative">
                                    <Image src={config.logo_url} alt="Logo" fill className="object-contain" />
                                </div>
                            ) : (
                                <ShoppingBag className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-black text-gray-900 tracking-tighter truncate leading-none mb-1">
                                {config?.nombre_restaurante || "Kavvo Store"}
                            </h1>
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-3 w-3 text-orange-500" />
                                <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-widest leading-none">
                                    {cliente?.direccion || "Define ubicación"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setMostrarModal(true)}
                        className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-2 rounded-xl shadow-xl hover:bg-orange-500 transition-colors"
                    >
                        <UserCircle className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Perfil</span>
                    </button>
                </div>
            </header>

            {/* Desktop Sidebar - Premium Style */}
            <aside
                className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-gray-100 transition-all duration-500 hidden lg:flex flex-col
                    ${sidebarCollapsed ? "w-24" : "w-80"}`}
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-12">
                        {!sidebarCollapsed && <Logo collapsed={false} />}
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-3 bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-2xl transition-all"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Store Card in Sidebar */}
                    {!sidebarCollapsed && (
                        <div className="bg-gray-900 rounded-[2rem] p-6 mb-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/20 transition-colors" />
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <Truck className="h-6 w-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black tracking-tight leading-none mb-1">Delivery</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Activo</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center space-x-1 text-orange-500 font-black">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span className="text-xs">4.9</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">30-45 MIN</span>
                            </div>
                        </div>
                    )}

                    <nav className="space-y-3">
                        {links.map((link) => (
                            <DomiciliosNavLink
                                key={link.href}
                                {...link}
                                active={pathname === link.href}
                                collapsed={sidebarCollapsed}
                            />
                        ))}
                    </nav>
                </div>

                {/* Profile Button Bottom Sidebar */}
                <div className="mt-auto p-8 border-t border-gray-100">
                    <button
                        onClick={() => setMostrarModal(true)}
                        className={`flex items-center p-4 rounded-2xl w-full transition-all group
                            ${sidebarCollapsed ? "justify-center bg-gray-50 hover:bg-orange-50" : "bg-gray-50 hover:bg-orange-50"}`}
                    >
                        <div className="h-10 w-10 bg-white rounded-xl shadow-md flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                            <UserCircle className={`h-6 w-6 text-gray-400 group-hover:text-white transition-colors`} />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="ml-4 text-left">
                                <p className="text-xs font-black text-gray-900 leading-none truncate w-32 uppercase">
                                    {cliente?.nombre || "Mi Perfil"}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Preferencias</p>
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                ref={mainRef}
                className={`flex-1 transition-all duration-500 pb-24 lg:pb-0 overflow-y-auto h-full scroll-smooth
                    ${sidebarCollapsed ? "lg:ml-24" : "lg:ml-80"}`}
            >
                <div className="px-4 py-20 lg:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 lg:hidden px-6 py-2 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
                <div className="flex items-center justify-around h-16">
                    {links.map((link) => (
                        <DomiciliosNavLink
                            key={link.href}
                            {...link}
                            active={pathname === link.href}
                            mobile
                        />
                    ))}
                </div>
            </nav>

            <AnimatePresence>
                {mostrarModal && (
                    <ModalDatosCliente onClose={() => setMostrarModal(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
