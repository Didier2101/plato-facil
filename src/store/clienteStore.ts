import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClienteState {
    nombre: string;
    telefono: string;
    direccion: string;
    setCliente: (data: Partial<ClienteState>) => void;
    clearCliente: () => void;
}

export const useClienteStore = create<ClienteState>()(
    persist(
        (set) => ({
            nombre: "",
            telefono: "",
            direccion: "",
            setCliente: (data) => set((state) => ({ ...state, ...data })),
            clearCliente: () => set({ nombre: "", telefono: "", direccion: "" }),
        }),
        {
            name: "cliente-storage",
        }
    )
);