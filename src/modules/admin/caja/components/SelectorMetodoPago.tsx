import React from 'react';
import { MetodoPago } from '../types/cobro';
import { METODOS_PAGO } from '../constants/cobro';



/**
 * Componente para seleccionar el método de pago
 * Muestra opciones de efectivo, tarjeta y transferencia
 */

interface Props {
    metodoPago: MetodoPago | "";
    onMetodoPagoChange: (metodo: MetodoPago) => void;
}

export const SelectorMetodoPago: React.FC<Props> = ({
    metodoPago,
    onMetodoPagoChange,
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de pago *
            </label>

            <div className="grid grid-cols-3 gap-3">
                {METODOS_PAGO.map((metodo) => (
                    <button
                        key={metodo.value}
                        type="button"
                        onClick={() => onMetodoPagoChange(metodo.value)}
                        className={`
                            flex flex-col items-center justify-center gap-1.5 
                            py-3 px-2 
                            border-2 
                            rounded-xl // Diseño: Bordes redondeados de tarjeta
                            text-xs font-medium 
                            transition-all 
                            ${metodoPago === metodo.value
                                // ESTADO ACTIVO: Usamos el NARANJA como color de énfasis
                                ? `bg-orange-500 text-white border-orange-500`
                                // ESTADO INACTIVO: Diseño limpio de tarjeta (Blanco, borde gris sutil y hover)
                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-800"
                            }
                        `}
                    >
                        {/* El color del icono cambia según el estado para mantener el diseño limpio */}
                        <span className={`text-xl ${metodoPago !== metodo.value ? "text-gray-700" : "text-white"}`}>
                            {metodo.icon}
                        </span>
                        <span>{metodo.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};