"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        try {
            console.log("Intentando login con:", email);

            // Login usando Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (authError) {
                console.error("Error de autenticación:", authError);
                setErrorMsg(getErrorMessage(authError.message));
                setLoading(false);
                return;
            }

            if (!authData.user) {
                setErrorMsg("No se pudo autenticar el usuario");
                setLoading(false);
                return;
            }

            console.log("Usuario autenticado:", authData.user.id);

            // Intentar obtener rol desde la tabla usuarios
            const { data: usuarioData, error: rolError } = await supabase
                .from("usuarios")
                .select("rol")
                .eq("id", authData.user.id)
                .single();

            console.log("Datos del usuario:", usuarioData, rolError);

            if (rolError || !usuarioData) {
                // Si no encuentra el usuario en la tabla, crear manualmente
                setErrorMsg("Tu cuenta fue autenticada pero necesita configuración. Contacta al administrador o verifica que tu perfil esté creado correctamente.");
                setLoading(false);
                return;
            }

            console.log("Rol del usuario:", usuarioData.rol);

            // Redirigir según rol
            switch (usuarioData.rol) {
                case "dueno":
                    router.push("/reportes");
                    break;
                case "admin":
                    router.push("/admin");
                    break;
                case "repartidor":
                    router.push("/repartidor");
                    break;
                default:
                    setErrorMsg(`Rol no reconocido: ${usuarioData.rol}`);
                    setLoading(false);
                    return;
            }

        } catch (error) {
            console.error("Error inesperado:", error);
            setErrorMsg("Error inesperado. Intenta nuevamente.");
            setLoading(false);
        }
    };

    const getErrorMessage = (errorMessage: string) => {
        switch (errorMessage) {
            case "Invalid login credentials":
                return "Email o contraseña incorrectos";
            case "Email not confirmed":
                return "Por favor confirma tu email antes de iniciar sesión";
            case "Too many requests":
                return "Demasiados intentos. Espera un momento antes de intentar nuevamente";
            default:
                return "Error de autenticación. Verifica tus credenciales.";
        }
    };

    // Función para probar la consulta a usuarios
    const testQuery = async () => {
        try {
            setErrorMsg("Probando consulta...");

            // Probar consulta simple sin filtros
            const { data: allUsers, error: allError } = await supabase
                .from("usuarios")
                .select("*");

            console.log("Todos los usuarios:", allUsers, allError);

            if (allError) {
                setErrorMsg(`Error: ${allError.message}`);
            } else {
                setErrorMsg(`Encontrados ${allUsers?.length || 0} usuarios en total`);
            }
        } catch (error) {
            console.error("Error en consulta:", error);
            setErrorMsg("Error en la consulta");
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
                    PlatoFácil Login
                </h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                {/* Botón para probar consulta */}
                <button
                    onClick={testQuery}
                    className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1"
                    type="button"
                >
                    Probar Acceso a Tabla Usuarios
                </button>

                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-600 text-sm text-center">{errorMsg}</p>
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
                    <p><strong>Para probar:</strong></p>
                    <p>1. Haz clic en Probar Acceso para verificar RLS</p>
                    <p>2. Si no funciona, configura las políticas RLS</p>
                    <p>3. Luego prueba el login normal</p>
                </div>
            </div>
        </main>
    );
}