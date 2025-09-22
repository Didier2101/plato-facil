/**
 * Utilidades para el manejo y formateo de precios en pesos colombianos (COP)
 */

/**
 * Formatea un precio en pesos colombianos con símbolo de moneda
 * @param precio - El precio numérico a formatear
 * @returns String formateado con formato de moneda colombiana (ej: "$ 25.000")
 */
export const formatearPrecioCOP = (precio: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(precio);
};

/**
 * Formatea un número con separadores de miles para inputs de edición
 * @param numero - El número a formatear
 * @returns String formateado con separadores de miles (ej: "25.000")
 */
export const formatearNumero = (numero: number): string => {
    return new Intl.NumberFormat('es-CO').format(numero);
};

/**
 * Limpia el formato de un número y devuelve solo el valor numérico
 * @param numeroFormateado - String con formato de número
 * @returns Número limpio sin formato
 */
export const limpiarNumero = (numeroFormateado: string): number => {
    const numeroLimpio = numeroFormateado.replace(/[^\d]/g, '');
    return parseInt(numeroLimpio) || 0;
};

/**
 * Formatea un precio de manera compacta para mostrar en listas
 * @param precio - El precio numérico a formatear
 * @returns String formateado de manera compacta (ej: "$ 25k" para números grandes)
 */
export const formatearPrecioCompacto = (precio: number): string => {
    if (precio >= 1000000) {
        return `$ ${(precio / 1000000).toFixed(1)}M`;
    } else if (precio >= 1000) {
        return `$ ${(precio / 1000).toFixed(0)}k`;
    } else {
        return `$ ${precio.toLocaleString('es-CO')}`;
    }
};

/**
 * Valida si un precio es válido (mayor a 0)
 * @param precio - El precio a validar
 * @returns boolean indicando si el precio es válido
 */
export const validarPrecio = (precio: number): boolean => {
    return precio > 0 && !isNaN(precio) && isFinite(precio);
};

/**
 * Convierte un string de precio formateado a número
 * @param precioString - String con precio formateado
 * @returns Número limpio o 0 si es inválido
 */
export const precioStringANumero = (precioString: string): number => {
    const numeroLimpio = precioString.replace(/[^\d.]/g, '');
    const numero = parseFloat(numeroLimpio);
    return isNaN(numero) ? 0 : numero;
};