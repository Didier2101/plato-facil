// ============================================
// TYPES: src/shared/types/rol.ts
// ============================================

/**
 * Roles de usuario disponibles en el sistema
 */
export type Rol = 'dueno' | 'admin' | 'repartidor';

/**
 * Información de un usuario
 */
export interface Usuario {
    id: string;
    email: string;
    nombre?: string;
    rol: Rol;
    activo: boolean;
    created_at: string;
    updated_at?: string;
    deleted_at?: string;
}