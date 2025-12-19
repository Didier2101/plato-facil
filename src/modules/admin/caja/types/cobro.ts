/**
 * Tipos y interfaces independientes para el sistema de cobro
 * No dependen de types/orden para mantener separación de responsabilidades
 */

// Tipos específicos del módulo de cobro
export type MetodoPago = "efectivo" | "tarjeta" | "transferencia";
export type TipoDocumento = "NIT" | "CC" | "CE" | "Pasaporte";
export type TipoComprobante = "factura" | "recibo" | "ninguno";

// Estados específicos para el proceso de cobro
export type EstadoOrdenCobro = 'orden_tomada' | 'lista' | 'en_camino' | 'llegue_a_destino' | 'entregada' | 'cancelada';
export type TipoOrdenCobro = 'mesa' | 'para_llevar' | 'domicilio';

/**
 * Interfaz mínima requerida para el proceso de cobro
 * Solo incluye los campos necesarios, sin depender de OrdenCompleta
 */
export interface OrdenParaCobro {
    id: string;
    estado: EstadoOrdenCobro;
    tipo_orden: TipoOrdenCobro;
    cliente_nombre: string;
    cliente_telefono?: string | null;
    subtotal_productos?: number | null;
    costo_domicilio?: number | null;
    total: number;
    total_final?: number | null;
    // Solo los campos necesarios para cobro
}

/**
 * Datos requeridos para facturación electrónica
 * Se solicitan cuando el cliente requiere factura
 */
export interface DatosFacturacion {
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    razonSocial: string;
    email: string;
    telefono: string;
    direccion: string;
}

/**
 * Props principales del componente PanelCobro
 * Incluye callbacks para comunicación con componente padre
 */
export interface PropsPanelCobro {
    ordenSeleccionada: OrdenParaCobro; // Usar el tipo independiente
    usuarioId: string | null;
    metodoPago: MetodoPago | "";
    setMetodoPago: (metodo: MetodoPago | "") => void;
    propina: number;
    setPropina: (propina: number) => void;
    propinaPorcentaje: number | null;
    setPropinaPorcentaje: (porcentaje: number | null) => void;
    onSuccess: () => void;
    onRecargarOrdenes: () => void;
    onClose?: () => void;
}

/**
 * Retorno del hook usePropinaLogic
 * Contiene estado y funciones para manejar propinas
 */
export interface UsePropinaLogic {
    propina: number;
    propinaPorcentaje: number | null;
    propinaInput: string;
    setPropina: (propina: number) => void;
    setPropinaPorcentaje: (porcentaje: number | null) => void;
    aplicarPropina: (opcion: number) => void;
    handlePorcentajePropina: (p: number) => void;
    handlePropinaInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    aplicarPropinaDesdeInput: () => void;
}

/**
 * Retorno del hook useFacturacionLogic
 * Maneja el estado de facturación y comprobantes
 */
export interface UseFacturacionLogic {
    tipoComprobante: TipoComprobante;
    datosFacturacion: DatosFacturacion;
    setTipoComprobante: (tipo: TipoComprobante) => void;
    setDatosFacturacion: (datos: DatosFacturacion) => void;
    datosFacturacionCompletos: boolean;
}

/**
 * Retorno del hook useCobroProcess
 * Controla el proceso de cobro y estados de carga
 */
export interface UseCobroProcess {
    procesando: boolean;
    confirmarCobro: () => Promise<void>;
}

/**
 * Resultados de cálculos financieros
 * Utilizado para mostrar resumen de precios al usuario
 */
export interface CalculosTotales {
    subtotalProductos: number;
    costoDomicilio: number;
    totalOrden: number;
    totalConPropina: number;
}