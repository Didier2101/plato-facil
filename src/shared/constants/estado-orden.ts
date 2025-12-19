// ============================================
// CONSTANTS: src/shared/constants/estado-orden.ts
// ============================================

import type { EstadoOrden } from '../types/estado-orden';
import type { TipoOrden } from '../types/orden';

/**
 * Constantes para estados de orden
 */
export const ESTADOS_ORDEN = {
    ORDEN_TOMADA: 'orden_tomada',
    EN_PREPARACION: 'en_preparacion',
    LISTA: 'lista',
    EN_CAMINO: 'en_camino',
    LLEGUE_A_DESTINO: 'llegue_a_destino',
    ENTREGADA: 'entregada',
    CANCELADA: 'cancelada',
} as const;

/**
 * Labels amigables para estados
 */
export const ESTADO_ORDEN_LABELS: Record<EstadoOrden, string> = {
    orden_tomada: 'Orden Tomada',
    en_preparacion: 'En Preparación',
    lista: 'Lista',
    en_camino: 'En Camino',
    llegue_a_destino: 'Llegué a Destino',
    entregada: 'Entregada',
    cancelada: 'Cancelada',
};

/**
 * Descripciones de estados
 */
export const ESTADO_ORDEN_DESCRIPCIONES: Record<EstadoOrden, string> = {
    orden_tomada: 'La orden ha sido registrada',
    en_preparacion: 'La orden se está preparando',
    lista: 'La orden está lista para entregar',
    en_camino: 'El repartidor va en camino',
    llegue_a_destino: 'El repartidor llegó al destino',
    entregada: 'La orden fue entregada',
    cancelada: 'La orden fue cancelada',
};

/**
 * Colores Tailwind para estados
 */
export const ESTADO_ORDEN_COLORES: Record<EstadoOrden, string> = {
    orden_tomada: 'bg-gray-100 text-gray-700 border-gray-300',
    en_preparacion: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    lista: 'bg-blue-100 text-blue-700 border-blue-300',
    en_camino: 'bg-purple-100 text-purple-700 border-purple-300',
    llegue_a_destino: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    entregada: 'bg-green-100 text-green-700 border-green-300',
    cancelada: 'bg-red-100 text-red-700 border-red-300',
};

/**
 * Iconos lucide-react para estados
 */
export const ESTADO_ORDEN_ICONOS: Record<EstadoOrden, string> = {
    orden_tomada: 'clipboard-check',
    en_preparacion: 'chef-hat',
    lista: 'package-check',
    en_camino: 'truck',
    llegue_a_destino: 'map-pin-check',
    entregada: 'circle-check',
    cancelada: 'x-circle',
};

/**
 * Estados permitidos según tipo de orden
 */
export const ESTADOS_POR_TIPO_ORDEN: Record<TipoOrden, EstadoOrden[]> = {
    mesa: [
        ESTADOS_ORDEN.ORDEN_TOMADA,
        ESTADOS_ORDEN.EN_PREPARACION,
        ESTADOS_ORDEN.LISTA,
        ESTADOS_ORDEN.ENTREGADA,
        ESTADOS_ORDEN.CANCELADA,
    ],
    para_llevar: [
        ESTADOS_ORDEN.ORDEN_TOMADA,
        ESTADOS_ORDEN.EN_PREPARACION,
        ESTADOS_ORDEN.LISTA,
        ESTADOS_ORDEN.ENTREGADA,
        ESTADOS_ORDEN.CANCELADA,
    ],
    domicilio: [
        ESTADOS_ORDEN.ORDEN_TOMADA,
        ESTADOS_ORDEN.EN_PREPARACION,
        ESTADOS_ORDEN.LISTA,
        ESTADOS_ORDEN.EN_CAMINO,
        ESTADOS_ORDEN.LLEGUE_A_DESTINO,
        ESTADOS_ORDEN.ENTREGADA,
        ESTADOS_ORDEN.CANCELADA,
    ],
};

/**
 * Estados finales (no pueden cambiar después)
 */
export const ESTADOS_FINALES: EstadoOrden[] = [
    ESTADOS_ORDEN.ENTREGADA,
    ESTADOS_ORDEN.CANCELADA,
];

/**
 * Validar si un estado es final
 */
export const esEstadoFinal = (estado: EstadoOrden): boolean => {
    return ESTADOS_FINALES.includes(estado);
};

/**
 * Validar si se puede cambiar de un estado a otro
 */
export const puedeCambiarEstado = (
    estadoActual: EstadoOrden,
    estadoNuevo: EstadoOrden,
    tipoOrden: TipoOrden
): boolean => {
    // No se puede cambiar desde estados finales
    if (esEstadoFinal(estadoActual)) {
        return false;
    }

    // Verificar que el nuevo estado sea válido para el tipo de orden
    const estadosPermitidos = ESTADOS_POR_TIPO_ORDEN[tipoOrden];
    return estadosPermitidos.includes(estadoNuevo);
};

/**
 * Obtener siguientes estados posibles
 */
export const obtenerSiguientesEstados = (
    estadoActual: EstadoOrden,
    tipoOrden: TipoOrden
): EstadoOrden[] => {
    if (esEstadoFinal(estadoActual)) {
        return [];
    }

    const estadosDelTipo = ESTADOS_POR_TIPO_ORDEN[tipoOrden];
    const indiceActual = estadosDelTipo.indexOf(estadoActual);

    if (indiceActual === -1) {
        return [];
    }

    // Siempre se puede cancelar (excepto si ya está cancelada o entregada)
    const siguientes = estadosDelTipo.slice(indiceActual + 1);

    if (!esEstadoFinal(estadoActual) && estadoActual !== ESTADOS_ORDEN.CANCELADA) {
        return [...siguientes, ESTADOS_ORDEN.CANCELADA];
    }

    return siguientes;
};
