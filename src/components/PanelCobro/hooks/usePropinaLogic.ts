import { useState, useCallback } from "react";
import { UsePropinaLogic } from "../types/cobro";
import { calcularPropina } from "../utils/calculosCobro";

/**
 * Hook personalizado para manejar la lógica de propinas
 * Centraliza el estado y las operaciones relacionadas con propinas
 */

interface Props {
    subtotalProductos: number;
    propina: number;
    setPropina: (propina: number) => void;
    propinaPorcentaje: number | null;
    setPropinaPorcentaje: (porcentaje: number | null) => void;
}

export const usePropinaLogic = ({
    subtotalProductos,
    propina,
    setPropina,
    propinaPorcentaje,
    setPropinaPorcentaje
}: Props): UsePropinaLogic => {
    // Estado para el input de propina personalizada
    const [propinaInput, setPropinaInput] = useState<string>("");

    /**
     * Aplica una propina basada en porcentaje predefinido
     * @param opcion - Porcentaje de propina a aplicar (ej: 10, 15, 20)
     */
    const aplicarPropina = useCallback(
        (opcion: number) => {
            // Establecer el porcentaje seleccionado
            setPropinaPorcentaje(opcion);

            // Calcular el monto de propina basado en el subtotal
            const calc = calcularPropina(subtotalProductos, opcion);
            setPropina(calc);

            // Limpiar el input de propina personalizada
            setPropinaInput("");
        },
        [subtotalProductos, setPropina, setPropinaPorcentaje]
    );

    /**
     * Maneja la selección de porcentajes de propina
     * Incluye caso especial para "Sin propina" (0%)
     * @param p - Porcentaje seleccionado
     */
    const handlePorcentajePropina = useCallback(
        (p: number) => {
            if (p === 0) {
                // Resetear toda la propina
                setPropina(0);
                setPropinaPorcentaje(null);
                setPropinaInput("");
            } else {
                // Aplicar el porcentaje seleccionado
                aplicarPropina(p);
            }
        },
        [aplicarPropina, setPropina, setPropinaPorcentaje]
    );

    /**
     * Maneja cambios en el input de propina personalizada
     * Solo permite números enteros positivos
     * @param e - Evento del input
     */
    const handlePropinaInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Validar que solo contenga números
        if (value === "" || /^\d+$/.test(value)) {
            setPropinaInput(value);
        }
    }, []);

    /**
     * Aplica una propina personalizada desde el input
     * Convierte el valor del input a número y lo establece como propina
     */
    const aplicarPropinaDesdeInput = useCallback(() => {
        // Si el input está vacío o es cero, quitar la propina
        if (!propinaInput || propinaInput === "0") {
            setPropina(0);
            setPropinaPorcentaje(null);
            return;
        }

        // Convertir el input a número y validar
        const numero = parseInt(propinaInput, 10);
        if (!isNaN(numero) && numero >= 0) {
            setPropina(numero);
            setPropinaPorcentaje(null); // Resetear porcentaje cuando se usa monto personalizado
        }

        // Limpiar el input después de aplicar
        setPropinaInput("");
    }, [propinaInput, setPropina, setPropinaPorcentaje]);

    // Retornar estado y funciones para el componente
    return {
        propina,
        propinaPorcentaje,
        propinaInput,
        setPropina,
        setPropinaPorcentaje,
        aplicarPropina,
        handlePorcentajePropina,
        handlePropinaInputChange,
        aplicarPropinaDesdeInput,
    };
};