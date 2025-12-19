import { OrdenParaCobro, CalculosTotales } from '../types/cobro';

/**
 * Utilidades para cálculos financieros en el proceso de cobro
 * Centraliza la lógica de cálculos para mantener consistencia
 */

/**
 * Calcula todos los totales relacionados con una orden
 * @param orden - Orden para cobro con precios
 * @param propina - Monto de propina a aplicar
 * @returns Objeto con todos los cálculos financieros
 */
export const calcularTotales = (orden: OrdenParaCobro, propina: number): CalculosTotales => {
    const subtotalProductos = Number(orden.subtotal_productos || 0);
    const costoDomicilio = Number(orden.costo_domicilio || 0);
    const totalOrden = subtotalProductos + costoDomicilio;
    const totalConPropina = totalOrden + propina;

    return {
        subtotalProductos,
        costoDomicilio,
        totalOrden,
        totalConPropina
    };
};

/**
 * Calcula el monto de propina basado en un porcentaje del subtotal
 * @param subtotal - Subtotal de productos sobre el cual calcular la propina
 * @param porcentaje - Porcentaje de propina a aplicar
 * @returns Monto de propina redondeado
 */
export const calcularPropina = (subtotal: number, porcentaje: number): number => {
    return Math.round((porcentaje / 100) * subtotal);
};

/**
 * Calcula el total final sumando la propina al total de la orden
 * @param totalOrden - Total de la orden sin propina
 * @param propina - Monto de propina a agregar
 * @returns Total final a cobrar
 */
export const calcularTotalConPropina = (totalOrden: number, propina: number): number => {
    return totalOrden + propina;
};

/**
 * Formatea un valor numérico a formato de precio colombiano
 * @param valor - Valor numérico a formatear
 * @returns String formateado como precio COP (ej: $1.000)
 */
export const formatearPrecioCOP = (valor: number): string => {
    return `$${valor.toLocaleString("es-CO")}`;
};