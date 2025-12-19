// ============================================
// CONSTANTS: src/shared/constants/metodo-pago.ts
// ============================================

import type { MetodoPago } from '../types/metodo-pago';

/**
 * Constantes para métodos de pago
 */
export const METODOS_PAGO = {
    EFECTIVO: 'efectivo',
    TARJETA: 'tarjeta',
    TRANSFERENCIA: 'transferencia',
} as const;

/**
 * Labels para métodos de pago
 */
export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
};

/**
 * Descripciones de métodos de pago
 */
export const METODO_PAGO_DESCRIPCIONES: Record<MetodoPago, string> = {
    efectivo: 'Pago en efectivo al recibir',
    tarjeta: 'Pago con tarjeta débito o crédito',
    transferencia: 'Transferencia bancaria o Nequi/Daviplata',
};

/**
 * Iconos lucide-react para métodos de pago
 */
export const METODO_PAGO_ICONOS: Record<MetodoPago, string> = {
    efectivo: 'banknote',
    tarjeta: 'credit-card',
    transferencia: 'smartphone',
};

/**
 * Colores Tailwind para métodos de pago
 */
export const METODO_PAGO_COLORES: Record<MetodoPago, string> = {
    efectivo: 'bg-green-100 text-green-700 border-green-300',
    tarjeta: 'bg-blue-100 text-blue-700 border-blue-300',
    transferencia: 'bg-purple-100 text-purple-700 border-purple-300',
};

/**
 * Validar si un método de pago requiere cambio (para efectivo)
 */
export const requiereCambio = (metodoPago: MetodoPago): boolean => {
    return metodoPago === METODOS_PAGO.EFECTIVO;
};

/**
 * Validar si el método de pago es inmediato
 */
export const esPagoInmediato = (metodoPago: MetodoPago): boolean => {
    return metodoPago === METODOS_PAGO.TARJETA;
};

/**
 * Type guard para método de pago
 */
export const esMetodoPagoValido = (metodo: string): metodo is MetodoPago => {
    return ['efectivo', 'tarjeta', 'transferencia'].includes(metodo);
};