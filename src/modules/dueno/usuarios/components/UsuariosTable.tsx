// src/modules/dueno/usuarios/components/UsuariosTable.tsx
'use client';

import { User, Mail, Edit3, Shield, Star, Bike, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { getRolLabel } from '../utils/usuarioUtils';
import type { Usuario } from '../types/usuarioTypes';
import { motion } from 'framer-motion';

interface UsuariosTableProps {
    usuarios: Usuario[];
    onToggleActivo: (usuario: Usuario) => void;
    onEdit: (usuario: Usuario) => void;
    saving?: boolean;
}

export default function UsuariosTable({
    usuarios,
    onToggleActivo,
    onEdit,
    saving = false
}: UsuariosTableProps) {
    const iconMap = {
        admin: Shield,
        repartidor: Bike,
        dueno: Star
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4 px-4">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        <th className="pb-6 pt-2 px-6 text-left">Miembro</th>
                        <th className="pb-6 pt-2 px-6 text-left">Contacto</th>
                        <th className="pb-6 pt-2 px-6 text-left">Rol de Seguridad</th>
                        <th className="pb-6 pt-2 px-6 text-center">Estado</th>
                        <th className="pb-6 pt-2 px-6 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="space-y-4">
                    {usuarios.map((usuario, index) => {
                        const Icon = iconMap[usuario.rol as keyof typeof iconMap] || User;
                        const isInactive = usuario.activo === false;

                        return (
                            <motion.tr
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={usuario.id}
                                className={`group bg-white transition-all duration-300 ${isInactive ? 'opacity-50 grayscale' : 'hover:bg-slate-50'
                                    }`}
                            >
                                {/* Miembro */}
                                <td className="py-5 px-6 rounded-l-[2rem] border-y-2 border-l-2 border-slate-50 group-hover:border-orange-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${isInactive ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white'
                                            }`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{usuario.nombre}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: {usuario.id.toString().slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contacto */}
                                <td className="py-5 px-6 border-y-2 border-slate-50 group-hover:border-orange-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-orange-500/50" />
                                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">{usuario.email}</span>
                                    </div>
                                </td>

                                {/* Rol */}
                                <td className="py-5 px-6 border-y-2 border-slate-50 group-hover:border-orange-100 transition-colors text-left">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[9px] font-black uppercase tracking-widest ${isInactive ? 'border-slate-100 text-slate-400' : 'border-orange-100 text-orange-600 bg-orange-50/30'
                                        }`}>
                                        <ShieldCheck className="h-3 w-3" />
                                        {getRolLabel(usuario.rol)}
                                    </div>
                                </td>

                                {/* Estado */}
                                <td className="py-5 px-6 border-y-2 border-slate-50 group-hover:border-orange-100 transition-colors text-center">
                                    <button
                                        onClick={() => onToggleActivo(usuario)}
                                        disabled={saving}
                                        className="relative focus:outline-none transition-all active:scale-95 group/toggle"
                                    >
                                        {isInactive ? (
                                            <ToggleLeft className="h-8 w-8 text-slate-200 group-hover/toggle:text-slate-300 transition-colors" />
                                        ) : (
                                            <ToggleRight className="h-8 w-8 text-orange-500 group-hover/toggle:text-orange-600 transition-colors" />
                                        )}
                                    </button>
                                </td>

                                {/* Acciones */}
                                <td className="py-5 px-6 rounded-r-[2rem] border-y-2 border-r-2 border-slate-50 group-hover:border-orange-100 transition-colors text-right">
                                    <button
                                        onClick={() => onEdit(usuario)}
                                        className="h-10 w-10 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-50 group/edit shadow-inner"
                                        disabled={saving}
                                    >
                                        <Edit3 className="h-5 w-5 group-hover/edit:scale-110 transition-transform" />
                                    </button>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>

            {usuarios.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto ring-[10px] ring-slate-50/50">
                        <User className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay miembros para mostrar</p>
                </div>
            )}
        </div>
    );
}