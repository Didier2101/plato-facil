import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
    id: string | null;
    email: string | null;
    nombre: string | null;
    rol: "dueno" | "admin" | "repartidor" | null;
    setUser: (user: {
        id: string;
        email: string;
        nombre?: string | null;
        rol: "dueno" | "admin" | "repartidor";
    }) => void;
    clearUser: () => void;
};

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            id: null,
            email: null,
            nombre: null,
            rol: null,
            setUser: (user) =>
                set({
                    id: user.id,
                    email: user.email,
                    nombre: user.nombre ?? null,
                    rol: user.rol,
                }),
            clearUser: () =>
                set({
                    id: null,
                    email: null,
                    nombre: null,
                    rol: null,
                }),
        }),
        {
            name: "user-storage", // clave en localStorage
        }
    )
);
