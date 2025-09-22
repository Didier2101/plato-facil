import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan las variables de entorno de Supabase (server)");
}

// ⚠️ SOLO usar en server actions
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
