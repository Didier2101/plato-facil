"use client";

import { useState, useEffect } from "react";
import Usuarios, { Usuario } from "@/src/components/dueno/Usuarios";
import Swal from "sweetalert2";

import { obtenerUsuariosAction } from "@/src/actions/obtenerUsuariosAction";
import { crearUsuarioAction } from "@/src/actions/crearUsuarioAction";
import Loading from "@/src/components/ui/Loading";

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar usuarios al iniciar
    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const result = await obtenerUsuariosAction();

                if (result.success && result.usuarios) {
                    setUsuarios(result.usuarios);
                } else if (!result.success) {
                    Swal.fire("❌ Error", result.error, "error");
                }
            } catch (error) {
                console.error('Error cargando usuarios:', error);
                Swal.fire("❌ Error", "No se pudieron cargar los usuarios", "error");
            } finally {
                setLoading(false);
            }
        };

        cargarUsuarios();
    }, []);

    const agregarUsuario = async (data: {
        nombre: string;
        email: string;
        rol: string;
        contraseña: string;
    }) => {
        const formData = new FormData();
        formData.append("nombre", data.nombre);
        formData.append("email", data.email);
        formData.append("rol", data.rol);
        formData.append("password", data.contraseña);

        const result = await crearUsuarioAction(formData);

        if (!result.success) {
            Swal.fire("❌ Error", result.error || "No se pudo crear", "error");
            return;
        }

        if (result.user) {
            setUsuarios((prev) => [...prev, result.user]);
            Swal.fire("✅ Usuario creado", "", "success");
        }
    };

    if (loading) {
        return (
            <Loading
                texto="Cargando productos..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    return <Usuarios usuarios={usuarios} onAgregar={agregarUsuario} />;
}