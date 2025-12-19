// src/modules/auth/types/auth.ts

import { Rol } from "@/src/shared/types/rol";

export interface AuthUser {
    id: string;
    email: string;
    nombre?: string | null;
    rol: Rol;
    activo: boolean;
    created_at?: string;
}

export interface SessionData {
    user: AuthUser | null;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}