"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function registrarPropinaAction(
    pagoId: string,
    monto: number,
    porcentaje: number | null
) {
    try {
        if (monto <= 0) {
            return {
                success: false,
                error: "El monto de la propina debe ser mayor a 0"
            };
        }

        const { data, error } = await supabaseAdmin
            .from("propinas")
            .insert({
                pago_id: pagoId,
                monto: monto,
                porcentaje: porcentaje,
                created_at: new Date().toISOString()
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error registrando propina:", error);
            return {
                success: false,
                error: "Error al registrar la propina"
            };
        }

        return {
            success: true,
            propinaId: data.id
        };

    } catch (error) {
        console.error("Error en registrarPropinaAction:", error);
        return {
            success: false,
            error: "Error inesperado al registrar la propina"
        };
    }
}