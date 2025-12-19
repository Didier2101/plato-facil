// ============================================
// TYPES: src/shared/types/metodo-pago.ts
// ============================================

/**
 * Métodos de pago disponibles
 */
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

/**
 * Información de un pago
 */
export interface Pago {
    id: string;
    orden_id: string;
    usuario_id: string;
    metodo_pago: MetodoPago;
    monto: number;
    created_at: string;
}
