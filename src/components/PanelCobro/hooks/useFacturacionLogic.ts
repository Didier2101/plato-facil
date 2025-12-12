import { useState, useMemo } from "react";
import { UseFacturacionLogic, TipoComprobante, DatosFacturacion } from "../types/cobro";
import { validarDatosFacturacion } from "../utils/validacionesCobro";

/**
 * Hook personalizado para manejar la lógica de facturación y comprobantes
 * Controla el estado de tipos de comprobante y datos de facturación
 */

export const useFacturacionLogic = (): UseFacturacionLogic => {
    // Estado para el tipo de comprobante seleccionado
    const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("ninguno");

    // Estado para los datos de facturación (solo requeridos para facturas)
    const [datosFacturacion, setDatosFacturacion] = useState<DatosFacturacion>({
        tipoDocumento: "CC", // Valor por defecto: Cédula de Ciudadanía
        numeroDocumento: "",
        razonSocial: "",
        email: "",
        telefono: "",
        direccion: "",
    });

    /**
     * Valida si los datos de facturación están completos
     * Solo es relevante cuando se selecciona tipo "factura"
     */
    const datosFacturacionCompletos = useMemo(() => {
        return validarDatosFacturacion(datosFacturacion, tipoComprobante);
    }, [tipoComprobante, datosFacturacion]);

    // Retornar estado y funciones para el componente
    return {
        tipoComprobante,
        datosFacturacion,
        setTipoComprobante,
        setDatosFacturacion,
        datosFacturacionCompletos,
    };
};