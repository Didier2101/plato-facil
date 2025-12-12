// src/components/auth/Login.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiGlobe } from 'react-icons/fi';
import { FaSpinner, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { useLogin } from '@/src/hooks/useLogin';
import { LoginFormData, loginSchema } from '@/src/schemas/auth';

export default function LoginComponent() {
    const { login, loading, error, resetError } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Observar cambios para resetear errores
    const emailValue = watch('email');
    const passwordValue = watch('password');

    // Resetear error cuando el usuario empiece a escribir
    useEffect(() => {
        if (error && (emailValue || passwordValue)) {
            resetError();
        }
    }, [emailValue, passwordValue, error, resetError]);

    // Marcar que el componente está montado (para efectos de hidratación)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    // Si no está montado, mostrar skeleton
    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-xl mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
            {/* Contenedor principal */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 text-center border-b border-orange-200">
                    <div className="relative w-64 h-24 mx-auto">
                        <Image
                            src="/assets/logo-kavvo.png"
                            alt="Logo Kavvo Delivery"
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 256px, 320px"
                        />
                    </div>
                    <p className="text-gray-700 font-medium mt-4 text-sm">
                        Sistema de gestión para restaurantes
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    {/* Mensaje de error global */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Campo Email */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FiMail className="text-orange-500" />
                            Correo electrónico
                        </label>
                        <div className={`relative rounded-lg border transition-all duration-200 ${errors.email
                                ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-100'
                                : 'border-gray-300 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'
                            }`}>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full px-4 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                                placeholder="ejemplo@correo.com"
                                autoComplete="email"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? 'email-error' : undefined}
                            />
                            {!errors.email && emailValue && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <FaCheck className="text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.email && (
                            <p id="email-error" className="text-red-600 text-sm font-medium flex items-center gap-2">
                                <FaExclamationTriangle className="text-sm" />
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FiLock className="text-orange-500" />
                            Contraseña
                        </label>
                        <div className={`relative rounded-lg border transition-all duration-200 ${errors.password
                                ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-100'
                                : 'border-gray-300 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100'
                            }`}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className="w-full px-4 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-500 pr-12"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                tabIndex={-1}
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="text-red-600 text-sm font-medium flex items-center gap-2">
                                <FaExclamationTriangle className="text-sm" />
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Botón de envío */}
                    <button
                        type="submit"
                        disabled={loading || !isValid}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg py-3.5 font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <FiLogIn />
                                Iniciar sesión
                            </>
                        )}
                    </button>

                    {/* Información adicional */}
                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-gray-600 text-sm mb-4">
                            ¿Problemas para acceder?
                        </p>
                        <Link
                            href="https://www.ibug.space/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors hover:underline"
                        >
                            <FiGlobe />
                            Contactar a Aurora Luminis S.A.S
                        </Link>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 text-center">
                    <p className="text-gray-600 text-sm">
                        <span className="font-semibold text-gray-800">KAVVO</span>
                        <span className="mx-2">•</span>
                        Producto de
                        <span className="mx-2">•</span>
                        <span className="font-semibold text-gray-800">Aurora Luminis S.A.S</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        © {new Date().getFullYear()} • Todos los derechos reservados
                    </p>
                </div>
            </div>
        </div>
    );
}