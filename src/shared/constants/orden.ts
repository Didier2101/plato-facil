// src/shared/constants/orden.ts

import type { TipoOrden } from '../types/orden';

/**
 * Constantes para los tipos de orden
 */
export const TIPOS_ORDEN = {
    MESA: 'mesa',
    PARA_LLEVAR: 'para_llevar',
    DOMICILIO: 'domicilio',
} as const;

/**
 * Labels amigables para mostrar en la UI
 */
export const TIPO_ORDEN_LABELS: Record<TipoOrden, string> = {
    mesa: 'Mesa',
    para_llevar: 'Para Llevar',
    domicilio: 'Domicilio',
};

/**
 * Descripciones detalladas de cada tipo de orden
 */
export const TIPO_ORDEN_DESCRIPCIONES: Record<TipoOrden, string> = {
    mesa: 'El cliente consume en el establecimiento',
    para_llevar: 'El cliente recoge su pedido en el establecimiento',
    domicilio: 'Entrega a domicilio del cliente',
};

/**
 * Iconos para cada tipo de orden (lucide-react)
 */
export const TIPO_ORDEN_ICONOS: Record<TipoOrden, string> = {
    mesa: 'utensils',
    para_llevar: 'shopping-bag',
    domicilio: 'bike',
};

/**
 * Estados permitidos según el tipo de orden
 */
export const ESTADOS_POR_TIPO: Record<TipoOrden, string[]> = {
    mesa: ['orden_tomada', 'en_preparacion', 'lista', 'entregada', 'cancelada'],
    para_llevar: ['orden_tomada', 'en_preparacion', 'lista', 'entregada', 'cancelada'],
    domicilio: [
        'orden_tomada',
        'en_preparacion',
        'lista',
        'en_camino',
        'llegue_a_destino',
        'entregada',
        'cancelada',
    ],
};

/**
 * Validar si un tipo de orden requiere dirección
 */
export const requiereDireccion = (tipo: TipoOrden): boolean => {
    return tipo === TIPOS_ORDEN.DOMICILIO;
};

/**
 * Validar si un tipo de orden requiere repartidor
 */
export const requiereRepartidor = (tipo: TipoOrden): boolean => {
    return tipo === TIPOS_ORDEN.DOMICILIO;
};

/**
 * Validar si un tipo de orden se realiza en el establecimiento
 */
export const esEnEstablecimiento = (tipo: TipoOrden): boolean => {
    return tipo === TIPOS_ORDEN.MESA || tipo === TIPOS_ORDEN.PARA_LLEVAR;
};

/**
 * Type guard para validar TipoOrden
 */
export const esTipoOrdenValido = (tipo: string): tipo is TipoOrden => {
    return ['mesa', 'para_llevar', 'domicilio'].includes(tipo);
};