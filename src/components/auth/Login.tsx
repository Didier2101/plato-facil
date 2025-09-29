"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/src/schemas/auth";
import { useState, useTransition } from "react";
import Swal from "sweetalert2";


import { useUserStore } from "@/src/store/useUserStore";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUser, FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import { loginAction } from "@/src/actions/login/actions";

export default function LoginComponent() {
    const [isPending, startTransition] = useTransition();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
                    title: "Error de Acceso",
                    text: result.error ?? "Ocurrió un error",
                    confirmButtonColor: "#3B82F6",
                    background: "#FEFEFE",
                    customClass: {
                        popup: 'rounded-2xl',
                        title: 'text-lg font-semibold',
                        confirmButton: 'rounded-lg px-6 py-2'
                    }
                });
                return;
            }

            if (result.user && result.rol) {
                // Guardar usuario en store
                setUser({
                    id: result.user.id,
                    email: result.user.email,
                    nombre: result.user.nombre,
                    rol: result.rol,
                });

                // Determinar ruta de redirección
                let redirectPath = '/login';
                switch (result.rol) {
                    case "dueno":
                        redirectPath = "/dueno/reportes";
                        break;
                    case "admin":
                        redirectPath = "/admin/caja";
                        break;
                    case "repartidor":
                        redirectPath = "/repartidor/ordenes-listas";
                        break;
                    default:
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: `Rol no reconocido: ${result.rol}`,
                            confirmButtonColor: "#3B82F6",
                        });
                        return;
                }

                // ✅ Mostrar mensaje de bienvenida con await
                await Swal.fire({
                    icon: "success",
                    title: "¡Bienvenido!",
                    text: `Hola ${result.user.nombre || result.user.email}`,
                    timer: 1500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    confirmButtonColor: "#3B82F6",
                    background: "#FEFEFE",
                    customClass: {
                        popup: 'rounded-2xl',
                        title: 'text-lg font-semibold'
                    }
                });

                // ✅ Redirigir con window.location para forzar recarga completa
                window.location.href = redirectPath;
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-200 rounded-full opacity-15 blur-2xl"></div>

            {/* Header */}
            <header className="w-full max-w-md mb-8 text-center relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-blue-100">
                        <FiUser className="text-blue-600 text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            PlatoFácil
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Sistema de Gestión</p>
                    </div>
                </div>
                <p className="text-gray-600 text-lg font-medium">
                    Gestiona tu negocio de manera eficiente
                </p>
            </header>

            {/* Formulario */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20 relative z-10"
            >
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Iniciar Sesión
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Ingresa tus credenciales para acceder al sistema
                    </p>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo electrónico
                    </label>
                    <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50/50 transition-all duration-200 ${errors.email
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-500'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400'
                        }`}>
                        <FiMail className={`mr-3 text-lg ${errors.email ? 'text-red-500' : 'text-gray-500'}`} />
                        <input
                            type="email"
                            {...register("email")}
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                            <span className="text-xs">⚠️</span>
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Contraseña */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña
                    </label>
                    <div className={`flex items-center border rounded-xl px-4 py-3 bg-gray-50/50 transition-all duration-200 ${errors.password
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-500'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400'
                        }`}>
                        <FiLock className={`mr-3 text-lg ${errors.password ? 'text-red-500' : 'text-gray-500'}`} />
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-3 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <FiEyeOff className="text-lg" />
                            ) : (
                                <FiEye className="text-lg" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                            <span className="text-xs">⚠️</span>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={loading || isPending}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:transform-none"
                >
                    {loading || isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Iniciando sesión...
                        </>
                    ) : (
                        <>
                            <FiLogIn className="text-xl" />
                            Iniciar sesión
                        </>
                    )}
                </button>

                {/* Enlace recuperación */}
                <div className="text-center pt-4 border-t border-gray-200">
                    <Link
                        href="/recuperar"
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center gap-2 transition-colors hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                        <FiArrowRight className="text-sm" />
                    </Link>
                </div>
            </form>

            {/* Información adicional */}
            <div className="mt-8 text-center max-w-md relative z-10">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                    <h3 className="font-semibold text-gray-800 mb-2">Acceso por Rol</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium text-green-600">Dueño:</span> Reportes y gestión completa</p>
                        <p><span className="font-medium text-blue-600">Admin:</span> Caja y operaciones</p>
                        <p><span className="font-medium text-purple-600">Repartidor:</span> Entregas y pedidos</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-gray-500 text-sm relative z-10">
                <div className="bg-white/40 backdrop-blur-sm rounded-full px-6 py-2 border border-white/30">
                    <p>© 2025 !Bug - Todos los derechos reservados</p>
                </div>
            </footer>
        </div>
    );
}