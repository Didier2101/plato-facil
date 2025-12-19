// src/modules/dueno/usuarios/utils/usuarioUtils.ts
import type { RolUsuario } from '../types/usuarioTypes';

export const getRolColor = (rol: RolUsuario): string => {
    switch (rol) {
        case "admin":
            return "bg-purple-100 text-purple-800 border-purple-200";
        case "repartidor":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "dueno":
            return "bg-green-100 text-green-800 border-green-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

export const getRolLabel = (rol: RolUsuario): string => {
    switch (rol) {
        case "admin": return "Administrador";
        case "repartidor": return "Repartidor";
        case "dueno": return "Propietario";
        default: return rol;
    }
};

export const formatFecha = (fecha?: string): string => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};