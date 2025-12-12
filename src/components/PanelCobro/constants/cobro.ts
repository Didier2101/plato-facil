

/**
 * Constantes del sistema de cobro
 * Centraliza valores fijos y configuraciones para mantener consistencia
 */

import { MetodoPago, TipoComprobante } from "../types/cobro";

// Porcentajes de propina predefinidos que se muestran al usuario
export const PORCENTAJES_PROPINA = [0, 10, 15, 20] as const;

// Métodos de pago disponibles con su configuración de visualización
export const METODOS_PAGO: Array<{
    value: MetodoPago;
    label: string;
    icon: string;
}> = [
        { value: "efectivo", label: "Efectivo", icon: "💵" },
        { value: "tarjeta", label: "Tarjeta", icon: "💳" },
        { value: "transferencia", label: "Transferencia", icon: "🏦" },
    ];

// Tipos de comprobantes que se pueden generar con sus etiquetas
export const TIPOS_COMPROBANTE: Array<{
    value: TipoComprobante;
    label: string;
    icon: string;
}> = [
        { value: "ninguno", label: "Solo Pagar", icon: "💵" },
        { value: "recibo", label: "Recibo Caja", icon: "🧾" },
        { value: "factura", label: "Factura", icon: "📄" },
    ];

// Tipos de documento de identificación soportados para facturación
export const TIPOS_DOCUMENTO = [
    { value: "CC", label: "Cédula" },
    { value: "NIT", label: "NIT" },
    { value: "CE", label: "Cédula Extranjería" },
    { value: "Pasaporte", label: "Pasaporte" },
] as const;