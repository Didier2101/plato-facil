"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface EntregaRepartidor {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: string;
    tipo_orden: string;
    metodo_pago?: string;
    created_at: string;
    updated_at: string;
}

interface EstadisticasRepartidor {
    totalEntregas: number;
    totalFacturado: number;
    promedioPorEntrega: number;
    entregasPorMetodo: Record<string, number>;
    entregasUltimaSemana: number;
    entregasPorTipo: Record<string, number>;
}

export async function obtenerEntregasRepartidorAction(usuarioId: string) {
    try {
        if (!usuarioId?.trim()) {
            return {
                success: false,
                error: "El ID del repartidor es requerido"
            };
        }

        // ✅ Obtener órdenes entregadas por este repartidor usando usuario_entregador_id
        const { data: ordenes, error } = await supabaseAdmin
            .from("ordenes")
            .select(`
                id,
                cliente_nombre,
                cliente_telefono,
                cliente_direccion,
                total,
                estado,
                tipo_orden,
                metodo_pago,
                monto_entregado,
                costo_domicilio,
                created_at,
                updated_at,
                fecha_entrega
            `)
            .eq("estado", "entregada")
            .eq("usuario_entregador_id", usuarioId)
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error obteniendo entregas:", error);
            return {
                success: false,
                error: `Error al obtener las entregas: ${error.message}`
            };
        }

        if (!ordenes || ordenes.length === 0) {
            return {
                success: true,
                entregas: [],
                estadisticas: {
                    totalEntregas: 0,
                    totalFacturado: 0,
                    promedioPorEntrega: 0,
                    entregasPorMetodo: {},
                    entregasUltimaSemana: 0,
                    entregasPorTipo: {}
                }
            };
        }

        // ✅ Procesar las órdenes para el formato esperado
        const entregasProcessed: EntregaRepartidor[] = ordenes.map(orden => ({
            id: orden.id,
            cliente_nombre: orden.cliente_nombre,
            cliente_telefono: orden.cliente_telefono,
            cliente_direccion: orden.cliente_direccion || "Dirección no especificada",
            total: Number(orden.total),
            estado: orden.estado,
            tipo_orden: orden.tipo_orden,
            metodo_pago: orden.metodo_pago,
            created_at: orden.created_at,
            updated_at: orden.updated_at
        }));

        // ✅ Calcular estadísticas
        const totalEntregas = ordenes.length;
        const totalFacturado = ordenes.reduce((sum, orden) => sum + Number(orden.total), 0);

        // Entregas por método de pago
        const entregasPorMetodo = ordenes.reduce((acc, orden) => {
            const metodo = orden.metodo_pago || 'no_especificado';
            acc[metodo] = (acc[metodo] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Entregas por tipo (establecimiento vs domicilio)
        const entregasPorTipo = ordenes.reduce((acc, orden) => {
            const tipo = orden.tipo_orden;
            acc[tipo] = (acc[tipo] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Entregas de la última semana
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        const entregasUltimaSemana = ordenes.filter(orden => {
            const fechaEntrega = new Date(orden.updated_at);
            return fechaEntrega >= hace7Dias;
        }).length;

        const estadisticas: EstadisticasRepartidor = {
            totalEntregas,
            totalFacturado,
            promedioPorEntrega: totalEntregas > 0 ? totalFacturado / totalEntregas : 0,
            entregasPorMetodo,
            entregasUltimaSemana,
            entregasPorTipo
        };

        return {
            success: true,
            entregas: entregasProcessed,
            estadisticas
        };

    } catch (error) {
        console.error("Error inesperado obteniendo entregas:", error);
        return {
            success: false,
            error: "Error interno del servidor al obtener las entregas"
        };
    }
}