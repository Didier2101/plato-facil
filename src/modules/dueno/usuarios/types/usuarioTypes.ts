// src/modules/dueno/usuarios/types/usuarioTypes.ts
export type RolUsuario = 'admin' | 'repartidor' | 'dueno';

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: RolUsuario;
    activo?: boolean;
    created_at?: string;
}

export interface CrearUsuarioData {
    nombre: string;
    email: string;
    rol: RolUsuario;
    contraseña: string;
}

export interface EditarUsuarioData {
    nombre: string;
    email: string;
    rol: RolUsuario;
}