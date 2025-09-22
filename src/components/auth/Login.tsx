"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/src/schemas/auth";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import type { LoginResult } from "@/src/types/auth";
import { useUserStore } from "@/src/store/useUserStore";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

interface LoginProps {
    loginAction: (formData: FormData) => Promise<LoginResult>;
}

export default function Login({ loginAction }: LoginProps) {
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const setUser = useUserStore((state) => state.setUser);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = (data: LoginFormData) => {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        setLoading(true);
        startTransition(async () => {
            const result = await loginAction(formData);
            setLoading(false);

            if (!result.success) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result.error ?? "Ocurrió un error",
                });
                return;
            }

            if (result.user && result.rol) {
                // Guardar solo si es admin, repartidor o cocinero
                setUser({
                    id: result.user.id,
                    email: result.user.email,
                    nombre: result.user.nombre,
                    rol: result.rol,
                });

                // Redirigir según el rol
                switch (result.rol) {
                    case "dueno":
                        router.push("/dueno/reportes");
                        break;
                    case "admin":
                        router.push("/admin/caja");
                        break;
                    case "repartidor":
                        router.push("/repartidor");
                        break;
                    default:
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: `Rol no reconocido: ${result.rol}`,
                        });
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
            {/* Header */}
            <header className="w-full max-w-md mb-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-white p-3 rounded-full shadow-md">
                        <FiUser className="text-blue-600 text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">PlatoFácil</h1>
                </div>
                <p className="text-gray-600 text-lg">
                    Gestiona tu negocio de manera eficiente
                </p>
            </header>

            {/* Formulario */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Iniciar Sesión
                </h2>
                <p className="text-center text-gray-500 text-sm">
                    Ingresa tus credenciales para acceder al sistema
                </p>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico
                    </label>
                    <div className={`flex items-center border rounded-lg px-3 py-3 focus-within:ring-2 ${errors.email ? 'border-red-500 focus-within:ring-red-200' : 'border-gray-300 focus-within:ring-blue-200'}`}>
                        <FiMail className="text-gray-500 mr-2" />
                        <input
                            type="email"
                            {...register("email")}
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Contraseña */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <div className={`flex items-center border rounded-lg px-3 py-3 focus-within:ring-2 ${errors.password ? 'border-red-500 focus-within:ring-red-200' : 'border-gray-300 focus-within:ring-blue-200'}`}>
                        <FiLock className="text-gray-500 mr-2" />
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <FiEyeOff className="opacity-70" />
                            ) : (
                                <FiEye className="opacity-70" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading || isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Iniciando sesión...
                        </>
                    ) : (
                        <>
                            <FiLogIn className="text-lg" />
                            Iniciar sesión
                        </>
                    )}
                </button>

                {/* Enlace recuperación */}
                <p className="text-center text-sm text-gray-600">
                    <Link
                        href="/recuperar"
                        className="text-blue-600 hover:underline font-medium flex items-center justify-center gap-1"
                    >
                        ¿Olvidaste tu contraseña?
                        <FiArrowRight className="text-xs" />
                    </Link>
                </p>
            </form>

            {/* Footer */}
            <footer className="mt-8 text-center text-gray-500 text-sm">
                <p>© 2025 !Bug - Todos los derechos reservados</p>
            </footer>
        </div>
    );
}