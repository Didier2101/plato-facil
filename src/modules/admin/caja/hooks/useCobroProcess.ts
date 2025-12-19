import { useState, useCallback } from "react";
import { UseCobroProcess, OrdenParaCobro, MetodoPago } from "../types/cobro";
import { toast } from "@/src/shared/services/toast.service";

/**
 * Hook personalizado para manejar el proceso completo de cobro
 * Coordina la comunicación con el servidor y maneja estados de carga/error
 */

interface Props {
    usuarioId: string | null;
    metodoPago: MetodoPago | "";
    ordenSeleccionada: OrdenParaCobro;
    propina: number;
    onSuccess: () => void;
    onRecargarOrdenes: () => void;
}

export const useCobroProcess = ({
    usuarioId,
    metodoPago,
    ordenSeleccionada,
    propina,
    onSuccess,
    onRecargarOrdenes,
}: Props): UseCobroProcess => {
    // Estado para controlar cuando el cobro está en proceso
    const [procesando, setProcesando] = useState(false);

    /**
     * Función principal que ejecuta el proceso completo de cobro
     * Incluye validaciones, llamadas a actions y manejo de comprobantes
     */
    const confirmarCobro = useCallback(async (): Promise<void> => {
        // Validación: Usuario debe estar autenticado
        if (!usuarioId) {
            toast.error("Error", { description: "Usuario no autenticado" });
            return;
        }

        // Validación: Método de pago requerido
        if (!metodoPago) {
            toast.warning("Datos faltantes", { description: "Completa el método de pago" });
            return;
        }

        // Iniciar estado de procesamiento
        setProcesando(true);

        try {
            console.log("=== INICIANDO PROCESO DE COBRO ===");
            console.log("Orden ID:", ordenSeleccionada.id);

            // Importar dinámicamente el action de cobro
            const { cobrarOrdenAction } = await import("@/src/modules/admin/caja/actions/cobrarOrdenAction");

            // Ejecutar el action principal de cobro
            const resultado = await cobrarOrdenAction(
                ordenSeleccionada.id,
                usuarioId,
                metodoPago,
                propina
            );

            // Manejar errores del action principal
            if (!resultado.success) {
                toast.error("Error al cobrar", { description: resultado.error || "Inténtalo de nuevo" });
                return;
            }

            toast.success("¡Orden cobrada!", { description: "La orden se procesó correctamente" });

            // Ejecutar callbacks de éxito
            onSuccess();
            onRecargarOrdenes();

        } catch (error) {
            console.error("💥 ERROR CRÍTICO:", error);
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            toast.error("Error crítico", { description: errorMsg });
        } finally {
            setProcesando(false);
        }
    }, [
        usuarioId,
        metodoPago,
        ordenSeleccionada,
        propina,
        onSuccess,
        onRecargarOrdenes,
    ]);

    return {
        procesando,
        confirmarCobro,
    };
};
