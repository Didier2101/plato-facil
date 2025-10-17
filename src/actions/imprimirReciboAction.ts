"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Tipos para los datos de la BD
interface OrdenDetalle {
    producto_nombre: string;
    precio_unitario: number;
    cantidad: number;
    subtotal: number;
}

interface Orden {
    id: string;
    created_at: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    subtotal_productos: number;
    costo_domicilio: number;
    total: number;
    total_final?: number;
    metodo_pago?: string;
    tipo_orden: string;
    orden_detalles: OrdenDetalle[];
}

interface ReciboData {
    restaurante: {
        nombre_restaurante: string;
        telefono: string;
        direccion_completa: string;
    };
    orden: {
        numero: string;
        fecha: string;
        cliente: string;
        telefono?: string;
        items: Array<{
            producto_nombre: string;
            precio_unitario: number;
            cantidad: number;
            subtotal: number;
        }>;
        subtotal: number;
        domicilio: number;
        total: number;
        metodoPago?: string;
        tipoOrden: string;
    };
}

export async function imprimirReciboAction(ordenId: string) {
    try {
        // 1. Obtener datos completos de la orden
        const { data: orden, error } = await supabaseAdmin
            .from("ordenes")
            .select(`
                id,
                created_at,
                cliente_nombre,
                cliente_telefono,
                subtotal_productos,
                costo_domicilio,
                total,
                total_final,
                metodo_pago,
                tipo_orden,
                orden_detalles (
                    producto_nombre,
                    precio_unitario,
                    cantidad,
                    subtotal
                )
            `)
            .eq("id", ordenId)
            .single();

        if (error) {
            console.error("Error obteniendo orden:", error);
            return { success: false, error: `Error obteniendo orden: ${error.message}` };
        }

        if (!orden) {
            return { success: false, error: "Orden no encontrada" };
        }

        const typedOrden = orden as unknown as Orden;

        // Obtener configuración del restaurante (tabla separada sin relación directa)
        const { data: configRestaurante, error: errorConfig } = await supabaseAdmin
            .from("configuracion_restaurante")
            .select("nombre_restaurante, telefono, direccion_completa")
            .limit(1)
            .single();

        if (errorConfig || !configRestaurante) {
            console.error("Error obteniendo configuración:", errorConfig);
            return { success: false, error: "Configuración del restaurante no encontrada" };
        }

        // Validar que la orden tenga detalles
        if (!typedOrden.orden_detalles || typedOrden.orden_detalles.length === 0) {
            return { success: false, error: "La orden no tiene productos" };
        }

        // 2. Preparar datos del recibo
        const reciboData: ReciboData = {
            restaurante: {
                nombre_restaurante: configRestaurante.nombre_restaurante,
                telefono: configRestaurante.telefono,
                direccion_completa: configRestaurante.direccion_completa
            },
            orden: {
                numero: typedOrden.id.slice(-6).toUpperCase(),
                fecha: new Date(typedOrden.created_at).toLocaleString('es-CO', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                }),
                cliente: typedOrden.cliente_nombre,
                telefono: typedOrden.cliente_telefono,
                items: typedOrden.orden_detalles.map(detalle => ({
                    producto_nombre: detalle.producto_nombre,
                    precio_unitario: Number(detalle.precio_unitario),
                    cantidad: Number(detalle.cantidad),
                    subtotal: Number(detalle.subtotal)
                })),
                subtotal: Number(typedOrden.subtotal_productos || 0),
                domicilio: Number(typedOrden.costo_domicilio || 0),
                total: Number(typedOrden.total_final || typedOrden.total),
                metodoPago: typedOrden.metodo_pago,
                tipoOrden: typedOrden.tipo_orden
            }
        };

        // 3. Verificar que el servicio de impresión esté configurado
        const PRINTER_SERVICE_URL = process.env.PRINTER_SERVICE_URL || process.env.NEXT_PUBLIC_PRINTER_SERVICE_URL;

        if (!PRINTER_SERVICE_URL) {
            console.error("PRINTER_SERVICE_URL no configurada");
            return {
                success: false,
                error: "Servicio de impresión no configurado. Configure la variable PRINTER_SERVICE_URL en .env"
            };
        }

        // 4. Enviar a servicio local de impresión
        const printResponse = await fetch(PRINTER_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                type: 'recibo',
                data: reciboData,
                openCashDrawer: true, // Abrir caja registradora
                config: {
                    printerName: process.env.PRINTER_NAME || 'default',
                    paperWidth: 80 // Papel térmico 80mm
                }
            })
        });

        if (!printResponse.ok) {
            const errorText = await printResponse.text();
            console.error("Error en servicio de impresión:", errorText);
            return {
                success: false,
                error: `Error en servicio de impresión: ${printResponse.status} - ${errorText}`
            };
        }

        const printResult = await printResponse.json();

        // 5. Registrar la impresión en el historial (usuario_id es requerido según schema)
        // Si no tienes el usuario, podrías necesitar pasarlo como parámetro o usar un usuario del sistema
        const { error: errorHistorial } = await supabaseAdmin
            .from("orden_historial")
            .insert({
                orden_id: ordenId,
                estado_anterior: typedOrden.tipo_orden === 'establecimiento' ? 'lista' : 'entregada',
                estado_nuevo: typedOrden.tipo_orden === 'establecimiento' ? 'lista' : 'entregada',
                usuario_id: '00000000-0000-0000-0000-000000000000', // Usuario del sistema, deberías tener uno
                notas: `Recibo impreso - Orden #${typedOrden.id.slice(-6)}`,
                created_at: new Date().toISOString()
            });

        if (errorHistorial) {
            console.error("Error registrando historial:", errorHistorial);
            // No fallar por esto, solo loguear
        }

        return {
            success: true,
            message: "Recibo impreso correctamente",
            printJobId: printResult.jobId
        };

    } catch (error) {
        console.error("Error imprimiendo recibo:", error);

        // Intentar registrar el error en la BD
        try {
            await supabaseAdmin
                .from("orden_historial")
                .insert({
                    orden_id: ordenId,
                    estado_anterior: 'error',
                    estado_nuevo: 'error',
                    usuario_id: '00000000-0000-0000-0000-000000000000', // Usuario del sistema
                    notas: `Error al imprimir recibo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                    created_at: new Date().toISOString()
                });
        } catch (logError) {
            console.error("Error registrando error de impresión:", logError);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido al imprimir recibo'
        };
    }
}