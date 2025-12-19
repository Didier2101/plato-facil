// src/modules/dueno/usuarios/components/UsuariosStats.tsx
'use client';

import { FiUser, FiUsers } from 'react-icons/fi';
import { getRolColor, getRolLabel } from '../utils/usuarioUtils';
import type { Usuario } from '../types/usuarioTypes';

interface UsuariosStatsProps {
    usuarios: Usuario[];
}

export default function UsuariosStats({ usuarios }: UsuariosStatsProps) {
    const roles = ['admin', 'repartidor', 'dueno'] as const;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((rol) => {
                const usuariosPorRol = usuarios.filter(u => u.rol === rol);
                const activos = usuariosPorRol.filter(u => u.activo !== false).length;
                const rolColors = getRolColor(rol).split(" ");

                return (
                    <div key={rol} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{getRolLabel(rol)}</p>
                                <p className="text-2xl font-bold text-gray-800">{usuariosPorRol.length}</p>
                                <p className="text-xs text-gray-400">{activos} activos</p>
                            </div>
                            <div className={`p-3 rounded-lg ${rolColors[0]}`}>
                                <FiUser className={`text-xl ${rolColors[1]}`} />
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Total usuarios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Total Usuarios</p>
                        <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
                        <p className="text-xs text-gray-400">
                            {usuarios.filter(u => u.activo !== false).length} activos
                        </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                        <FiUsers className="text-orange-500 text-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}