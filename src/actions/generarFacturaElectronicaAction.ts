"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// Tipos para autenticación de Factus
interface FactusAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

// Tipos para la API de Factus (Estructura estándar UBL 2.1)
interface FactusInvoiceRequest {
    number: number;
    type_document_id: number; // 1 = Factura de Venta
    customer: {
        identification_number: number;
        dv?: number; // Dígito de verificación (solo NIT)
        name: string;
        phone: string;
        address: string;
        email: string;
        merchant_registration?: string;
        type_document_identification_id: number; // 3=CC, 6=NIT, 4=CE, 7=Pasaporte
        type_organization_id: number; // 1=Persona Jurídica, 2=Persona Natural
        type_liability_id: number; // 48=Responsable de IVA, 49=No responsable
        municipality_id: number; // Código DANE del municipio
        type_regime_id: number; // 48=Régimen simplificado, 49=Régimen común
    };
    legal_monetary_totals: {
        line_extension_amount: string; // Subtotal sin impuestos
        tax_exclusive_amount: string; // Base gravable
        tax_inclusive_amount: string; // Total con impuestos
        allowance_total_amount?: string; // Descuentos
        charge_total_amount?: string; // Cargos adicionales
        payable_amount: string; // Total a pagar
    };
    invoice_lines: Array<{
        unit_measure_id: number; // 70=Unidad, 94=Servicio
        invoiced_quantity: string;
        line_extension_amount: string;
        free_of_charge_indicator: boolean;
        description: string;
        code?: string;
        type_item_identification_id?: number;
        price_amount: string;
        base_quantity: string;
    }>;
    payment_form?: {
        payment_form_id: number; // 1=Contado, 2=Crédito
        payment_method_id: number; // 10=Efectivo, 48=Tarjeta, 42=Transferencia
        payment_due_date?: string;
        duration_measure?: string;
    };
    notes?: string;
}

interface FactusInvoiceResponse {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    invoice?: {
        id: string;
        number: string;
        prefix: string;
        cude: string;
        issue_date: string;
        zip_key: string;
        pdf_url: string;
    };
}

// Tipos para la base de datos
interface OrdenDetalle {
    id: string;
    producto_nombre: string;
    precio_unitario: number | string;
    cantidad: number;
    subtotal: number | string;
}

interface Orden {
    id: string;
    metodo_pago?: string;
    orden_detalles: OrdenDetalle[];
}

interface Factura {
    id: string;
    estado: string;
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    email: string;
    telefono?: string;
    direccion?: string;
    subtotal: number | string;
    impuestos: number | string;
    total: number | string;
    orden_id: string;
    ordenes: Orden;
}

/**
 * Obtiene el token de autenticación de Factus usando OAuth2 Client Credentials
 */
