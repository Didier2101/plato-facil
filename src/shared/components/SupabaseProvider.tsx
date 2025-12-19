/* -------------------- components/SupabaseProvider.tsx -------------------- */
// Lightweight provider that creates a supabase client and passes via context


"use client";

import { supabase } from "@/src/lib/supabaseClient";
import { createContext, useContext, useState, ReactNode } from "react";


type SupabaseContextType = typeof supabase;

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
    // mantenemos el cliente en estado para evitar recrearlo en cada render
    const [client] = useState(() => supabase);

    return (
        <SupabaseContext.Provider value={client}>
            {children}
        </SupabaseContext.Provider>
    );
}

export function useSupabase() {
    const context = useContext(SupabaseContext);
    if (!context) {
        throw new Error("useSupabase debe usarse dentro de SupabaseProvider");
    }
    return context;
}
