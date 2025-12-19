// src/modules/dueno/usuarios/components/UsuariosTable.tsx
'use client';

import { FiUser, FiMail, FiEdit2 } from 'react-icons/fi';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { getRolColor, getRolLabel } from '../utils/usuarioUtils';
import type { Usuario } from '../types/usuarioTypes';

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
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Lista de Usuarios
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="p-4 text-gray-700 font-semibold text-left">Usuario</th>
                            <th className="p-4 text-gray-700 font-semibold text-left">Email</th>
                            <th className="p-4 text-gray-700 font-semibold text-left">Rol</th>
                            <th className="p-4 text-gray-700 font-semibold text-center">Estado</th>
                            <th className="p-4 text-gray-700 font-semibold text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className={`transition-colors ${usuario.activo !== false ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'}`}
                            >
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <FiUser className="text-orange-500 text-lg" />
                                        </div>
                                        <span className="text-gray-800 font-medium">{usuario.nombre}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <FiMail className="text-gray-400" size={16} />
                                        <span className="text-gray-600">{usuario.email}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.rol)}`}
                                    >
                                        {getRolLabel(usuario.rol)}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => onToggleActivo(usuario)}
                                        disabled={saving}
                                        className="focus:outline-none transition-transform hover:scale-105"
                                        title={usuario.activo !== false ? 'Desactivar usuario' : 'Activar usuario'}
                                    >
                                        {usuario.activo !== false ? (
                                            <FaToggleOn className="text-3xl text-orange-500" />
                                        ) : (
                                            <FaToggleOff className="text-3xl text-gray-400" />
                                        )}
                                    </button>
                                    <div className={`text-sm font-medium mt-1 ${usuario.activo !== false ? 'text-green-600' : 'text-gray-500'}`}>
                                        {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => onEdit(usuario)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-colors"
                                            title="Editar usuario"
                                            disabled={saving}
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}