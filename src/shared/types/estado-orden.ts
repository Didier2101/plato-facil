// ============================================
// TYPES: src/shared/types/estado-orden.ts
// ============================================

/**
 * Estados posibles de una orden
 */
export type EstadoOrden =
    | 'orden_tomada'
    | 'en_preparacion'
    | 'lista'
    | 'en_camino'
    | 'llegue_a_destino'
    | 'entregada'
    | 'cancelada';

/**
 * Información del historial de estados
 */
export interface EstadoHistorial {
    id: string;
    orden_id: string;
    estado_anterior?: string;
    estado_nuevo: EstadoOrden;
    usuario_id: string;
    notas?: string;
    created_at: string;
}
