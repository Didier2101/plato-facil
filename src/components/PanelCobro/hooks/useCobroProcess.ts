import { useState, useCallback } from "react";
import { UseCobroProcess, OrdenParaCobro, MetodoPago } from "../types/cobro";

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
            alert("Error: Usuario no autenticado");
            return;
        }

        // Validación: Método de pago requerido
        if (!metodoPago) {
            alert("Completa método de pago");
            return;
        }

        // Iniciar estado de procesamiento
        setProcesando(true);

        try {
            console.log("=== INICIANDO PROCESO DE COBRO ===");
            console.log("Orden ID:", ordenSeleccionada.id);
            console.log("Usuario ID:", usuarioId);
            console.log("Método de pago:", metodoPago);
            console.log("Propina:", propina);

            // Importar dinámicamente el action de cobro
            const { cobrarOrdenAction } = await import("@/src/actions/cobrarOrdenAction");

            console.log("📞 Llamando a cobrarOrdenAction...");

            // Ejecutar el action principal de cobro
            const resultado = await cobrarOrdenAction(
                ordenSeleccionada.id,
                usuarioId,
                metodoPago,
                propina
            );

            console.log("📥 Respuesta de cobrarOrdenAction:", resultado);

            // Manejar errores del action principal
            if (!resultado.success) {
                console.error("❌ ERROR EN COBRO:", resultado.error);
                alert(`❌ Error al cobrar:\n\n${resultado.error}\n\nRevisa la consola para más detalles.`);
                return;
            }

            console.log("✅ Cobro exitoso");
            alert("✅ Orden cobrada exitosamente");

            console.log("=== PROCESO DE COBRO COMPLETADO ===");

            // Ejecutar callbacks de éxito
            onSuccess();
            onRecargarOrdenes();

        } catch (error) {
            // Manejo de errores críticos
            console.error("💥 ERROR CRÍTICO:", error);
            console.error("Stack trace:", error instanceof Error ? error.stack : "No disponible");

            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            alert(`❌ Error crítico al procesar:\n\n${errorMsg}\n\nRevisa la consola del navegador (F12) para más detalles.`);
        } finally {
            // Siempre terminar el estado de procesamiento
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