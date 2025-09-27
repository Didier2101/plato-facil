"use client";

import { useState, useEffect } from "react";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
    FiUser,
    FiMail,
    FiEdit2,
    FiPlus,
    FiUsers,
    FiLock,
    FiEye,
    FiEyeOff,
    FiChevronDown,
    FiX,
    FiSave,
} from "react-icons/fi";
import {
    FaToggleOn,
    FaToggleOff
} from "react-icons/fa";
import { obtenerUsuariosAction } from "@/src/actions/dueno/obtenerUsuariosAction";
import { crearUsuarioAction } from "@/src/actions/dueno/crearUsuarioAction";
import { editarUsuarioAction } from "@/src/actions/dueno/editarUsuarioAction";
import { toggleUsuarioAction } from "@/src/actions/dueno/toggleUsuarioAction";
import Loading from "@/src/components/ui/Loading";
import { TbFidgetSpinner } from "react-icons/tb";

export const createSchema = z.object({
    nombre: z.string().min(3, "El nombre es obligatorio"),
    email: z.string().email("El email no es válido"),
    rol: z.enum(["admin", "repartidor", "dueno"]),
    contraseña: z.string().min(6, "Mínimo 6 caracteres"),
});

export const editSchema = z.object({
    nombre: z.string().min(3, "El nombre es obligatorio"),
    email: z.string().email("El email no es válido"),
    rol: z.enum(["admin", "repartidor", "dueno"]),
});

export type CreateFormData = z.infer<typeof createSchema>;
export type EditFormData = z.infer<typeof editSchema>;

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    activo?: boolean;
}

// Props para el modal de creación
interface CreateModalProps {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    register: UseFormRegister<CreateFormData>;
    errors: FieldErrors<CreateFormData>;
    saving: boolean;
}

