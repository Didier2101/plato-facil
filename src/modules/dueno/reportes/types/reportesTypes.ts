// src/modules/dueno/reportes/types/reportesTypes.ts
export interface FiltroReporte {
    fechaInicio: string;
    fechaFin: string;
    estado?: string;
    tipoOrden?: string;
}

export interface ReporteDatos {
    totalVentas: number;
    totalPropinas: number;
    totalPedidos: number;
    promedioTicket: number;
    totalCostosDomicilio: number;

    ventasPorTipoOrden: Array<{
        tipo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;

    ventasPorMetodoPago: Array<{
        metodo: string;
        cantidad: number;
        monto: number;
        porcentaje: number;
    }>;

    estadisticasEstados: Array<{
        estado: string;
        cantidad: number;
        porcentaje: number;
    }>;

    topProductos: Array<{
        nombre: string;
        cantidad: number;
        ingresos: number;
        precioPromedio: number;
    }>;

    ventasPorUsuario: Array<{
        id: string;
        nombre: string;
        rol: string;
        totalVentas: number;
        pedidos: number;
        promedioTicket: number;
        propinasRecibidas: number;
    }>;

    ventasPorDia: Array<{
        fecha: string;
        ventas: number;
        pedidos: number;
    }>;

    ventasPorHora: Array<{
        hora: number;
        ventas: number;
        pedidos: number;
    }>;

    domicilios: {
        total: number;
        ingresosTotales: number;
        costoPromedio: number;
        distanciaPromedio: number;
    };
}