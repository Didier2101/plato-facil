// src/types/cliente.ts

export interface ClienteDomicilio {
    id: string;
    cliente_identificador: string; // UUID único para la cookie
    nombre: string;
    telefono: string;
    direccion: string;
    latitud?: number | null;
    longitud?: number | null;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface ClienteFormData {
    nombre: string;
    telefono: string;
    direccion: string;
}

export interface ClienteRegistroResponse {
    success: boolean;
    cliente?: ClienteDomicilio;
    error?: string;
    esNuevo?: boolean;
}

export interface BuscarClienteResponse {
    success: boolean;
    cliente?: ClienteDomicilio;
    error?: string;
    encontrado: boolean;
}

export interface ActualizarClienteResponse {
    success: boolean;
    cliente?: ClienteDomicilio;
    error?: string;
}