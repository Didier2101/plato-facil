// src/shared/types/orden.ts

/**
 * Tipo de orden según dónde se consume/entrega
 */
export type TipoOrden = 'mesa' | 'para_llevar' | 'domicilio';

/**
 * Información completa de una orden
 */
export interface Orden {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion?: string;
    cliente_notas?: string;
    total: number;
    estado: string;
    tipo_orden: TipoOrden;
    costo_domicilio?: number;
    distancia_km?: number;
    metodo_pago?: string;
    subtotal_productos: number;
    total_final: number;
    created_at: string;
    updated_at: string;
}

/**
 * Props comunes para componentes de orden
 */
export interface OrdenProps {
    tipoOrden: TipoOrden;
    onChange?: (tipo: TipoOrden) => void;
}