// ============================================
// TYPES: src/shared/types/ruta.ts
// ============================================

import type { Rol } from './rol';

/**
 * Tipo para las rutas públicas
 */
export type RutaPublica =
    '/'
    | '/login'
    | '/establecimiento'
    | '/a-domicilios'
    | '/a-domicilios/domicilios'
    | '/a-domicilios/informacion'
    | '/a-domicilios/mis-ordenes'
    | '/unauthorized';

/**
 * Tipo para las rutas privadas
 */
export type RutaPrivada =
    | '/administrativo'
    | '/administrativo/caja'
    | '/administrativo/ordenes'
    | '/administrativo/productos'
    | '/administrativo/tienda'
    | '/administrativo/reportes'
    | '/administrativo/configuraciones'
    | '/administrativo/usuarios'
    | '/administrativo/ordenes-listas'
    | '/administrativo/mis-entregas';

/**
 * Información de una ruta
 */
export interface InfoRuta {
    path: string;
    label: string;
    descripcion?: string;
    icon?: string;
    requiereAuth: boolean;
    rolesPermitidos?: Rol[];
}
