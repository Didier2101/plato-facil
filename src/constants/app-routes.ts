// src/constants/app-routes.ts

// Rutas PÚBLICAS (acceso sin autenticación)
export const PUBLIC_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    ESTABLECIMIENTO: '/establecimiento',
    DOMICILIO: {
        BASE: '/a-domicilio',
        PEDIDOS: '/a-domicilio/domicilios',
        INFORMACION: '/a-domicilio/informacion',
        MIS_ORDENES: '/a-domicilio/mis-ordenes',
    },
    UNAUTHORIZED: '/unauthorized',
} as const;

// Rutas PRIVADAS (requieren autenticación)
export const PRIVATE_ROUTES = {
    ADMIN: {
        BASE: '/admin',
        CAJA: '/admin/caja',
        ORDENES: '/admin/ordenes',
        PRODUCTOS: '/admin/productos',
        TIENDA: '/admin/tienda',
    },
    DUENO: {
        BASE: '/dueno',
        REPORTES: '/dueno/reportes',
        CONFIGURACIONES: '/dueno/configuraciones',
        USUARIOS: '/dueno/usuarios',
    },
    REPARTIDOR: {
        BASE: '/repartidor',
        ORDENES_LISTAS: '/repartidor/ordenes-listas',
        MIS_ENTREGAS: '/repartidor/mis-entregas',
    },
} as const;

// Mapeo de roles a rutas de dashboard
export const ROLE_DASHBOARDS = {
    admin: PRIVATE_ROUTES.ADMIN.CAJA,
    dueno: PRIVATE_ROUTES.DUENO.REPORTES,
    repartidor: PRIVATE_ROUTES.REPARTIDOR.ORDENES_LISTAS,
} as const;

// Helper para obtener dashboard por rol
export const getDashboardByRole = (role: keyof typeof ROLE_DASHBOARDS | undefined): string => {
    return role ? ROLE_DASHBOARDS[role] : PUBLIC_ROUTES.HOME;
};

// Exportar todas las rutas en un objeto principal
export const APP_ROUTES = {
    PUBLIC: PUBLIC_ROUTES,
    PRIVATE: PRIVATE_ROUTES,
    ROLE_DASHBOARDS,
    getDashboardByRole,
} as const;

// Type para roles válidos
export type UserRole = keyof typeof ROLE_DASHBOARDS;