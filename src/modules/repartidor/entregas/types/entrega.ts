import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";

export interface EntregaRepartidor extends OrdenCompleta {
    // Add any repartidor-specific fields if needed, 
    // though OrdenCompleta seems quite thorough.
}

export interface EstadisticasRepartidor {
    total_domicilios: number;
    total_ganancias_domicilio: number;
    promedio_ganancia_por_domicilio: number;
    distancia_total_km: number;
    domicilios_este_mes: number;
    domicilios_esta_semana: number;
    domicilios_por_estado: Record<string, number>;
    domicilios_por_metodo_pago: Record<string, number>;
}

export interface DetalleEntregaResult {
    success: boolean;
    datos?: {
        domicilios: EntregaRepartidor[];
        estadisticas: EstadisticasRepartidor;
    };
    error?: string;
    details?: string;
}
