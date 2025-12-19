"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export interface DatosCliente {
    nombre: string;
    telefono: string;
    direccion: string;
    latitud?: number;
    longitud?: number;
}

export async function guardarClienteAction(datos: DatosCliente) {
    try {
        // Validar datos requeridos
        if (!datos.nombre || !datos.telefono || !datos.direccion) {
            return {
                success: false,
                error: "Todos los campos son obligatorios"
            };
        }

        // Verificar si el cliente ya existe por teléfono
        const { data: clienteExistente } = await supabaseAdmin
            .from("clientes_domicilios")
            .select("*")
            .eq("telefono", datos.telefono)
            .eq("activo", true)
            .single();

        // Si ya existe, retornar el cliente existente
        if (clienteExistente) {
            return {
                success: true,
                cliente: clienteExistente,
                message: "Cliente encontrado"
            };
        }

        // Si no existe, crear nuevo cliente
        const { data: nuevoCliente, error: errorInsercion } = await supabaseAdmin
            .from("clientes_domicilios")
            .insert({
                nombre: datos.nombre,
                telefono: datos.telefono,
                direccion: datos.direccion,
                latitud: datos.latitud,
                longitud: datos.longitud,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (errorInsercion) {
            console.error("Error insertando cliente:", errorInsercion);
            return {
                success: false,
                error: "Error al guardar el cliente en la base de datos"
            };
        }

        return {
            success: true,
            cliente: nuevoCliente,
            message: "Cliente registrado exitosamente"
        };

    } catch (error) {
        console.error("Error en guardarClienteAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error interno al guardar cliente'
        };
    }
}

export async function buscarClientePorTelefonoAction(telefono: string) {
    try {
        const { data: cliente, error } = await supabaseAdmin
            .from("clientes_domicilios")
            .select("*")
            .eq("telefono", telefono)
            .eq("activo", true)
            .single();

        if (error) {
            return {
                success: false,
                error: "Cliente no encontrado"
            };
        }

        return {
            success: true,
            cliente
        };

    } catch (error) {
        console.error("Error buscando cliente:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al buscar cliente'
        };
    }
}