import { DatosFacturacion, TipoComprobante } from '../types/cobro';

/**
 * Utilidades de validación para el proceso de cobro
 * Garantiza que los datos sean correctos antes de procesar el cobro
 */

/**
 * Valida que los datos de facturación estén completos cuando se requiere factura
 * @param datos - Datos de facturación a validar
 * @param tipoComprobante - Tipo de comprobante seleccionado
 * @returns true si los datos son válidos, false en caso contrario
 */
export const validarDatosFacturacion = (
    datos: DatosFacturacion,
    tipoComprobante: TipoComprobante
): boolean => {
    // Si no es factura, no se requieren validaciones de datos fiscales
    if (tipoComprobante !== "factura") return true;

    // Para factura, validar campos obligatorios
    return (
        datos.numeroDocumento.trim() !== "" &&
        datos.razonSocial.trim() !== "" &&
        datos.email.trim() !== ""
    );
};

/**
 * Valida que se haya seleccionado un método de pago válido
 * @param metodoPago - Método de pago a validar
 * @returns true si el método es válido, false en caso contrario
 */
export const validarMetodoPago = (metodoPago: string): boolean => {
    return !!metodoPago && ["efectivo", "tarjeta", "transferencia"].includes(metodoPago);
};

/**
 * Validación completa del proceso de cobro
 * Verifica que todos los requisitos estén cumplidos antes de proceder
 * @param metodoPago - Método de pago seleccionado
 * @param tipoComprobante - Tipo de comprobante seleccionado
 * @param datosFacturacionCompletos - Si los datos de facturación están completos
 * @returns true si el cobro puede proceder, false en caso contrario
 */
export const validarCobroCompleto = (
    metodoPago: string,
    tipoComprobante: TipoComprobante,
    datosFacturacionCompletos: boolean
): boolean => {
    // Validar método de pago obligatorio
    if (!validarMetodoPago(metodoPago)) return false;

    // Si es factura, validar que los datos estén completos
    if (tipoComprobante === "factura" && !datosFacturacionCompletos) return false;

    return true;
};