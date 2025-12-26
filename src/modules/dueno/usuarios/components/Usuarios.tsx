// src/modules/dueno/usuarios/components/Usuarios.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Search, Filter, ShieldCheck, UserPlus } from 'lucide-react';
import Loading from '@/src/shared/components/ui/Loading';
import { ErrorState } from '@/src/shared/components';
import { useUsuariosData } from '../hooks/useUsuariosData';
import { useUsuariosMutaciones } from '../hooks/useUsuariosMutaciones';
import { crearUsuarioSchema, editarUsuarioSchema, type CrearUsuarioData, type EditarUsuarioData } from '../schemas/usuarioSchema';
import type { Usuario } from '../types/usuarioTypes';
import UsuariosStats from './UsuariosStats';
import UsuariosTable from './UsuariosTable';
import CrearUsuarioModal from './CrearUsuarioModal';
import EditarUsuarioModal from './EditarUsuarioModal';
import { AnimatePresence } from 'framer-motion';

export default function Usuarios() {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const onSubmitCreate = createForm.handleSubmit(async (data) => {
        await handleCrearUsuario(data);
    });

    const onSubmitEdit = editForm.handleSubmit(async (data) => {
        await handleEditarUsuario(data);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loading
                    texto="Sincronizando equipo..."
                    subtexto="Preparando panel de gestión"
                    tamaño="grande"
                />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                title="Error de Conexión"
                retryText="Reintentar Sincronización"
                onRetry={() => {
                    clearError();
                    cargarUsuarios();
                }}
            />
        );
    }

    const filteredUsuarios = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Premium Header */}
            <header className="bg-white border-b border-slate-100 pt-12 pb-8 px-8 md:px-12 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                            <Users className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                                Equipo <span className="text-orange-500 opacity-50">/</span> Gestión
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                {usuarios.length} Miembros Activos en el Sistema
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group flex-1 md:w-80">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="BUSCAR MIEMBRO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all font-black text-slate-900 text-[10px] uppercase tracking-widest placeholder:text-slate-300"
                            />
                        </div>

                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-slate-900 hover:bg-orange-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-orange-200 transition-all flex items-center gap-3 active:scale-95 whitespace-nowrap"
                        >
                            <UserPlus className="h-4 w-4" />
                            Añadir Miembro
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 md:px-12 py-12 space-y-12">
                {/* Stats Section */}
                <UsuariosStats usuarios={usuarios} />

                {/* Table Section */}
                <div className="bg-white rounded-[3rem] p-4 border-2 border-slate-50 shadow-xl shadow-slate-100/50 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-orange-500" />
                            <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Listado de Seguridad</h2>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                            <Filter className="h-3 w-3 text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Filtrado por relevancia</span>
                        </div>
                    </div>

                    <UsuariosTable
                        usuarios={filteredUsuarios}
                        onEdit={handleOpenEditModal}
                        onToggleActivo={handleToggleUsuario}
                        saving={saving}
                    />
                </div>
            </main>

            {/* Modales */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <CrearUsuarioModal
                        isOpen={isCreateModalOpen}
                        onClose={handleCloseCreateModal}
                        onSubmit={onSubmitCreate}
                        register={createForm.register}
                        errors={createForm.formState.errors}
                        saving={saving}
                    />
                )}

                {isEditModalOpen && (
                    <EditarUsuarioModal
                        isOpen={isEditModalOpen}
                        onClose={handleCloseEditModal}
                        onSubmit={onSubmitEdit}
                        register={editForm.register}
                        errors={editForm.formState.errors}
                        saving={saving}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}