// src/modules/dueno/usuarios/components/UsuariosStats.tsx
'use client';

import { Users, Shield, Bike, Star } from 'lucide-react';
import { getRolLabel } from '../utils/usuarioUtils';
import type { Usuario } from '../types/usuarioTypes';
import { motion } from 'framer-motion';

interface UsuariosStatsProps {
    usuarios: Usuario[];
}

export default function UsuariosStats({ usuarios }: UsuariosStatsProps) {
    const roles = ['admin', 'repartidor', 'dueno'] as const;

    const iconMap = {
        admin: Shield,
        repartidor: Bike,
        dueno: Star
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((rol, index) => {
                const usuariosPorRol = usuarios.filter(u => u.rol === rol);
                const activos = usuariosPorRol.filter(u => u.activo !== false).length;
                const Icon = iconMap[rol];

                return (
                    <motion.div
                        key={rol}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="premium-card premium-card-hover p-8 relative overflow-hidden group"
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Icon className="h-24 w-24 -mr-8 -mt-8" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-4">
                                <div>
                                    <p className="premium-subtitle mb-1">{getRolLabel(rol)}</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                                        {usuariosPorRol.length}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {activos} Miembros Activos
                                    </p>
                                </div>
                            </div>

                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-inner">
                                <Icon className="h-7 w-7" />
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Total usuarios */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 relative overflow-hidden group"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users className="h-24 w-24 -mr-8 -mt-8 text-orange-500 text-white" />
                </div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-4">
                        <div>
                            <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Ecosistema Total</p>
                            <p className="text-4xl font-black text-white tracking-tighter">
                                {usuarios.length}
                            </p>
                        </div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            {usuarios.filter(u => u.activo !== false).length} Sesiones Activas
                        </p>
                    </div>
                    <div className="h-16 w-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-200 animate-bounce">
                        <Users className="h-7 w-7" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}