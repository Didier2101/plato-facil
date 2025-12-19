// src/modules/dueno/usuarios/components/Usuarios.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiPlus, FiUsers } from 'react-icons/fi';
import Loading from '@/src/shared/components/ui/Loading';
import { ErrorState, PageHeader } from '@/src/shared/components';
import { useUsuariosData } from '../hooks/useUsuariosData';
import { useUsuariosMutaciones } from '../hooks/useUsuariosMutaciones';
import { crearUsuarioSchema, editarUsuarioSchema, type CrearUsuarioData, type EditarUsuarioData } from '../schemas/usuarioSchema';
import type { Usuario } from '../types/usuarioTypes';
import UsuariosStats from './UsuariosStats';
import UsuariosTable from './UsuariosTable';
import CrearUsuarioModal from './CrearUsuarioModal';
import EditarUsuarioModal from './EditarUsuarioModal';

export default function Usuarios() {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

    // Hooks
    const { usuarios, loading, error, cargarUsuarios, clearError } = useUsuariosData();
    const { crearUsuario, editarUsuario, toggleUsuario, saving } = useUsuariosMutaciones();

    // Formularios
    const createForm = useForm<CrearUsuarioData>({
        resolver: zodResolver(crearUsuarioSchema),
        defaultValues: {
            nombre: '',
            email: '',
            rol: 'repartidor',
            contraseña: ''
        }
    });

    const editForm = useForm<EditarUsuarioData>({
        resolver: zodResolver(editarUsuarioSchema),
        defaultValues: {
            nombre: '',
            email: '',
            rol: 'repartidor'
        }
    });

    // Cargar usuarios al iniciar
    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    // Handlers
    const handleCrearUsuario = useCallback(async (data: CrearUsuarioData) => {
        const result = await crearUsuario(data);
        if (result.success && result.usuario) {
            setCreateModalOpen(false);
            createForm.reset();
            await cargarUsuarios();
        }
    }, [crearUsuario, cargarUsuarios, createForm]);

    const handleEditarUsuario = useCallback(async (data: EditarUsuarioData) => {
        if (!editingUsuario) return;

        const result = await editarUsuario(editingUsuario.id, data);
        if (result.success && result.usuario) {
            setEditModalOpen(false);
            setEditingUsuario(null);
            editForm.reset();
            await cargarUsuarios();
        }
    }, [editarUsuario, editingUsuario, cargarUsuarios, editForm]);

    const handleToggleUsuario = useCallback(async (usuario: Usuario) => {
        const result = await toggleUsuario(usuario.id, !usuario.activo);
        if (result.success) {
            await cargarUsuarios();
        }
    }, [toggleUsuario, cargarUsuarios]);

    const handleOpenEditModal = useCallback((usuario: Usuario) => {
        setEditingUsuario(usuario);
        editForm.reset({
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        });
        setEditModalOpen(true);
    }, [editForm]);

    const handleCloseCreateModal = useCallback(() => {
        setCreateModalOpen(false);
        createForm.reset();
    }, [createForm]);

    const handleCloseEditModal = useCallback(() => {
        setEditModalOpen(false);
        setEditingUsuario(null);
        editForm.reset();
    }, [editForm]);

    // Handlers para los formularios con preventDefault
    const onSubmitCreate = createForm.handleSubmit(async (data) => {
        await handleCrearUsuario(data);
    });

    const onSubmitEdit = editForm.handleSubmit(async (data) => {
        await handleEditarUsuario(data);
    });

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

    if (error) {
        return (
            <ErrorState
                message={error}
                title="Error al cargar usuarios"
                retryText="Reintentar"
                onRetry={() => {
                    clearError();
                    cargarUsuarios();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header reutilizable */}
            <PageHeader
                title="Gestión de Usuarios"
                description="Administra los usuarios del sistema"
                icon={<FiUsers />}
                variant="usuarios"
                showBorder={true}
                actions={
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md"
                    >
                        <FiPlus className="w-5 h-5" />
                        Nuevo Usuario
                    </button>
                }
            />

            <div className=" px-6 py-8 space-y-6">
                {/* Stats */}
                <UsuariosStats usuarios={usuarios} />

                {/* Table */}
                <UsuariosTable
                    usuarios={usuarios}
                    onEdit={handleOpenEditModal}
                    onToggleActivo={handleToggleUsuario}
                    saving={saving}
                />
            </div>

            {/* Modales */}
            <CrearUsuarioModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={onSubmitCreate}
                register={createForm.register}
                errors={createForm.formState.errors}
                saving={saving}
            />

            <EditarUsuarioModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                onSubmit={onSubmitEdit}
                register={editForm.register}
                errors={editForm.formState.errors}
                saving={saving}
            />
        </div>
    );
}