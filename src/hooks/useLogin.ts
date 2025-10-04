// src/hooks/useLogin.ts
"use client";

import { useState, useTransition } from "react";
import Swal from "sweetalert2";
import { loginWithRedirect } from "@/src/actions/login/actions";
import type { LoginFormData } from "@/src/schemas/auth";

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const login = (data: LoginFormData) => {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        setLoading(true);

        startTransition(async () => {
            const result = await loginWithRedirect(formData);
            setLoading(false);

            if (result && !result.success) {
                Swal.fire({
                    icon: "error",
                    title: "Error de Acceso",
                    text: result.error ?? "Credenciales incorrectas",
                    confirmButtonColor: "#f97316",
                });
            }
        });
    };

    return { login, loading, isPending };
}
