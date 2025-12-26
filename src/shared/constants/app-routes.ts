// ============================================
// CONSTANTS: src/shared/constants/app-routes.ts
// ============================================

import type { Rol } from '../types/rol';
import type { InfoRuta } from '../types/ruta';

// Rutas PÚBLICAS (acceso sin autenticación)
export const PUBLIC_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    ESTABLECIMIENTO: '/establecimiento',
    DOMICILIO: {
        BASE: '/a-domicilios',
        PEDIDOS: '/a-domicilios/domicilios',
        INFORMACION: '/a-domicilios/informacion',
        MIS_ORDENES: '/a-domicilios/mis-ordenes',
    },
    UNAUTHORIZED: '/unauthorized',
} as const;

export const UserRole = {
    ADMIN: 'admin',
    DUENO: 'dueno',
    REPARTIDOR: 'repartidor',
} as const;


// Rutas PRIVADAS (requieren autenticación)
export const PRIVATE_ROUTES = {
    ADMIN: {
        BASE: '/administrativo',
        CAJA: '/administrativo/caja',
        ORDENES: '/administrativo/ordenes',
        PRODUCTOS: '/administrativo/productos',
        PRODUCTOS_NUEVO: '/administrativo/productos/nuevo',
        TIENDA: '/administrativo/tienda',
    },
    DUENO: {
        REPORTES: '/administrativo/reportes',
        CONFIGURACIONES: '/administrativo/configuraciones',
        USUARIOS: '/administrativo/usuarios',
    },
    REPARTIDOR: {
        ORDENES_LISTAS: '/administrativo/ordenes-listas',
        MIS_ENTREGAS: '/administrativo/mis-entregas',
    },
} as const;

// Mapeo de roles a rutas de dashboard (página inicial)
export const ROLE_DASHBOARDS: Record<Rol, string> = {
    admin: PRIVATE_ROUTES.ADMIN.CAJA,
    dueno: PRIVATE_ROUTES.DUENO.REPORTES,
    repartidor: PRIVATE_ROUTES.REPARTIDOR.ORDENES_LISTAS,
};

// Rutas accesibles por rol
export const RUTAS_POR_ROL: Record<Rol, string[]> = {
    dueno: [
        PRIVATE_ROUTES.DUENO.REPORTES,
        PRIVATE_ROUTES.DUENO.CONFIGURACIONES,
        PRIVATE_ROUTES.DUENO.USUARIOS,
        PRIVATE_ROUTES.ADMIN.CAJA,
        PRIVATE_ROUTES.ADMIN.ORDENES,
        PRIVATE_ROUTES.ADMIN.PRODUCTOS,
        PRIVATE_ROUTES.ADMIN.TIENDA,
    ],
    admin: [
        PRIVATE_ROUTES.ADMIN.CAJA,
        PRIVATE_ROUTES.ADMIN.ORDENES,
        PRIVATE_ROUTES.ADMIN.PRODUCTOS,
        PRIVATE_ROUTES.ADMIN.TIENDA,
    ],
    repartidor: [
        PRIVATE_ROUTES.REPARTIDOR.ORDENES_LISTAS,
        PRIVATE_ROUTES.REPARTIDOR.MIS_ENTREGAS,
    ],
};

// Información detallada de rutas (útil para menús y navegación)
export const INFO_RUTAS_ADMIN: InfoRuta[] = [
    {
        path: PRIVATE_ROUTES.ADMIN.CAJA,
        label: 'Caja',
        descripcion: 'Gestión de cobros y pagos',
        icon: 'cash-register',
        requiereAuth: true,
        rolesPermitidos: ['dueno', 'admin'],
    },
    {
        path: PRIVATE_ROUTES.ADMIN.ORDENES,
        label: 'Órdenes',
        descripcion: 'Gestión de órdenes',
        icon: 'clipboard-list',
        requiereAuth: true,
        rolesPermitidos: ['dueno', 'admin'],
    },
    {
        path: PRIVATE_ROUTES.ADMIN.PRODUCTOS,
        label: 'Productos',
        descripcion: 'Gestión de productos',
        icon: 'package',
        requiereAuth: true,
        rolesPermitidos: ['dueno', 'admin'],
    },
    {
        path: PRIVATE_ROUTES.ADMIN.TIENDA,
        label: 'Tienda',
        descripcion: 'Vista de tienda',
        icon: 'store',
        requiereAuth: true,
        rolesPermitidos: ['dueno', 'admin'],
    },
];

