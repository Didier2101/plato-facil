import React from 'react';
import { CreditCard } from 'lucide-react';
import { UseCobroProcess } from '../types/cobro';
import { formatearPrecioCOP } from '../utils/calculosCobro';


/**
 * Componente del botón principal para confirmar el cobro
 * Maneja estados de carga y validaciones de habilitación
 */

interface Props {
    cobroProcess: UseCobroProcess;
    totalConPropina: number;
    disabled: boolean;
}

export const BotonConfirmarCobro: React.FC<Props> = ({
    cobroProcess,
    totalConPropina,
    disabled,
}) => {
    const { procesando, confirmarCobro } = cobroProcess;

    return (
        <button
            type="button"
            onClick={confirmarCobro}
            disabled={disabled || procesando}
            className={`
                w-full  bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed  text-white   py-4 px-6  rounded-full font-bold text-lg  transition-all  flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none
            `}
        >
            {procesando ? (
                <>
                    {/* Spinner de carga - Mantiene el diseño limpio y blanco */}
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    <span>Procesando...</span>
                </>
            ) : (
                <>
                    <CreditCard size={24} />
                    <span>
                        CONFIRMAR COBRO - {formatearPrecioCOP(totalConPropina)}
                    </span>
                </>
            )}
        </button>
    );
};