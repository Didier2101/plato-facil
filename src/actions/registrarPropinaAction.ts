"use server";

import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function registrarPropinaAction(
    pagoId: string,
    monto: number,
    porcentaje: number | null
) {
    try {
        const { error } = await supabaseAdmin.from("propinas").insert([
            {
                pago_id: pagoId,
                monto,
                porcentaje,
            },
        ]);

        if (error) {
            console.error("Error insertando propina:", error);
            return { success: false, error: "No se pudo registrar la propina" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error inesperado:", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
