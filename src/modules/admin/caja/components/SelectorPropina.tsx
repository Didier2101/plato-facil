import React from 'react';
import { UsePropinaLogic } from '../types/cobro';
import { PORCENTAJES_PROPINA } from '../constants/cobro';

interface Props {
    propinaLogic: UsePropinaLogic;
}

export const SelectorPropina: React.FC<Props> = ({ propinaLogic }) => {
    const {
        propinaPorcentaje,
        propinaInput,
        handlePorcentajePropina,
        handlePropinaInputChange,
        aplicarPropinaDesdeInput,
    } = propinaLogic;



    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Propina (opcional)
            </label>

            {/* Botones de porcentajes predefinidos con estilo Airbnb (Píldoras) */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                {PORCENTAJES_PROPINA.map((porcentaje) => (
                    <button
                        key={porcentaje}
                        type="button"
                        className={`
                            px-3 py-2 
                            rounded-full  
                            text-sm font-medium 
                            transition-all 
                            border 
                            ${propinaPorcentaje === porcentaje ||
                                (porcentaje === 0 && propinaLogic.propina === 0 && propinaPorcentaje === null)
                                ? `bg-orange-500 text-white border-orange-500 hover:bg-orange-600` // Activo: Rojo
                                : "bg-white text-gray-800 border-gray-300 hover:border-gray-800" // Inactivo: Gris sutil
                            }
                        `}
                        onClick={() => handlePorcentajePropina(porcentaje)}
                    >
                        {porcentaje === 0 ? "Sin" : `${porcentaje}%`}
                    </button>
                ))}
            </div>

            {/* Input para propina personalizada con estilo Airbnb */}
            <div className="flex gap-2">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Monto personalizado"
                    className={`
                        flex-1 
                        border border-gray-300 
                        rounded-xl 
                        py-2 px-3 
                        text-sm 
                        placeholder-gray-400
                        focus:outline-none 
                        focus:border-gray-800 // Borde oscuro al hacer foco, más discreto
                    `}
                    value={propinaInput}
                    onChange={handlePropinaInputChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            aplicarPropinaDesdeInput();
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={aplicarPropinaDesdeInput}
                    disabled={!propinaInput}
                    className={`
                        px-4 py-2 
                        rounded-xl 
                        text-sm font-semibold 
                        transition-colors 
                        ${propinaInput
                            ? `bg-orange-500 hover:bg-orange-600 text-white` // Botón activo
                            : "bg-gray-200 text-gray-400 cursor-not-allowed" // Botón inactivo
                        }
                    `}
                >
                    Agregar
                </button>
            </div>
        </div>
    );
};