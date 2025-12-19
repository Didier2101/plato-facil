// src/actions/actualizarEstadoOrdenAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { OrdenCompleta } from "../types/orden";

interface ActualizarEstadoParams {
    ordenId: string;
    nuevoEstado: OrdenCompleta['estado'];
    usuarioId?: string;
    notas?: string;
}

// Versión actualizada que acepta parámetros adicionales
export async function actualizarEstadoOrdenAction(
    params: ActualizarEstadoParams
): Promise<{ success: boolean; error?: string; message?: string }>;

// Versión legacy que solo acepta ordenId y nuevoEstado (para mantener compatibilidad)
export async function actualizarEstadoOrdenAction(
    ordenId: string,
    nuevoEstado: OrdenCompleta['estado']
): Promise<{ success: boolean; error?: string; message?: string }>;

// Implementación de la función
export async function actualizarEstadoOrdenAction(
    paramsOrOrdenId: ActualizarEstadoParams | string,
    nuevoEstado?: OrdenCompleta['estado']
) {
    try {
        let ordenId: string;
        let estado: OrdenCompleta['estado'];
        let usuarioId: string | undefined;
        let notas: string | undefined;

        // Determinar si se usó la versión nueva (objeto) o legacy (parámetros separados)
        if (typeof paramsOrOrdenId === 'string') {
            // Versión legacy
            ordenId = paramsOrOrdenId;
            estado = nuevoEstado!;
        } else {
            // Versión nueva con objeto
            ({ ordenId, nuevoEstado: estado, usuarioId, notas } = paramsOrOrdenId);
        }

        console.log(`🔄 Actualizando orden ${ordenId} a estado ${estado}`);

        // Obtener información actual de la orden para validaciones
        const { data: ordenActual, error: errorBuscar } = await supabaseAdmin
            .from("ordenes")
            .select("estado, tipo_orden, cliente_nombre")
            .eq("id", ordenId)
            .single();

        if (errorBuscar || !ordenActual) {
            console.error("❌ No se encontró la orden:", errorBuscar);
            return {
                success: false,
                error: "No se encontró la orden"
            };
        }

        // Preparar los datos de actualización
        const updateData = {
            estado: estado as OrdenCompleta['estado'],
            updated_at: new Date().toISOString()
        };

        // Actualizar la orden
        const { error } = await supabaseAdmin
            .from("ordenes")
            .update(updateData)
            .eq("id", ordenId);

        if (error) {
            console.error("❌ Error actualizando orden:", error);
            return {
                success: false,
                error: `Error al actualizar orden: ${error.message}`
            };
        }

        // Intentar registrar en historial si existe la tabla y se proporcionó usuarioId
        if (usuarioId) {
            try {
                await supabaseAdmin
                    .from("orden_historial")
                    .insert({
                        orden_id: ordenId,
                        estado_anterior: ordenActual.estado,
                        estado_nuevo: estado,
                        usuario_id: usuarioId,
                        notas: notas || `Estado cambiado a ${estado}`
                    });
            } catch (errorHistorial) {
                console.warn("⚠️ No se pudo registrar en historial:", errorHistorial);
            }
        }

        console.log(`✅ Orden ${ordenId} actualizada exitosamente a ${estado}`);

        return {
            success: true,
            message: `Orden ${ordenActual.cliente_nombre ? `de ${ordenActual.cliente_nombre} ` : ''}actualizada a ${estado}`
        };

    } catch (error: unknown) {
        console.error("💥 Error inesperado:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error interno del servidor"
        };
    }
}