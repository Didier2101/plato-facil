// ============================================
// CONSTANTS: src/shared/constants/rol.ts
// ============================================

import type { Rol } from '../types/rol';

/**
 * Constantes para roles de usuario
 */
export const ROLES = {
    DUENO: 'dueno',
    ADMIN: 'admin',
    REPARTIDOR: 'repartidor',
} as const;

/**
 * Labels para roles
 */
export const ROL_LABELS: Record<Rol, string> = {
    dueno: 'Dueño',
    admin: 'Administrador',
    repartidor: 'Repartidor',
};

/**
 * Descripciones de roles
 */
export const ROL_DESCRIPCIONES: Record<Rol, string> = {
    dueno: 'Acceso completo al sistema, configuraciones y reportes',
    admin: 'Gestión de órdenes, productos, caja y operaciones diarias',
    repartidor: 'Visualización y gestión de entregas asignadas',
};

/**
 * Iconos lucide-react para roles
 */
export const ROL_ICONOS: Record<Rol, string> = {
    dueno: 'crown',
    admin: 'shield-check',
    repartidor: 'bike',
};

/**
 * Colores Tailwind para roles
 */
export const ROL_COLORES: Record<Rol, string> = {
    dueno: 'bg-purple-100 text-purple-700 border-purple-300',
    admin: 'bg-blue-100 text-blue-700 border-blue-300',
    repartidor: 'bg-green-100 text-green-700 border-green-300',
};

/**
 * Permisos por rol
 */
export const PERMISOS_POR_ROL: Record<Rol, string[]> = {
    dueno: [
        'ver_reportes',
        'gestionar_configuraciones',
        'gestionar_usuarios',
        'ver_ordenes',
        'crear_ordenes',
        'actualizar_ordenes',
        'eliminar_ordenes',
        'gestionar_productos',
        'gestionar_categorias',
        'gestionar_ingredientes',
        'gestionar_caja',
        'cobrar_ordenes',
        'ver_domicilios',
        'asignar_repartidores',
        'emitir_facturas',
    ],
    admin: [
        'ver_ordenes',
        'crear_ordenes',
        'actualizar_ordenes',
        'gestionar_productos',
        'gestionar_categorias',
        'gestionar_ingredientes',
        'gestionar_caja',
        'cobrar_ordenes',
        'ver_domicilios',
        'asignar_repartidores',
        'emitir_facturas',
    ],
    repartidor: [
        'ver_ordenes_asignadas',
        'actualizar_estado_entrega',
        'ver_domicilios',
        'actualizar_ubicacion',
    ],
};

/**
 * Validar si un rol tiene un permiso específico
 */
export const tienePermiso = (rol: Rol, permiso: string): boolean => {
    return PERMISOS_POR_ROL[rol]?.includes(permiso) || false;
};

/**
 * Obtener nivel de jerarquía del rol (mayor número = más permisos)
 */
export const obtenerNivelRol = (rol: Rol): number => {
    const niveles: Record<Rol, number> = {
        dueno: 3,
        admin: 2,
        repartidor: 1,
    };
    return niveles[rol] || 0;
};

/**
 * Validar si un rol tiene mayor o igual jerarquía que otro
 */
export const tieneMayorJerarquia = (rolUsuario: Rol, rolComparar: Rol): boolean => {
    return obtenerNivelRol(rolUsuario) >= obtenerNivelRol(rolComparar);
};

/**
 * Obtener roles que puede gestionar un rol específico
 * El dueño puede gestionar admin y repartidor
 * El admin no puede gestionar a nadie
 * El repartidor no puede gestionar a nadie
 */
export const rolesGestionables = (rol: Rol): Rol[] => {
    const nivel = obtenerNivelRol(rol);
    return Object.values(ROLES)
        .filter((rolValue) => obtenerNivelRol(rolValue as Rol) < nivel) as Rol[];
};

/**
 * Type guard para validar rol
 */
export const esRolValido = (rol: string): rol is Rol => {
    return ['dueno', 'admin', 'repartidor'].includes(rol);
};

/**
 * Obtener label de rol
 */
export const obtenerLabelRol = (rol: Rol): string => {
    return ROL_LABELS[rol] || rol;
};

/**
 * Validar si un rol puede crear órdenes
 */
export const puedeCrearOrdenes = (rol: Rol): boolean => {
    return tienePermiso(rol, 'crear_ordenes');
};

/**
 * Validar si un rol puede ver reportes
 */
export const puedeVerReportes = (rol: Rol): boolean => {
    return tienePermiso(rol, 'ver_reportes');
};

/**
 * Validar si un rol puede gestionar usuarios
 */
export const puedeGestionarUsuarios = (rol: Rol): boolean => {
    return tienePermiso(rol, 'gestionar_usuarios');
};

/**
 * Validar si un rol puede cobrar órdenes
 */
export const puedeCobrarOrdenes = (rol: Rol): boolean => {
    return tienePermiso(rol, 'cobrar_ordenes');
};

/**
 * Validar si un rol puede asignar repartidores
 */
export const puedeAsignarRepartidores = (rol: Rol): boolean => {
    return tienePermiso(rol, 'asignar_repartidores');
};

/**
 * Validar si un rol puede emitir facturas
 */
export const puedeEmitirFacturas = (rol: Rol): boolean => {
    return tienePermiso(rol, 'emitir_facturas');
};

/**
 * Validar si un rol puede gestionar productos
 */
export const puedeGestionarProductos = (rol: Rol): boolean => {
    return tienePermiso(rol, 'gestionar_productos');
};

/**
 * Obtener todos los permisos de un rol
 */
export const obtenerPermisos = (rol: Rol): string[] => {
    return PERMISOS_POR_ROL[rol] || [];
};