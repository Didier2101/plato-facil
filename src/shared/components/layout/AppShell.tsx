"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ChevronRight,
    Search,
    Bell
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import LogoutButton from '@/src/modules/auth/components/LogoutButton';
import { formatearNombrePropio } from '@/src/shared/utils/texto';
import { obtenerLabelRol } from '@/src/shared/constants/rol';
import type { Usuario } from '@/src/shared/types/rol';

export interface NavLink {
    name: string;
    href: string;
    icon: LucideIcon;
}

interface AppShellProps {
    children: React.ReactNode;
    title: string;
    user: Usuario;
    links: NavLink[];
}

export default function AppShell({ children, title, user, links }: AppShellProps) {
    const pathname = usePathname();

    const displayName = user.nombre
        ? formatearNombrePropio(user.nombre)
        : obtenerLabelRol(user.rol);
    const userInitial = displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 sticky top-0 h-screen z-50">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                            <LayoutDashboard className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="font-black text-xl tracking-tight text-slate-900 uppercase">
                            Kavvo<span className="text-orange-500">Go</span>
                        </h1>
                    </div>

                    <nav className="space-y-2">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname?.startsWith(link.href);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                        ? 'bg-orange-500 text-white shadow-xl shadow-orange-100 scale-[1.02]'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm font-bold uppercase tracking-wider">{link.name}</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center border-2 border-orange-200">
                            <span className="text-orange-600 font-black text-lg">{userInitial}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-slate-900 truncate">{displayName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {obtenerLabelRol(user.rol)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <LogoutButton variant="sidebar" />
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 px-5 py-4 flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Kavvo<span className="text-orange-500">Go</span></h1>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{obtenerLabelRol(user.rol)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                        <Bell className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                        <span className="text-orange-600 font-black text-sm">{userInitial}</span>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative">
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
                    {/* Page Title (Desktop Only) */}
                    <div className="hidden md:flex items-center justify-between mb-12">
                        <div>
                            <p className="text-orange-500 text-xs font-black uppercase tracking-[0.4em] mb-2">Panel de Control</p>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{title}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative hidden lg:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="bg-white border border-slate-100 rounded-2xl pl-11 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 w-64 shadow-sm transition-all"
                                />
                            </div>
                            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black">AD</div>
                                    <div className="h-8 w-8 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-orange-600">KG</div>
                                </div>
                                <div className="w-px h-4 bg-slate-100"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistema Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 px-6 py-4 z-50 flex justify-around items-center rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t border-white/5">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname?.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 group transition-all duration-300 ${isActive ? 'text-orange-500' : 'text-slate-400'
                                }`}
                        >
                            <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'
                                }`} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{link.name}</span>
                        </Link>
                    );
                })}
                <div className="w-px h-6 bg-white/10 mx-2"></div>
                <LogoutButton variant="ghost" />
            </nav>
        </div>
    );
}
