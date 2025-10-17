"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

type TipoComprobante = 'factura' | 'recibo' | 'ninguno';

interface DatosFacturacion {
    tipoDocumento: string;
    numeroDocumento: string;
    razonSocial: string;
    email: string;
    telefono?: string;
    direccion?: string;
}

/**
 * Action principal para cobrar una orden y cambiar su estado a 'entregada'
 * 
 * Flujo completo:
 * 1. Valida estado de la orden (lista/llegue_a_destino)
 * 2. Registra el pago en tabla 'pagos'
 * 3. Si hay propina, la registra en tabla 'propinas'
 * 4. Si es factura, crea registro pendiente en tabla 'facturas'
 * 5. Actualiza orden a estado 'entregada'
 * 6. Registra en historial
 * 7. Retorna flags para procesos posteriores (imprimir/facturar)
 */
export async function cobrarOrdenAction(
    ordenId: string,
    usuarioId: string,
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia',
    propina: number,
    tipoComprobante?: TipoComprobante,
    datosFacturacion?: DatosFacturacion
) {
    try {
        // 1. Obtener datos completos de la orden
        const { data: orden, error: errorOrden } = await supabaseAdmin
            .from("ordenes")
            .select("total, total_final, subtotal_productos, estado, tipo_orden, usuario_entregador_id")
            .eq("id", ordenId)
            .single();

        if (errorOrden || !orden) {
            console.error("Error obteniendo orden:", errorOrden);
            return {
                success: false,
                error: "Orden no encontrada"
            };
        }

        // 2. Verificar que la orden esté en el estado correcto según el tipo
        if (orden.tipo_orden === 'domicilio') {
            if (orden.estado !== 'llegue_a_destino') {
                return {
                    success: false,
                    error: `Las órdenes de domicilio deben estar en estado "llegue_a_destino" para ser cobradas. Estado actual: ${orden.estado}`
                };
            }
        } else if (orden.tipo_orden === 'establecimiento') {
            if (orden.estado !== 'lista') {
                return {
                    success: false,
                    error: `Las órdenes de establecimiento deben estar en estado "lista" para ser cobradas. Estado actual: ${orden.estado}`
                };
            }
        } else {
            return {
                success: false,
                error: "Tipo de orden no válido"
            };
        }

        // 3. Validar que si es factura, vengan los datos necesarios
        if (tipoComprobante === 'factura' && orden.tipo_orden === 'establecimiento') {
            if (!datosFacturacion?.numeroDocumento || !datosFacturacion?.razonSocial || !datosFacturacion?.email) {
                return {
                    success: false,
                    error: "Datos de facturación incompletos"
                };
            }
        }

        // 4. Calcular el monto total con propina
        const montoTotal = Number(orden.total_final || orden.total) + propina;

        // 5. Crear el registro de pago
        const { data: pagoData, error: errorPago } = await supabaseAdmin
            .from("pagos")
            .insert({
                orden_id: ordenId,
                usuario_id: usuarioId,
                metodo_pago: metodoPago,
                monto: montoTotal,
                created_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (errorPago) {
            console.error("Error creando pago:", errorPago);
            return {
                success: false,
                error: "Error al registrar el pago"
            };
        }

        // 6. Si hay propina, registrarla en la tabla propinas
        if (propina > 0) {
            const porcentajePropina = (propina / Number(orden.subtotal_productos || 0)) * 100;

            const { error: errorPropina } = await supabaseAdmin
                .from("propinas")
                .insert({
                    pago_id: pagoData.id,
                    monto: propina,
                    porcentaje: Math.round(porcentajePropina * 100) / 100,
                    created_at: new Date().toISOString()
                });

            if (errorPropina) {
                console.error("Error registrando propina:", errorPropina);
                // No falla el cobro por esto
            }
        }

        // 7. Si requiere factura, crear registro pendiente en tabla facturas
        let facturaId: string | null = null;
        if (tipoComprobante === 'factura' && datosFacturacion && orden.tipo_orden === 'establecimiento') {
            const { data: facturaData, error: errorFactura } = await supabaseAdmin
                .from("facturas")
                .insert({
                    orden_id: ordenId,
                    tipo_documento: datosFacturacion.tipoDocumento,
                    numero_documento: datosFacturacion.numeroDocumento,
                    razon_social: datosFacturacion.razonSocial,
                    email: datosFacturacion.email,
                    telefono: datosFacturacion.telefono || null,
                    direccion: datosFacturacion.direccion || null,
                    subtotal: Number(orden.subtotal_productos || 0),
                    impuestos: 0, // TODO: Calcular IVA si tu negocio lo requiere
                    total: montoTotal,
                    estado: 'pendiente',
                    usuario_emisor_id: usuarioId,
                    created_at: new Date().toISOString()
                })
                .select("id")
                .single();

            if (errorFactura) {
                console.error("Error creando registro de factura:", errorFactura);
                // No falla el cobro, pero se registra que hubo error
            } else {
                facturaId = facturaData.id;
            }
        }

        // 8. Actualizar el estado de la orden a 'entregada'
        const { error: errorActualizar } = await supabaseAdmin
            .from("ordenes")
            .update({
                estado: 'entregada',
                metodo_pago: metodoPago,
                fecha_entrega: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                usuario_entregador_id: usuarioId,
                // Campos adicionales para tracking de facturación
                requiere_factura: tipoComprobante === 'factura',
                factura_emitida: false, // Se actualizará cuando Factus responda
                tipo_comprobante: tipoComprobante || 'ninguno'
            })
            .eq("id", ordenId);

        if (errorActualizar) {
            console.error("Error actualizando orden:", errorActualizar);
            return {
                success: false,
                error: "Error al actualizar el estado de la orden"
            };
        }

        // 9. Registrar en el historial
        const estadoAnterior = orden.tipo_orden === 'domicilio' ? 'llegue_a_destino' : 'lista';
        const notaComprobante = tipoComprobante === 'factura'
            ? `Factura solicitada (${datosFacturacion?.razonSocial})`
            : tipoComprobante === 'recibo'
                ? 'Recibo de caja'
                : 'Sin comprobante';

        const notaPropina = propina > 0 ? ` | Propina: $${propina.toLocaleString('es-CO')}` : '';

        const { error: errorHistorial } = await supabaseAdmin
            .from("orden_historial")
            .insert({
                orden_id: ordenId,
                estado_anterior: estadoAnterior,
                estado_nuevo: 'entregada',
                usuario_id: usuarioId,
                notas: `Orden cobrada y entregada. Método: ${metodoPago}. Comprobante: ${notaComprobante}. Monto: $${montoTotal.toLocaleString('es-CO')} (${orden.tipo_orden})${notaPropina}`,
                created_at: new Date().toISOString()
            });

        if (errorHistorial) {
            console.error("Error registrando historial:", errorHistorial);
            // No falla el cobro por esto
        }

        // 10. Retornar resultado con flags para el frontend
        return {
            success: true,
            pagoId: pagoData.id,
            facturaId: facturaId,
            ordenId: ordenId,
            requiereImpresion: tipoComprobante === 'recibo',
            requiereFacturacion: tipoComprobante === 'factura',
            tipoOrden: orden.tipo_orden,
            tipoComprobante: tipoComprobante || 'ninguno',
            message: "Orden cobrada y entregada exitosamente"
        };

    } catch (error) {
        console.error("Error procesando cobro:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error interno al procesar el cobro'
        };
    }
}