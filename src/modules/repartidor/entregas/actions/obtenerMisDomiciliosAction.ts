"use server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Interfaces para los datos
interface MiDomicilio {
    id: string;
    cliente_nombre: string;
    cliente_direccion: string;
    cliente_telefono: string | null;
    total: number;
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    estado: string;
    metodo_pago: string | null;
    created_at: string;
    fecha_entrega: string | null;
    notas_cliente: string | null;
}

interface MisEstadisticas {
    total_domicilios: number;
    total_ganancias_domicilio: number;
    promedio_ganancia_por_domicilio: number;
    distancia_total_km: number;
    domicilios_este_mes: number;
    domicilios_esta_semana: number;
    domicilios_por_estado: Record<string, number>;
    domicilios_por_metodo_pago: Record<string, number>;
}

interface MiDomicilioDB {
    id: string;
    cliente_nombre: string;
    cliente_telefono: string | null;
    cliente_direccion: string | null;
    cliente_notas: string | null;
    total: string | number;
    estado: string;
    metodo_pago: string | null;
    created_at: string;
    fecha_entrega: string | null;
    costo_domicilio: string | number;
    distancia_km: string | number | null;
    duracion_estimada: number | null;
}

// Helper para convertir valores a número
const toNumber = (value: string | number | null): number => {
    if (value === null) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
};

export async function obtenerMisDomiciliosAction(usuarioId: string) {
    try {
        if (!usuarioId?.trim()) {
            return {
                success: false,
                error: "Se requiere identificación del repartidor"
            };
        }

        // Obtener todos los domicilios asignados a este repartidor
        const { data: ordenes, error } = await supabaseAdmin
            .from("ordenes")
            .select(`
        id,
        cliente_nombre,
        cliente_telefono,
        cliente_direccion,
        cliente_notas,
        total,
        estado,
        metodo_pago,
        created_at,
        fecha_entrega,
        costo_domicilio,
        distancia_km,
        duracion_estimada
      `)
            .eq("tipo_orden", "domicilio")
            .eq("usuario_entregador_id", usuarioId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error obteniendo domicilios:", error);
            return {
                success: false,
                error: `Error al obtener tus domicilios: ${error.message}`
            };
        }

        if (!ordenes || ordenes.length === 0) {
            return {
                success: true,
                datos: {
                    domicilios: [],
                    estadisticas: {
                        total_domicilios: 0,
                        total_ganancias_domicilio: 0,
                        promedio_ganancia_por_domicilio: 0,
                        distancia_total_km: 0,
                        domicilios_este_mes: 0,
                        domicilios_esta_semana: 0,
                        domicilios_por_estado: {},
                        domicilios_por_metodo_pago: {}
                    }
                }
            };
        }

        // Procesar domicilios
        const domicilios: MiDomicilio[] = (ordenes as MiDomicilioDB[]).map(orden => ({
            id: orden.id,
            cliente_nombre: orden.cliente_nombre,
            cliente_direccion: orden.cliente_direccion || 'Dirección no especificada',
            cliente_telefono: orden.cliente_telefono,
            total: toNumber(orden.total),
            costo_domicilio: toNumber(orden.costo_domicilio),
            distancia_km: toNumber(orden.distancia_km),
            duracion_estimada: orden.duracion_estimada || 0,
            estado: orden.estado,
            metodo_pago: orden.metodo_pago,
            created_at: orden.created_at,
            fecha_entrega: orden.fecha_entrega,
            notas_cliente: orden.cliente_notas
        }));

        // Calcular estadísticas personales
        const total_domicilios = domicilios.length;
        const total_ganancias_domicilio = domicilios.reduce((sum, dom) => sum + dom.costo_domicilio, 0);
        const distancia_total_km = domicilios.reduce((sum, dom) => sum + dom.distancia_km, 0);

        // Domicilios este mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const domicilios_este_mes = domicilios.filter(dom => {
            const fechaDomicilio = new Date(dom.created_at);
            return fechaDomicilio >= inicioMes;
        }).length;

        // Domicilios esta semana
        const inicioSemana = new Date();
        inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
        inicioSemana.setHours(0, 0, 0, 0);

        const domicilios_esta_semana = domicilios.filter(dom => {
            const fechaDomicilio = new Date(dom.created_at);
            return fechaDomicilio >= inicioSemana;
        }).length;

        // Domicilios por estado
        const domicilios_por_estado = domicilios.reduce((acc, dom) => {
            acc[dom.estado] = (acc[dom.estado] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Domicilios por método de pago
        const domicilios_por_metodo_pago = domicilios.reduce((acc, dom) => {
            const metodo = dom.metodo_pago || 'no_especificado';
            acc[metodo] = (acc[metodo] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const estadisticas: MisEstadisticas = {
            total_domicilios,
            total_ganancias_domicilio,
            promedio_ganancia_por_domicilio: total_domicilios > 0 ? total_ganancias_domicilio / total_domicilios : 0,
            distancia_total_km,
            domicilios_este_mes,
            domicilios_esta_semana,
            domicilios_por_estado,
            domicilios_por_metodo_pago
        };

        return {
            success: true,
            datos: {
                domicilios,
                estadisticas
            }
        };

    } catch (error) {
        console.error("Error inesperado obteniendo domicilios:", error);
        return {
            success: false,
            error: "Error interno del servidor al obtener tus domicilios",
            details: error instanceof Error ? error.message : String(error)
        };
    }
}