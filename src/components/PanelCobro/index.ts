/**
 * Archivo barrel para exportar todos los componentes y utilidades del módulo de cobro
 * Facilita las importaciones desde otros módulos
 */

// Components
export { ResumenTotales } from './components/ResumenTotales';
export { SelectorComprobante } from './components/SelectorComprobante';
export { SelectorPropina } from './components/SelectorPropina';
export { SelectorMetodoPago } from './components/SelectorMetodoPago';
export { BotonConfirmarCobro } from './components/BotonConfirmarCobro';

// Hooks
export { usePropinaLogic } from './hooks/usePropinaLogic';
export { useFacturacionLogic } from './hooks/useFacturacionLogic';
export { useCobroProcess } from './hooks/useCobroProcess';

// Types - Actualizados con los tipos independientes
export type {
    MetodoPago,
    TipoDocumento,
    TipoComprobante,
    EstadoOrdenCobro as EstadoOrden,
    TipoOrdenCobro as TipoOrden,
    OrdenParaCobro as OrdenCompleta,
    DatosFacturacion,
    PropsPanelCobro,
    UsePropinaLogic,
    UseFacturacionLogic,
    UseCobroProcess,
    CalculosTotales,
} from './types/cobro';

// Constants
export {
    PORCENTAJES_PROPINA,
    METODOS_PAGO,
    TIPOS_COMPROBANTE,
    TIPOS_DOCUMENTO,
} from './constants/cobro';

// Utils
export {
    calcularTotales,
    calcularPropina,
    calcularTotalConPropina,
    formatearPrecioCOP,
} from './utils/calculosCobro';

export {
    validarDatosFacturacion,
    validarMetodoPago,
    validarCobroCompleto,
} from './utils/validacionesCobro';

// Exportación por defecto del componente principal
export { default as PanelCobro } from './PanelCobro';