// Props para el modal de edición
interface EditModalProps {
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    register: UseFormRegister<EditFormData>;
    errors: FieldErrors<EditFormData>;
    saving: boolean;
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);

    // Form para crear usuario
    const createForm = useForm<CreateFormData>({
        resolver: zodResolver(createSchema),
    });

    // Form para editar usuario
    const editForm = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
    });

    // Cargar usuarios al iniciar
    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const result = await obtenerUsuariosAction();

                if (result.success && result.usuarios) {
                    setUsuarios(result.usuarios);
                } else if (!result.success) {
                    Swal.fire({
                        title: 'Error',
                        text: result.error || 'No se pudieron cargar los usuarios',
                        icon: 'error'
                    });
                }
            } catch (err) {
                console.error('Error cargando usuarios:', err);
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los usuarios',
                    icon: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        cargarUsuarios();
    }, []);

    // Crear usuario
    const handleCrearUsuario = async (data: CreateFormData) => {
        try {
            setSaving(true);
            const formData = new FormData();
            formData.append("nombre", data.nombre);
            formData.append("email", data.email);
            formData.append("rol", data.rol);
            formData.append("password", data.contraseña);

            const result = await crearUsuarioAction(formData);

            if (!result.success) {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo crear el usuario',
                    icon: 'error'
                });
                return;
            }

            if (result.user) {
                setUsuarios((prev) => [...prev, { ...result.user, activo: true }]);
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Usuario creado correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                createForm.reset();
                setCreateModalOpen(false);
            }
        } catch (err) {
            console.error("Error creando usuario:", err);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo agregar el usuario',
                icon: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    // Editar usuario
    const handleEditarUsuario = async (data: EditFormData) => {
        if (!editingUser) return;

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append("id", editingUser.id);
            formData.append("nombre", data.nombre);
            formData.append("email", data.email);
            formData.append("rol", data.rol);

            const result = await editarUsuarioAction(formData);

            if (!result.success) {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo actualizar el usuario',
                    icon: 'error'
                });
                return;
            }

            if (result.user) {
                setUsuarios((prev) =>
                    prev.map((user) =>
                        user.id === editingUser.id
                            ? { ...user, nombre: data.nombre, email: data.email, rol: data.rol }
                            : user
                    )
                );

                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Usuario actualizado correctamente',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                setEditModalOpen(false);
                setEditingUser(null);
                editForm.reset();
            }
        } catch (err) {
            console.error("Error editando usuario:", err);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el usuario',
                icon: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    // Abrir modal de edición
    const openEditModal = (usuario: Usuario) => {
        setEditingUser(usuario);
        editForm.setValue("nombre", usuario.nombre);
        editForm.setValue("email", usuario.email);
        editForm.setValue("rol", usuario.rol as "admin" | "repartidor" | "dueno");
        setEditModalOpen(true);
    };

    // Toggle activo/inactivo
    const toggleUsuarioActivo = async (usuario: Usuario) => {
        try {
            const nuevoEstado = !usuario.activo;

            const result = await toggleUsuarioAction(usuario.id, nuevoEstado);

            if (!result.success) {
                Swal.fire({
                    title: 'Error',
                    text: result.error || 'No se pudo cambiar el estado',
                    icon: 'error'
                });
                return;
            }

            setUsuarios((prev) =>
                prev.map((user) =>
                    user.id === usuario.id
                        ? { ...user, activo: nuevoEstado }
                        : user
                )
            );

            Swal.fire({
                title: nuevoEstado ? 'Usuario activado' : 'Usuario desactivado',
                text: '',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error("Error cambiando estado:", err);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo cambiar el estado del usuario',
                icon: 'error'
            });
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading
                    texto="Cargando usuarios..."
                    tamaño="grande"
                    color="orange-500"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-4 rounded-xl">
                            <FiUsers className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                            <p className="text-gray-600 mt-1">Administra los usuarios y permisos del sistema</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Botón Agregar Usuario */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                        <FiPlus className="text-lg" />
                        <span>Agregar Usuario</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {["admin", "repartidor", "dueno"].map((rol) => {
                        const count = usuarios.filter((u) => u.rol === rol).length;
                        const countActivos = usuarios.filter((u) => u.rol === rol && u.activo !== false).length;
                        const rolColors = getRolColor(rol).split(" ");
                        return (
                            <div key={rol} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm capitalize">{rol}</p>
                                        <p className="text-2xl font-bold text-gray-800">{count}</p>
                                        <p className="text-xs text-gray-400">{countActivos} activos</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${rolColors[0]}`}>
                                        <FiUser className={`text-xl ${rolColors[1]}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Card total */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Usuarios</p>
                                <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
                                <p className="text-xs text-gray-400">{usuarios.filter(u => u.activo !== false).length} activos</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <FiUsers className="text-orange-500 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla de Usuarios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Lista de Usuarios
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="p-4 text-gray-700 font-semibold text-left">Usuario</th>
                                    <th className="p-4 text-gray-700 font-semibold text-left">Email</th>
                                    <th className="p-4 text-gray-700 font-semibold text-left">Rol</th>
                                    <th className="p-4 text-gray-700 font-semibold text-center">Estado</th>
                                    <th className="p-4 text-gray-700 font-semibold text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id} className={`transition-colors ${usuario.activo !== false ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <FiUser className="text-orange-500 text-lg" />
                                                </div>
                                                <span className="text-gray-800 font-medium">{usuario.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FiMail className="text-gray-400" size={16} />
                                                <span className="text-gray-600">{usuario.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize border ${getRolColor(usuario.rol)}`}
                                            >
                                                {usuario.rol}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleUsuarioActivo(usuario)}
                                                disabled={saving}
                                                className="focus:outline-none transition-transform hover:scale-105"
                                            >
                                                {usuario.activo !== false ? (
                                                    <FaToggleOn className="text-3xl text-orange-500" />
                                                ) : (
                                                    <FaToggleOff className="text-3xl text-gray-400" />
                                                )}
                                            </button>
                                            <div className={`text-sm font-medium mt-1 ${usuario.activo !== false ? 'text-green-600' : 'text-gray-500'}`}>
                                                {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => openEditModal(usuario)}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg transition-colors"
                                                    title="Editar usuario"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Crear Usuario */}
                {isCreateModalOpen && (
                    <CreateModal
                        title="Agregar Nuevo Usuario"
                        onClose={() => {
                            setCreateModalOpen(false);
                            createForm.reset();
                        }}
                        onSubmit={createForm.handleSubmit(handleCrearUsuario)}
                        register={createForm.register}
                        errors={createForm.formState.errors}
                        saving={saving}
                    />
                )}

                {/* Modal Editar Usuario */}
                {isEditModalOpen && (
                    <EditModal
                        title="Editar Usuario"
                        onClose={() => {
                            setEditModalOpen(false);
                            setEditingUser(null);
                            editForm.reset();
                        }}
                        onSubmit={editForm.handleSubmit(handleEditarUsuario)}
                        register={editForm.register}
                        errors={editForm.formState.errors}
                        saving={saving}
                    />
                )}
            </div>
        </div>
    );
}

// Componente Modal para Crear Usuario
function CreateModal({ title, onClose, onSubmit, register, errors, saving }: CreateModalProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
                {/* Header del Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FiUser className="text-orange-500" />
                        {title}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                        onClick={onClose}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nombre Completo *
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                {...register("nombre")}
                                placeholder="Ej: Carlos Pérez"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                        </div>
                        {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Correo Electrónico *
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="ejemplo@correo.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                        </div>
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Contraseña *
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("contraseña")}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        {errors.contraseña && <p className="text-red-600 text-sm mt-1">{errors.contraseña.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Rol *
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                            <select
                                {...register("rol")}
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white appearance-none"
                            >
                                <option value="">Selecciona un rol...</option>
                                <option value="admin">Administrador</option>
                                <option value="repartidor">Repartidor</option>
                                <option value="dueno">Propietario</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                        </div>
                        {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <TbFidgetSpinner className="animate-spin" />
                                    <span>Creando...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    <span>Crear Usuario</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Componente Modal para Editar Usuario
function EditModal({ title, onClose, onSubmit, register, errors, saving }: EditModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
                {/* Header del Modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <FiEdit2 className="text-orange-500" />
                        {title}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                        onClick={onClose}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nombre Completo *
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                {...register("nombre")}
                                placeholder="Ej: Carlos Pérez"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                        </div>
                        {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Correo Electrónico *
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="ejemplo@correo.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                            />
                        </div>
                        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Rol *
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-3 text-gray-400" />
                            <select
                                {...register("rol")}
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white appearance-none"
                            >
                                <option value="">Selecciona un rol...</option>
                                <option value="admin">Administrador</option>
                                <option value="repartidor">Repartidor</option>
                                <option value="dueno">Propietario</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-3 text-gray-400" />
                        </div>
                        {errors.rol && <p className="text-red-600 text-sm mt-1">{errors.rol.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <TbFidgetSpinner className="animate-spin" />
                                    <span>Actualizando...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    <span>Actualizar Usuario</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}