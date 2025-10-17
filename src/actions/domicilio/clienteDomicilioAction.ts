// src/actions/domicilio/clienteDomicilioAction.ts
"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import {
    ClienteDomicilio,
    ClienteFormData,
    ClienteRegistroResponse,
    BuscarClienteResponse,
    ActualizarClienteResponse,
} from "@/src/types/cliente";
import {
    setClienteCookie,
    getClienteIdentificador,
} from "@/src/lib/cookies";

// Limpiar teléfono (quitar espacios, guiones, caracteres especiales)
function limpiarTelefono(telefono: string): string {
    return telefono.replace(/\D/g, "");
}

/**
 * Buscar cliente existente por teléfono
 */
export async function buscarClientePorTelefonoAction(
    telefono: string
): Promise<BuscarClienteResponse> {
    try {
        if (!telefono?.trim()) {
            return {
                success: false,
                error: "El teléfono es requerido",
                encontrado: false,
            };
        }

        const telefonoLimpio = limpiarTelefono(telefono);

        const { data: cliente, error } = await supabaseAdmin
            .from("clientes_domicilios")
            .select("*")
            .or(
                `telefono.eq.${telefono},telefono.eq.${telefonoLimpio}`
            )
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error buscando cliente:", error);
            return {
                success: false,
                error: "Error al buscar el cliente",
                encontrado: false,
            };
        }

        if (!cliente) {
            return {
                success: true,
                encontrado: false,
            };
        }

        return {
            success: true,
            cliente: cliente as ClienteDomicilio,
            encontrado: true,
        };
    } catch (error) {
        console.error("Error en buscarClientePorTelefonoAction:", error);
        return {
            success: false,
            error: "Error inesperado",
            encontrado: false,
        };
    }
}

/**
 * Registrar o crear un nuevo cliente
 */
export async function registrarClienteAction(
    datos: ClienteFormData
): Promise<ClienteRegistroResponse> {
    try {
        const { nombre, telefono, direccion } = datos;

        // Validar datos
        if (!nombre?.trim() || !telefono?.trim() || !direccion?.trim()) {
            return {
                success: false,
                error: "Todos los campos son requeridos",
            };
        }

        const telefonoLimpio = limpiarTelefono(telefono);

        // Verificar si el cliente ya existe
        const { data: clienteExistente } = await supabaseAdmin
            .from("clientes_domicilios")
            .select("*")
            .or(
                `telefono.eq.${telefono},telefono.eq.${telefonoLimpio}`
            )
            .single();

        if (clienteExistente) {
            // Cliente ya existe, actualizar si es necesario y retornarlo
            await setClienteCookie(
                clienteExistente.cliente_identificador,
                clienteExistente.telefono
            );

            return {
                success: true,
                cliente: clienteExistente as ClienteDomicilio,
                esNuevo: false,
            };
        }

        // Crear nuevo cliente
        const { data: nuevoCliente, error: errorCrear } = await supabaseAdmin
            .from("clientes_domicilios")
            .insert([
                {
                    nombre,
                    telefono: telefonoLimpio,
                    direccion,
                    activo: true,
                },
            ])
            .select()
            .single();

        if (errorCrear || !nuevoCliente) {
            console.error("Error creando cliente:", errorCrear);
            return {
                success: false,
                error: "Error al registrar el cliente",
            };
        }

        // Guardar cookie
        await setClienteCookie(
            nuevoCliente.cliente_identificador,
            nuevoCliente.telefono
        );

        return {
            success: true,
            cliente: nuevoCliente as ClienteDomicilio,
            esNuevo: true,
        };
    } catch (error) {
        console.error("Error en registrarClienteAction:", error);
        return {
            success: false,
            error: "Error inesperado al registrar",
        };
    }
}

/**
 * Obtener cliente desde la cookie
 */
export async function obtenerClienteDesdeSessionAction(): Promise<BuscarClienteResponse> {
    try {
        const identificador = await getClienteIdentificador();

        if (!identificador) {
            return {
                success: true,
                encontrado: false,
            };
        }

        const { data: cliente, error } = await supabaseAdmin
            .from("clientes_domicilios")
            .select("*")
            .eq("cliente_identificador", identificador)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Error obteniendo cliente:", error);
            return {
                success: false,
                error: "Error al obtener cliente",
                encontrado: false,
            };
        }

        if (!cliente) {
            return {
                success: true,
                encontrado: false,
            };
        }

        return {
            success: true,
            cliente: cliente as ClienteDomicilio,
            encontrado: true,
        };
    } catch (error) {
        console.error("Error en obtenerClienteDesdeSessionAction:", error);
        return {
            success: false,
            error: "Error inesperado",
            encontrado: false,
        };
    }
}

/**
 * Actualizar datos del cliente
 */
export async function actualizarClienteAction(
    clienteId: string,
    datos: Partial<ClienteFormData>
): Promise<ActualizarClienteResponse> {
    try {
        if (!clienteId?.trim()) {
            return {
                success: false,
                error: "ID del cliente requerido",
            };
        }

        const actualizacion: Record<string, string> = {};
        if (datos.nombre?.trim()) actualizacion.nombre = datos.nombre.trim();
        if (datos.direccion?.trim()) actualizacion.direccion = datos.direccion.trim();
        if (datos.telefono?.trim()) {
            actualizacion.telefono = limpiarTelefono(datos.telefono);
        }
        if (Object.keys(actualizacion).length === 0) {
            return {
                success: false,
                error: "No hay datos para actualizar",
            };
        }

        actualizacion.updated_at = new Date().toISOString();

        const { data: clienteActualizado, error } = await supabaseAdmin
            .from("clientes_domicilios")
            .update(actualizacion)
            .eq("id", clienteId.trim())
            .select()
            .single();

        if (error || !clienteActualizado) {
            console.error("Error actualizando cliente:", error);
            return {
                success: false,
                error: "Error al actualizar cliente",
            };
        }

        // Actualizar cookie con nuevo teléfono si cambió
        if (datos.telefono) {
            await setClienteCookie(
                clienteActualizado.cliente_identificador,
                clienteActualizado.telefono
            );
        }

        return {
            success: true,
            cliente: clienteActualizado as ClienteDomicilio,
        };
    } catch (error) {
        console.error("Error en actualizarClienteAction:", error);
        return {
            success: false,
            error: "Error inesperado",
        };
    }
}