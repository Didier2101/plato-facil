export interface FiltroDomicilios {
    fechaInicio: string;
    fechaFin: string;
    repartidorId?: string;
    agruparPor: 'dia' | 'mes';
}

export interface EstadisticasRepartidor {
    repartidor_id: string;
    repartidor_nombre: string;
    total_domicilios: number;
    total_ingresos_domicilios: number;
    promedio_por_domicilio: number;
    costo_total_domicilios: number;
    distancia_total_km: number;
    promedio_distancia_km: number;
}

export interface DomicilioDetalle {
    id: string;
    repartidor_id: string;
    repartidor_nombre: string;
    cliente_nombre: string;
    cliente_direccion: string;
    total: number;
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    created_at: string;
    fecha_entrega: string | null;
    estado: string;
}

export interface EstadisticasPorPeriodo {
    periodo: string;
    fecha: string;
    total_domicilios: number;
    total_ingresos: number;
    total_costos_domicilio: number;
    distancia_promedio: number;
    repartidores: EstadisticasRepartidor[];
}

export interface ReporteDomiciliosResponse {
    success: boolean;
    datos?: {
        estadisticasGenerales: {
            total_domicilios: number;
            total_ingresos: number;
            total_costos_domicilio: number;
            ingresos_netos: number;
            distancia_total_km: number;
            promedio_por_domicilio: number;
        };
        estadisticasPorPeriodo: EstadisticasPorPeriodo[];
        domiciliosDetallados: DomicilioDetalle[];
        topRepartidores: EstadisticasRepartidor[];
    };
    error?: string;
    details?: string;
}