"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { FiUsers, FiBarChart2, FiUser } from "react-icons/fi";

export default function DuenoLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const links = [
        { href: "/dueno/usuarios", label: "Usuarios", icon: <FiUsers className="text-xl" /> },
        { href: "/dueno/reportes", label: "Reportes", icon: <FiBarChart2 className="text-xl" /> },
        // { href: "/dueno/configuracion", label: "Configuración", icon: <FiSettings className="text-xl" /> },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar fijo */}
            <aside className="w-64 bg-white shadow-2xl flex flex-col fixed top-0 left-0 h-screen">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col items-center">
                    <FiUser className="text-yellow-600 text-4xl mb-2" />
                    <h1 className="text-2xl font-bold text-gray-800">PlatoFácil</h1>
                    <p className="text-sm text-gray-500">Panel Dueño</p>
                </div>

                {/* Nav links */}
                <nav className="flex-1 flex flex-col p-4 gap-2 overflow-auto mt-2">
                    {links.map(({ href, label, icon }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active
                                    ? "bg-yellow-100 text-yellow-700 font-semibold shadow-md"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <div className={`text-xl ${active ? "text-yellow-600" : "text-gray-500"}`}>
                                    {icon}
                                </div>
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout pegado abajo */}
                <div className="p-4 border-t border-gray-200 mt-auto">
                    <LogoutButton isExpanded={true} />
                </div>
            </aside>

            {/* Main content con margen para sidebar */}
            <main className="flex-1 p-8 ml-64 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 min-h-screen overflow-auto">
                {children}
            </main>
        </div>
    );
}
