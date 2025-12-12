import React from 'react';
import { FileText, Receipt } from 'lucide-react';
import { TipoComprobante, DatosFacturacion, TipoDocumento } from '../types/cobro';
import { TIPOS_COMPROBANTE, TIPOS_DOCUMENTO } from '../constants/cobro';

/**
 * Componente para seleccionar el tipo de comprobante y capturar datos de facturación
 * Solo se muestra para órdenes de establecimiento
 */

interface Props {
    tipoComprobante: TipoComprobante;
    datosFacturacion: DatosFacturacion;
    onTipoComprobanteChange: (tipo: TipoComprobante) => void;
    onDatosFacturacionChange: (datos: DatosFacturacion) => void;
    datosFacturacionCompletos: boolean;
}

export const SelectorComprobante: React.FC<Props> = ({
    tipoComprobante,
    datosFacturacion,
    onTipoComprobanteChange,
    onDatosFacturacionChange,
}) => {
    /**
     * Maneja cambios en los campos del formulario de facturación
     */
    const handleInputChange = (field: keyof DatosFacturacion, value: string) => {
        onDatosFacturacionChange({
            ...datosFacturacion,
            [field]: value,
        });
    };

    return (
        <div className=" space-y-4">
            {/* Header del selector: Se mantiene limpio y simple */}
            <div className="flex items-center gap-2 mb-3 ">
                <div className="bg-gray-100 p-1.5 rounded-lg">
                    <FileText size={18} className="text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">Tipo de Comprobante</h4>
            </div>

            {/* Botones de selección de tipo de comprobante con estilo Airbnb */}
            <div className="grid grid-cols-3 gap-3">
                {TIPOS_COMPROBANTE.map((tipo) => (
                    <button
                        key={tipo.value}
                        type="button"
                        onClick={() => onTipoComprobanteChange(tipo.value)}
                        className={`
                            flex flex-col items-center justify-center gap-1 
                            py-4 px-2 
                            border-2 
                            rounded-xl // Bordes redondeados
                            text-xs font-medium 
                            transition-all 
                            ${tipoComprobante === tipo.value
                                // ESTADO ACTIVO: Borde, fondo y texto con el color principal de Airbnb (rojo)
                                ? `bg-orange-500 text-white border-orange-500 shadow-none`
                                // ESTADO INACTIVO: Fondo blanco, borde gris sutil y hover que oscurece el borde
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-800"
                            }
                        `}
                    >
                        <span className={`text-2xl ${tipoComprobante !== tipo.value ? "text-gray-700" : "text-white"}`}>
                            {tipo.icon}
                        </span>
                        <span>{tipo.label}</span>
                    </button>
                ))}
            </div>

            {/* Formulario de datos fiscales (solo para facturas) */}
            {tipoComprobante === "factura" && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                    <h5 className="font-semibold text-gray-900 text-sm">
                        Datos de Facturación
                    </h5>

                    {/* Tipo y número de documento */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tipo Doc *
                            </label>
                            <select
                                value={datosFacturacion.tipoDocumento}
                                onChange={(e) =>
                                    handleInputChange('tipoDocumento', e.target.value as TipoDocumento)
                                }
                                // Estilo de Input/Select Airbnb: Borde sutil, redondeado, focus sin ring llamativo
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gray-800"
                            >
                                {TIPOS_DOCUMENTO.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Número *
                            </label>
                            <input
                                type="text"
                                placeholder="123456789"
                                value={datosFacturacion.numeroDocumento}
                                onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                                // Estilo de Input Airbnb
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gray-800"
                            />
                        </div>
                    </div>

                    {/* Razón social */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Razón Social / Nombre *
                        </label>
                        <input
                            type="text"
                            placeholder="Juan Pérez o Empresa SAS"
                            value={datosFacturacion.razonSocial}
                            onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                            // Estilo de Input Airbnb
                            className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gray-800"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={datosFacturacion.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            // Estilo de Input Airbnb
                            className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gray-800"
                        />
                    </div>

                    {/* Teléfono y dirección */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                placeholder="3001234567"
                                value={datosFacturacion.telefono}
                                onChange={(e) => handleInputChange('telefono', e.target.value)}
                                // Estilo de Input Airbnb
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gray-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                placeholder="Calle 123 #45-67"
                                value={datosFacturacion.direccion}
                                onChange={(e) => handleInputChange('direccion', e.target.value)}
                                // Estilo de Input Airbnb
                                className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-gray-800"
                            />
                        </div>
                    </div>
                </div>
            )}


            {/* Información según el tipo de comprobante seleccionado: se mantiene limpio */}
            <div className="text-xs ">
                {tipoComprobante === "ninguno" && (
                    <p className="text-gray-600 ml-2">
                        ⚡ Solo se registrará el pago. No se imprimirá ni emitirá documento.
                    </p>
                )}

                {tipoComprobante === "recibo" && (
                    <p className="text-gray-600 ml-2"> ⚡ Se imprimirá recibo térmico</p>
                )}

                {tipoComprobante === "factura" && (
                    <div className="flex items-start gap-2 text-gray-700">
                        <div className="bg-gray-100 p-1 rounded">
                            <Receipt size={14} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                Se emitirá factura electrónica vía Factus
                            </p>
                            <p className="text-gray-500 mt-0.5">
                                Se enviará al correo y podrá imprimirse opcionalmente
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};