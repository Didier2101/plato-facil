"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === 'object' && e !== null && 'message' in e) {
        const maybe = (e as { message?: unknown }).message;
        return typeof maybe === 'string' ? maybe : String(maybe);
    }
    return String(e);
}

interface OrdenDomicilio {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: 'lista' | 'en_camino' | 'entregada';
    created_at: string;
    updated_at: string;
    productos: {
        nombre: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }[];
    notas_domiciliario?: string;
}

interface ActualizarEstadoParams {
    ordenId: string;
    nuevoEstado: 'en_camino' | 'entregada';
    usuarioId: string;
    notas?: string;
}

export async function obtenerOrdenesDomicilioAction() {
    try {
        // Intento 1: incluir 'en_camino' (si el enum en DB ya lo tiene)
        let { data: ordenes, error } = await supabaseAdmin
            .from("ordenes")
            .select(`
                id,
                cliente_nombre,
                cliente_telefono,
                cliente_direccion,
                total,
                estado,
                created_at,
                updated_at,
                orden_detalles(
                    producto_nombre,
                    cantidad,
                    precio_unitario,
                    subtotal
                )
            `)
            .eq('tipo_orden', 'domicilio')
            .in('estado', ['lista', 'en_camino'])
            .order('created_at', { ascending: true }); // Más antiguas primero

        // Si falla por enum inválido (DB aún no tiene 'en_camino'), reintentar solo con 'lista'
        if (error) {
            const message = error?.message ?? String(error);
            const maybeEnumIssue = message.toLowerCase().includes('invalid input value for enum') || message.toLowerCase().includes('enum');
            if (maybeEnumIssue) {
                console.warn("'en_camino' no existe en el enum de la DB aún. Reintentando solo con 'lista'.");
                const retry = await supabaseAdmin
                    .from("ordenes")
                    .select(`
                        id,
                        cliente_nombre,
                        cliente_telefono,
                        cliente_direccion,
                        total,
                        estado,
                        created_at,
                        updated_at,
                        orden_detalles(
                            producto_nombre,
                            cantidad,
                            precio_unitario,
                            subtotal
                        )
                    `)
                    .eq('tipo_orden', 'domicilio')
                    .eq('estado', 'lista')
                    .order('created_at', { ascending: true });

                ordenes = retry.data;
                error = retry.error;
            }
        }

        if (error) {
            console.error("Error obteniendo órdenes:", error);
            return {
                success: false,
                error: `Error al cargar las órdenes: ${error?.message ?? String(error)}`
            };
        }

        const ordenesProcessed: OrdenDomicilio[] = ordenes?.map(orden => ({
            id: orden.id,
            cliente_nombre: orden.cliente_nombre,
            cliente_telefono: orden.cliente_telefono,
            cliente_direccion: orden.cliente_direccion,
            total: Number(orden.total),
            estado: orden.estado,
            created_at: orden.created_at,
            updated_at: orden.updated_at,
            productos: orden.orden_detalles?.map(detalle => ({
                nombre: detalle.producto_nombre,
                cantidad: detalle.cantidad,
                precio_unitario: Number(detalle.precio_unitario),
                subtotal: Number(detalle.subtotal)
            })) || []
        })) || [];

        return {
            success: true,
            ordenes: ordenesProcessed
        };

    } catch (error: unknown) {
        console.error("Error en obtenerOrdenesDomicilioAction:", error);
        return {
            success: false,
            error: `Error inesperado al cargar las órdenes: ${getErrorMessage(error)}`
        };
    }
}

export async function actualizarEstadoOrdenAction(params: ActualizarEstadoParams) {
    try {
        const { ordenId, nuevoEstado, usuarioId, notas } = params;

        if (!ordenId || !nuevoEstado || !usuarioId) {
            return {
                success: false,
                error: "Faltan parámetros requeridos"
            };
        }

        // Obtener estado actual
        const { data: ordenActual, error: errorBuscar } = await supabaseAdmin
            .from("ordenes")
            .select("estado, tipo_orden")
            .eq("id", ordenId)
            .single();

        if (errorBuscar || !ordenActual) {
            return {
                success: false,
                error: "No se encontró la orden"
            };
        }

        // Validar transiciones de estado
        const transicionesValidas: Record<'lista' | 'en_camino', string[]> = {
            'lista': ['en_camino'],
            'en_camino': ['entregada']
        };

        const estadoActual = ordenActual.estado as 'lista' | 'en_camino';

        if (!transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
            return {
                success: false,
                error: `No se puede cambiar de ${ordenActual.estado} a ${nuevoEstado}`
            };
        }

        if (ordenActual.tipo_orden !== 'domicilio') {
            return {
                success: false,
                error: "Esta orden no es de tipo domicilio"
            };
        }

        // Preparar datos de actualización
        interface UpdateData {
            estado: 'en_camino' | 'entregada';
            updated_at: string;
            fecha_en_camino?: string;
            usuario_entregador_id?: string;
            notas_domiciliario?: string;
        }

        const updateData: UpdateData = {
            estado: nuevoEstado,
            updated_at: new Date().toISOString()
        };

        // Agregar campos específicos según el estado
        if (nuevoEstado === 'en_camino') {
            updateData.fecha_en_camino = new Date().toISOString();
            updateData.usuario_entregador_id = usuarioId;
        }

        if (notas) {
            updateData.notas_domiciliario = notas;
        }

        // Actualizar la orden
        const { error: errorActualizar } = await supabaseAdmin
            .from("ordenes")
            .update(updateData)
            .eq("id", ordenId);

        if (errorActualizar) {
            console.error("Error actualizando orden:", errorActualizar);
            return {
                success: false,
                error: "Error al actualizar la orden"
            };
        }

        // Registrar en historial
        await supabaseAdmin
            .from("orden_historial")
            .insert({
                orden_id: ordenId,
                estado_anterior: ordenActual.estado,
                estado_nuevo: nuevoEstado,
                usuario_id: usuarioId,
                notas: notas || `Estado cambiado a ${nuevoEstado} por domiciliario`
            });

        return {
            success: true,
            message: `Orden actualizada a ${nuevoEstado}`
        };

    } catch (error) {
        console.error("Error en actualizarEstadoOrdenAction:", error);
        return {
            success: false,
            error: "Error inesperado al actualizar la orden"
        };
    }
}

export async function obtenerHistorialEntregasAction(usuarioId: string, fechaInicio?: string, fechaFin?: string) {
    try {
        let query = supabaseAdmin
            .from("ordenes")
            .select(`
                id,
                cliente_nombre,
                cliente_direccion,
                total,
                estado,
                created_at,
                updated_at,
                fecha_en_camino
            `)
            .eq('usuario_entregador_id', usuarioId)
            .eq('tipo_orden', 'domicilio')
            .in('estado', ['en_camino', 'entregada'])
            .order('created_at', { ascending: false });

        if (fechaInicio) {
            query = query.gte('created_at', fechaInicio);
        }

        if (fechaFin) {
            query = query.lte('created_at', fechaFin);
        }

        const { data: ordenes, error } = await query;

        if (error) {
            console.error("Error obteniendo historial:", error);
            return {
                success: false,
                error: "Error al cargar el historial"
            };
        }

        return {
            success: true,
            ordenes: ordenes || []
        };

    } catch (error) {
        console.error("Error en obtenerHistorialEntregasAction:", error);
        return {
            success: false,
            error: "Error inesperado al cargar el historial"
        };
    }
}