export type LoginResult = {
    success: boolean;
    error?: string;
    rol?: "dueno" | "admin" | "repartidor";
    user?: {
        id: string;
        email: string;
        nombre: string | null;
    };
};

