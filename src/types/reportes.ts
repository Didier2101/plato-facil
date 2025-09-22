// types/reportes.ts

export interface FiltroReporte {
    fechaInicio: string;
    fechaFin: string;
    usuarioId?: string;
    estado?: string;
}

export interface Usuario {
    id: string;
    nombre: string;
    rol: string;
    email?: string;
}

export interface VentaUsuarioMap {
    nombre: string;
    rol: string;
    totalVentas: number;
    pedidos: number;
}

export interface ProductoMap {
    cantidad: number;
    ingresos: number;
    categoria: string;
}

export interface VentaCategoriaMap {
    cantidad: number;
    ingresos: number;
}

export interface VentaHoraMap {
    ventas: number;
    pedidos: number;
}

export interface VentaMetodoPagoMap {
    cantidad: number;
    monto: number;
}

export interface ReporteUsuario {
    id: string;
    nombre: string;
    rol: string;
    totalVentas: number;
    pedidos: number;
    promedioVenta: number;
}

export interface ReporteProducto {
    nombre: string;
    cantidad: number;
    ingresos: number;
    categoria?: string;
}

export interface OrdenDetallada {
    id: string;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_direccion: string;
    total: number;
    estado: string;
    tipo_orden: string;
    vendedor: string;
    entregador?: string;
    cajero?: string; // NUEVA PROPIEDAD
    created_at: string;
    fecha_entrega?: string;
    metodo_pago: string;
    propina?: number;
}

export interface ReporteDatos {
    // Totales generales
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    promedioVenta: number;

    // Análisis por usuario
    ventasPorUsuario: ReporteUsuario[];

    // Productos
    masVendidos: ReporteProducto[];
    menosVendidos: ReporteProducto[];
    ventasPorCategoria: ReporteProducto[];

    // Análisis temporal
    ventasPorHora: { hora: number; ventas: number; pedidos: number }[];

    // Órdenes detalladas
    ordenesDetalladas: OrdenDetallada[];

    // Métodos de pago
    ventasPorMetodoPago: { metodo: string; cantidad: number; monto: number }[];

    // Estados de órdenes
    estadisticasEstados: { estado: string; cantidad: number; porcentaje: number }[];

    // Tipos de orden - NUEVA PROPIEDAD
    ventasPorTipoOrden: { tipo: string; cantidad: number; monto: number }[];
}

export interface ReporteResponse {
    success: boolean;
    datos?: ReporteDatos;
    error?: string;
    details?: string;
}