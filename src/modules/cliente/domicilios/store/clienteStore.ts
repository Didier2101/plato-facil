// src/store/clienteStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClienteDomicilio {
    id: string;
    cliente_identificador: string;
    nombre: string;
    telefono: string;
    direccion: string;
    latitud?: number;
    longitud?: number;
}

interface ClienteStore {
    cliente: ClienteDomicilio | null;
    setCliente: (cliente: ClienteDomicilio) => void;
    clearCliente: () => void;
    mostrarModal: boolean;
    setMostrarModal: (mostrar: boolean) => void;
}

export const useClienteStore = create<ClienteStore>()(
    persist(
        (set) => ({
            cliente: null,
            mostrarModal: false,
            setCliente: (cliente) => set({ cliente }),
            clearCliente: () => set({ cliente: null }),
            setMostrarModal: (mostrarModal) => set({ mostrarModal }),
        }),
        {
            name: 'cliente-storage', // Nombre en localStorage
        }
    )
);