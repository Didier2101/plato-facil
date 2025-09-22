"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import FormAgregarUsuario from "./FormAgregarUsuario";
import { FiUser, FiMail, FiEdit2, FiTrash2, FiPlus, FiUsers } from "react-icons/fi";

export const schema = z.object({
    nombre: z.string().min(3, "El nombre es obligatorio"),
    email: z.string().email("El email no es válido"),
    rol: z.enum(["admin", "repartidor", "dueno"]),
    contraseña: z.string().min(6, "Mínimo 6 caracteres"),
});

export type FormData = z.infer<typeof schema>;

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: string;
}

export default function Usuarios({
    usuarios,
    onAgregar,
}: {
    usuarios: Usuario[];
    onAgregar: (data: FormData) => Promise<void>;
}) {
    const [isModalOpen, setModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const handleAgregar = async (data: FormData) => {
        try {
            await onAgregar(data);
            reset();
            setModalOpen(false);
        } catch {
            Swal.fire("❌ Error", "No se pudo agregar el usuario", "error");
        }
    };

    // Función para obtener el color según el rol
    const getRolColor = (rol: string) => {
        switch (rol) {
            case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
            case "repartidor": return "bg-blue-100 text-blue-800 border-blue-200";
            case "dueno": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-yellow-100 rounded-xl shadow-md">
                            <FiUsers className="text-yellow-600 text-3xl" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-gray-800">Gestión de Usuarios</h1>
                            <p className="text-gray-600">Administra los usuarios del sistema</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-2xl font-semibold transition"
                    >
                        <FiPlus size={20} />
                        <span>Agregar Usuario</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {["admin", "repartidor", "cocinero", "dueno"].map((rol) => {
                    const count = usuarios.filter((u) => u.rol === rol).length;
                    const rolColors = getRolColor(rol).split(" "); // bg, text, border
                    return (
                        <div key={rol} className={`bg-white rounded-3xl p-5 shadow-md border ${rolColors[2]} transition hover:shadow-xl`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm capitalize">{rol}</p>
                                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                                </div>
                                <div className={`p-4 rounded-full ${rolColors[0]} flex items-center justify-center`}>
                                    <FiUser className={`text-2xl ${rolColors[1]}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-yellow-50">
                                <th className="p-4 text-gray-700 font-semibold text-left">Usuario</th>
                                <th className="p-4 text-gray-700 font-semibold text-left">Email</th>
                                <th className="p-4 text-gray-700 font-semibold text-left">Rol</th>
                                <th className="p-4 text-gray-700 font-semibold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.map((u) => (
                                <tr key={u.id} className="hover:bg-yellow-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <FiUser className="text-yellow-600 text-xl" />
                                            </div>
                                            <span className="text-gray-800 font-medium">{u.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <FiMail className="text-gray-400" size={16} />
                                            <span className="text-gray-600">{u.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getRolColor(u.rol)}`}
                                        >
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => alert("editar")}
                                                className="p-3 bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => alert("eliminar")}
                                                className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <FormAgregarUsuario
                    onClose={() => setModalOpen(false)}
                    handleSubmit={handleSubmit}
                    handleAgregar={handleAgregar}
                    register={register}
                    errors={formState.errors}
                />
            )}
        </div>

    );
}