export const INFO_RUTAS_DUENO: InfoRuta[] = [
    {
        path: PRIVATE_ROUTES.DUENO.REPORTES,
        label: 'Reportes',
        descripcion: 'Reportes y análisis',
        icon: 'chart-bar',
        requiereAuth: true,
        rolesPermitidos: ['dueno'],
    },
    {
        path: PRIVATE_ROUTES.DUENO.CONFIGURACIONES,
        label: 'Configuraciones',
        descripcion: 'Configuración del restaurante',
        icon: 'settings',
        requiereAuth: true,
        rolesPermitidos: ['dueno'],
    },
    {
        path: PRIVATE_ROUTES.DUENO.USUARIOS,
        label: 'Usuarios',
        descripcion: 'Gestión de usuarios',
        icon: 'users',
        requiereAuth: true,
        rolesPermitidos: ['dueno'],
    },
];

export const INFO_RUTAS_REPARTIDOR: InfoRuta[] = [
    {
        path: PRIVATE_ROUTES.REPARTIDOR.ORDENES_LISTAS,
        label: 'Órdenes Listas',
        descripcion: 'Órdenes disponibles para entregar',
        icon: 'package-check',
        requiereAuth: true,
        rolesPermitidos: ['repartidor'],
    },
    {
        path: PRIVATE_ROUTES.REPARTIDOR.MIS_ENTREGAS,
        label: 'Mis Entregas',
        descripcion: 'Entregas asignadas',
        icon: 'bike',
        requiereAuth: true,
        rolesPermitidos: ['repartidor'],
    },
];

/**
 * Helper para obtener dashboard por rol
 */
export const getDashboardByRole = (role: Rol | undefined): string => {
    return role ? ROLE_DASHBOARDS[role] : PUBLIC_ROUTES.HOME;
};

/**
 * Validar si un rol puede acceder a una ruta
 */
export const puedeAccederRuta = (rol: Rol, ruta: string): boolean => {
    return RUTAS_POR_ROL[rol]?.some(rutaPermitida =>
        ruta === rutaPermitida || ruta.startsWith(`${rutaPermitida}/`)
    ) || false;
};

/**
 * Obtener rutas de menú según el rol
 */
export const obtenerRutasMenu = (rol: Rol): InfoRuta[] => {
    switch (rol) {
        case 'dueno':
            return [...INFO_RUTAS_DUENO, ...INFO_RUTAS_ADMIN];
        case 'admin':
            return INFO_RUTAS_ADMIN;
        case 'repartidor':
            return INFO_RUTAS_REPARTIDOR;
        default:
            return [];
    }
};

/**
 * Validar si una ruta es pública
 */
export const esRutaPublica = (ruta: string): boolean => {
    const rutasPublicas = [
        PUBLIC_ROUTES.HOME,
        PUBLIC_ROUTES.LOGIN,
        PUBLIC_ROUTES.ESTABLECIMIENTO,
        PUBLIC_ROUTES.DOMICILIO.BASE,
        PUBLIC_ROUTES.DOMICILIO.PEDIDOS,
        PUBLIC_ROUTES.DOMICILIO.INFORMACION,
        PUBLIC_ROUTES.DOMICILIO.MIS_ORDENES,
        PUBLIC_ROUTES.UNAUTHORIZED,
    ];

    return rutasPublicas.some(rutaPublica => ruta.startsWith(rutaPublica));
};

// Exportar todas las rutas en un objeto principal
export const APP_ROUTES = {
    PUBLIC: PUBLIC_ROUTES,
    PRIVATE: PRIVATE_ROUTES,
    ROLE_DASHBOARDS,
    getDashboardByRole,
    puedeAccederRuta,
    obtenerRutasMenu,
    esRutaPublica,
} as const;