async function obtenerTokenFactus(): Promise<string> {
    const FACTUS_API_URL = process.env.FACTUS_API_URL || 'https://api-sandbox.factus.com.co';
    const CLIENT_ID = process.env.FACTUS_CLIENT_ID;
    const CLIENT_SECRET = process.env.FACTUS_CLIENT_SECRET;

    console.log("🔐 Intentando autenticar con Factus...");
    console.log("📍 URL:", FACTUS_API_URL);

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Credenciales de Factus no configuradas en variables de entorno");
    }

    try {
        // OAuth2 Client Credentials Grant
        const response = await fetch(`${FACTUS_API_URL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        console.log("📡 Status autenticación:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Error de autenticación:", errorText);
            throw new Error(`Error autenticando con Factus (${response.status}): ${errorText}`);
        }

        const data: FactusAuthResponse = await response.json();
        console.log("✅ Token obtenido exitosamente");

        return data.access_token;
    } catch (error) {
        console.error("💥 Error en autenticación:", error);
        throw error;
    }
}

/**
 * Mapea los tipos de documento entre tu sistema y Factus
 */
function mapearTipoDocumento(tipo: string): { codigo: number; tipoPersona: number } {
    const mapa: Record<string, { codigo: number; tipoPersona: number }> = {
        'NIT': { codigo: 6, tipoPersona: 1 },      // NIT - Persona jurídica
        'CC': { codigo: 3, tipoPersona: 2 },        // Cédula - Persona natural
        'CE': { codigo: 4, tipoPersona: 2 },        // Cédula Extranjería - Persona natural
        'Pasaporte': { codigo: 7, tipoPersona: 2 }  // Pasaporte - Persona natural
    };
    return mapa[tipo] || { codigo: 3, tipoPersona: 2 };
}

/**
 * Mapea los métodos de pago entre tu sistema y Factus
 */
function mapearMedioPago(metodoPago?: string): number {
    const mapa: Record<string, number> = {
        'efectivo': 10,
        'tarjeta': 48,
        'transferencia': 42
    };
    return mapa[metodoPago || ''] || 10; // Por defecto efectivo
}

/**
 * Action principal para generar factura electrónica con Factus
 */
export async function generarFacturaElectronicaAction(facturaId: string) {
    try {
        console.log("=== INICIANDO GENERACIÓN DE FACTURA ELECTRÓNICA ===");
        console.log("📄 Factura ID:", facturaId);

        // 1. Obtener datos de la factura y orden
        const { data: factura, error: errorFactura } = await supabaseAdmin
            .from("facturas")
            .select(`
                *,
                ordenes (
                    id,
                    metodo_pago,
                    orden_detalles (
                        id,
                        producto_nombre,
                        precio_unitario,
                        cantidad,
                        subtotal
                    )
                )
            `)
            .eq("id", facturaId)
            .single();

        if (errorFactura || !factura) {
            console.error("❌ Error obteniendo factura:", errorFactura);
            return { success: false, error: "Factura no encontrada" };
        }

        const typedFactura = factura as unknown as Factura;
        console.log("✅ Factura encontrada");
        console.log("📋 Cliente:", typedFactura.razon_social);
        console.log("💰 Total:", typedFactura.total);

        // Validar estado
        if (typedFactura.estado !== 'pendiente') {
            console.warn("⚠️ Factura ya procesada. Estado:", typedFactura.estado);
            return {
                success: false,
                error: `Factura ya procesada. Estado actual: ${typedFactura.estado}`
            };
        }

        // 2. Obtener token de autenticación
        const token = await obtenerTokenFactus();

        // 3. Preparar datos del cliente
        const tipoDocumentoMapeado = mapearTipoDocumento(typedFactura.tipo_documento);

        // Extraer dígito de verificación si es NIT
        let numeroDocumento = typedFactura.numero_documento;
        let digitoVerificacion: number | undefined;

        if (typedFactura.tipo_documento === 'NIT' && numeroDocumento.includes('-')) {
            const partes = numeroDocumento.split('-');
            numeroDocumento = partes[0];
            digitoVerificacion = parseInt(partes[1], 10);
        }

        console.log("👤 Tipo documento:", typedFactura.tipo_documento, "->", tipoDocumentoMapeado.codigo);

        // 4. Preparar items de la factura
        const orden = typedFactura.ordenes;
        const items = orden.orden_detalles.map((detalle: OrdenDetalle) => {
            const precioUnitario = Number(detalle.precio_unitario);
            const cantidad = Number(detalle.cantidad);
            const subtotal = Number(detalle.subtotal);

            return {
                unit_measure_id: 70, // 70 = Unidad
                invoiced_quantity: cantidad.toFixed(2),
                line_extension_amount: subtotal.toFixed(2),
                free_of_charge_indicator: false,
                description: detalle.producto_nombre,
                price_amount: precioUnitario.toFixed(2),
                base_quantity: cantidad.toFixed(2)
            };
        });

        console.log("📦 Items preparados:", items.length);

        // 5. Calcular totales
        const subtotal = Number(typedFactura.subtotal);

        const total = Number(typedFactura.total);

        // 6. Generar número de factura (timestamp simple)
        const numeroFactura = Date.now();

        // 7. Preparar request para Factus
        const factusRequest: FactusInvoiceRequest = {
            number: numeroFactura,
            type_document_id: 1, // Factura de venta
            customer: {
                identification_number: parseInt(numeroDocumento, 10),
                dv: digitoVerificacion,
                name: typedFactura.razon_social,
                phone: typedFactura.telefono || '0000000',
                address: typedFactura.direccion || 'N/A',
                email: typedFactura.email,
                type_document_identification_id: tipoDocumentoMapeado.codigo,
                type_organization_id: tipoDocumentoMapeado.tipoPersona,
                type_liability_id: 49, // 49 = No responsable de IVA (común para pequeños negocios)
                municipality_id: 11001, // Bogotá por defecto - ajusta según tu ciudad
                type_regime_id: 48 // 48 = Régimen simplificado
            },
            legal_monetary_totals: {
                line_extension_amount: subtotal.toFixed(2),
                tax_exclusive_amount: subtotal.toFixed(2),
                tax_inclusive_amount: total.toFixed(2),
                payable_amount: total.toFixed(2)
            },
            invoice_lines: items,
            payment_form: {
                payment_form_id: 1, // Contado
                payment_method_id: mapearMedioPago(orden.metodo_pago)
            },
            notes: `Orden #${orden.id.slice(-8)}`
        };

        console.log("📤 Request preparado para Factus");
        console.log("🔍 Preview:", JSON.stringify(factusRequest, null, 2).substring(0, 1000));

        // 8. Llamar API de Factus para crear la factura
        const FACTUS_API_URL = process.env.FACTUS_API_URL || 'https://api-sandbox.factus.com.co';

        // Endpoint estándar de Factus para facturas UBL 2.1
        const endpoint = `${FACTUS_API_URL}/api/ubl2.1/invoice`;
        console.log("📡 Endpoint:", endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(factusRequest)
        });

        console.log("📥 Response status:", response.status);

        const responseText = await response.text();
        console.log("📄 Response body:", responseText);

        let factusResponse: FactusInvoiceResponse;
        try {
            factusResponse = JSON.parse(responseText);
        } catch (e) {
            console.error("❌ Error parseando respuesta JSON:", e);
            throw new Error(`Respuesta inválida de Factus: ${responseText.substring(0, 200)}`);
        }

        // 9. Procesar respuesta
        if (!response.ok || !factusResponse.success || !factusResponse.invoice) {
            const errorMsg = factusResponse.message ||
                (factusResponse.errors ? JSON.stringify(factusResponse.errors) : '') ||
                'Error desconocido de Factus';

            console.error("❌ Error de Factus:", factusResponse);

            // Actualizar estado a error
            await supabaseAdmin
                .from("facturas")
                .update({
                    estado: 'error',
                    error_mensaje: errorMsg,
                    updated_at: new Date().toISOString()
                })
                .eq("id", facturaId);

            return {
                success: false,
                error: errorMsg
            };
        }

        console.log("✅ Factura generada en Factus");
        console.log("📄 Número:", factusResponse.invoice.number);
        console.log("🔐 CUDE:", factusResponse.invoice.cude);

        // 10. Actualizar factura con datos de Factus (éxito)
        const { error: errorActualizar } = await supabaseAdmin
            .from("facturas")
            .update({
                estado: 'emitida',
                numero_factura: factusResponse.invoice.number,
                prefijo: factusResponse.invoice.prefix || '',
                cufe: factusResponse.invoice.cude,
                factura_url: factusResponse.invoice.pdf_url || '',
                xml_url: factusResponse.invoice.zip_key || '',
                emitida_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq("id", facturaId);

        if (errorActualizar) {
            console.error("❌ Error actualizando factura:", errorActualizar);
            return {
                success: false,
                error: "Factura generada en Factus pero error al actualizar BD local"
            };
        }

        // 11. Actualizar orden
        await supabaseAdmin
            .from("ordenes")
            .update({
                factura_emitida: true,
                updated_at: new Date().toISOString()
            })
            .eq("id", typedFactura.orden_id);

        console.log("=== FACTURA ELECTRÓNICA GENERADA EXITOSAMENTE ===");

        // 12. Retornar éxito
        return {
            success: true,
            facturaUrl: factusResponse.invoice.pdf_url || '',
            numeroFactura: factusResponse.invoice.number,
            cufe: factusResponse.invoice.cude,
            qr: factusResponse.invoice.zip_key
        };

    } catch (error) {
        console.error("💥 ERROR CRÍTICO:", error);
        console.error("Stack:", error instanceof Error ? error.stack : 'No disponible');

        // Actualizar estado a error
        try {
            await supabaseAdmin
                .from("facturas")
                .update({
                    estado: 'error',
                    error_mensaje: error instanceof Error ? error.message : 'Error interno',
                    updated_at: new Date().toISOString()
                })
                .eq("id", facturaId);
        } catch (updateError) {
            console.error("❌ Error actualizando estado de error:", updateError);
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error interno al generar factura'
        };
    }
}