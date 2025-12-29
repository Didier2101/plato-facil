'use client';

import React, { useState, useCallback } from 'react';
import {
    Type,
    Tag,
    DollarSign,
    Plus,
    X,
    Package,
    AlertCircle,
    CheckCircle,
    Info,
    LayoutGrid,
    Truck,
    Settings,
    ChevronRight,
    Sparkles,
    Trash2,
    PlusCircle
} from 'lucide-react';
import Loading from '@/src/shared/components/ui/Loading';
import { PageHeader } from '@/src/shared/components';
import { useCategorias, useIngredientes, useCrearProducto } from '../hooks';
import { type CrearProductoData } from '../schemas/productoSchema';
import type { IngredienteFrontend as Ingrediente } from '../types/producto';
import ProductImageUploader from './ProductImageUploader';
import { toast } from '@/src/shared/services/toast.service';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos locales
interface IngredienteSeleccionado {
    id: string;
    nombre: string;
    obligatorio: boolean;
}

export default function FormAgregarProducto() {
    // Hooks personalizados
    const {
        categorias,
        loading: loadingCategorias,
        crearCategoria
    } = useCategorias();

    const {
        ingredientes,
        loading: loadingIngredientes,
        crearIngrediente
    } = useIngredientes();

    // Hook para crear producto
    const {
        form,
        crearProducto,
        submitting,
        error: productoError,
        setPreviewImage,
        clearError: clearProductoError
    } = useCrearProducto();

    // Estados locales
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteSeleccionado[]>([]);
    const [nuevoIngrediente, setNuevoIngrediente] = useState('');
    const [busquedaIngrediente, setBusquedaIngrediente] = useState('');

    // handeleMemo
    const ingredientesFiltrados = React.useMemo(() => {
        return ingredientes
            .filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id.toString()))
            .filter(ing => ing.nombre.toLowerCase().includes(busquedaIngrediente.toLowerCase()));
    }, [ingredientes, ingredientesSeleccionados, busquedaIngrediente]);



    // Handlers
    const handleCrearCategoria = async () => {
        if (!nuevaCategoria.trim()) return;
        const result = await crearCategoria({ nombre: nuevaCategoria, activo: true });
        if (result.success && result.categoria) {
            form.setValue('categoria_id', result.categoria.id);
            setNuevaCategoria('');
            setShowNewCategory(false);
        }
    };

    const handleCrearIngrediente = async () => {
        if (!nuevoIngrediente.trim()) return;
        const result = await crearIngrediente({ nombre: nuevoIngrediente, activo: true });
        if (result.success && result.ingrediente) {
            setIngredientesSeleccionados(prev => [...prev, {
                id: result.ingrediente!.id.toString(),
                nombre: result.ingrediente!.nombre,
                obligatorio: false
            }]);
            setNuevoIngrediente('');
        }
    };

    const handleSelectIngrediente = (ingrediente: Ingrediente) => {
        if (ingredientesSeleccionados.find((i) => i.id === ingrediente.id.toString())) return;
        setIngredientesSeleccionados((prev) => [
            ...prev,
            { id: ingrediente.id.toString(), nombre: ingrediente.nombre, obligatorio: false },
        ]);
    };

    const toggleObligatorio = (id: string) => {
        setIngredientesSeleccionados((prev) =>
            prev.map((ing) =>
                ing.id === id ? { ...ing, obligatorio: !ing.obligatorio } : ing
            )
        );
    };

    const removeIngrediente = (id: string) => {
        setIngredientesSeleccionados((prev) =>
            prev.filter((ing) => ing.id !== id)
        );
    };

    const handleImageUpload = useCallback((file: File | null) => {
        if (file) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            form.setValue('imagen', dataTransfer.files);
            form.clearErrors('imagen');
            setPreviewImage(URL.createObjectURL(file));
        } else {
            form.setValue('imagen', undefined);
            setPreviewImage(null);
        }
    }, [form, setPreviewImage]);

    const handleSubmitForm = useCallback(async (data: CrearProductoData) => {
        if (ingredientesSeleccionados.length === 0) {
            const confirmed = await new Promise((resolve) => {
                toast.warning('Producto sin personalización', {
                    description: '¿Deseas continuar sin ingredientes?',
                    action: { label: 'Continuar', onClick: () => resolve(true) },
                    cancel: { label: 'Cancelar', onClick: () => resolve(false) },
                });
            });
            if (!confirmed) return;
        }

        const result = await crearProducto({ ...data, ingredientes: ingredientesSeleccionados });
        if (result.success) {
            // Limpiar todos los estados
            form.reset();
            setPreviewImage(null);
            setIngredientesSeleccionados([]);
            setShowNewCategory(false);
            setNuevaCategoria('');
            setNuevoIngrediente('');
            setBusquedaIngrediente('');

            toast.success('¡Éxito Gastronómico!', {
                description: 'Producto desplegado en el menú elite.',
                duration: 3000,
            });
        }
    }, [crearProducto, form, ingredientesSeleccionados, setPreviewImage]);

    if (loadingCategorias || loadingIngredientes) {
        return <Loading texto="Sincronizando Menú Elite..." tamaño="mediano" color="orange-500" />;
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
    };



    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <PageHeader
                title="Nuevo Producto Elite"
                description="Diseña una experiencia culinaria premium"
                icon={<Package className="h-8 w-8 text-orange-500" />}
                variant="productos"
                showBorder={true}
            />

            <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12">
                <form onSubmit={form.handleSubmit(handleSubmitForm)} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Media & Primary Info */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-4 space-y-10"
                    >
                        {/* Section: Identity */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl shadow-slate-200/50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Identidad Visual</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Impacto de marca</p>
                                </div>
                            </div>

                            <ProductImageUploader
                                onImageUpload={handleImageUpload}
                                label="Fotografía de Producto"
                                maxSizeMB={10}
                            />

                            {form.formState.errors.imagen && (
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                                    <AlertCircle size={14} /> {form.formState.errors.imagen.message}
                                </p>
                            )}
                        </div>

                        {/* Section: Quick Config */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Settings size={120} />
                            </div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-500 border border-white/10">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">Logística Vital</h3>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Parámetros operativos</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 block">Inversión del Cliente</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <DollarSign className="text-orange-500" size={20} />
                                            </div>
                                            <input
                                                type="number"
                                                {...form.register('precio', { valueAsNumber: true })}
                                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xl font-black focus:bg-white/10 focus:border-orange-500 outline-none transition-all placeholder:text-white/20"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        {form.formState.errors.precio && (
                                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2">{form.formState.errors.precio.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Details & Customization */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-8 space-y-10"
                    >
                        {/* Section: Technical specs */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white">
                                        <LayoutGrid size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Ficha Técnica</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Estructura del producto</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Nombre del Producto</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                <Type className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                {...form.register('nombre')}
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all"
                                                placeholder="Ej. Smash Burger Trufada"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Categoría de Destino</label>
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                                    <Tag className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                                </div>
                                                <select
                                                    {...form.register('categoria_id')}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">Selección de Categoría</option>
                                                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                                                </select>
                                                <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none text-slate-400">
                                                    <ChevronRight size={18} className="rotate-90" />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {showNewCategory ? (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex gap-3"
                                                    >
                                                        <input
                                                            value={nuevaCategoria}
                                                            onChange={e => setNuevaCategoria(e.target.value)}
                                                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold font-medium"
                                                            placeholder="Nueva categoría..."
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleCrearCategoria}
                                                            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600"
                                                        >
                                                            Crear
                                                        </button>
                                                        <button type="button" onClick={() => setShowNewCategory(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                                    </motion.div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewCategory(true)}
                                                        className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:translate-x-1 transition-transform"
                                                    >
                                                        <PlusCircle size={14} /> Nueva Categoría
                                                    </button>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Relato Gastronómico (Descripción)</label>
                                    <textarea
                                        {...form.register('descripcion')}
                                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all resize-none h-[188px]"
                                        placeholder="Describe la experiencia, ingredientes y sensaciones..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Customization Gallery */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-white">
                                        <PlusCircle size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Galería de Personalización</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ingredientes y extras</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                {/* Ingredientes Disponibles */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Selección de Inventario
                                    </h4>

                                    {/* Buscador de Ingredientes */}
                                    <div className="relative mb-6 group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={busquedaIngrediente}
                                            onChange={(e) => setBusquedaIngrediente(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Buscar ingrediente..."
                                        />
                                        {busquedaIngrediente && (
                                            <button
                                                type="button"
                                                onClick={() => setBusquedaIngrediente('')}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <AnimatePresence mode="popLayout">
                                            {ingredientesFiltrados.map(ing => (
                                                <motion.button
                                                    key={ing.id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ duration: 0.2 }}
                                                    type="button"
                                                    onClick={() => handleSelectIngrediente(ing)}
                                                    className="px-5 py-2.5 bg-slate-100 hover:bg-orange-600 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                                                >
                                                    + {ing.nombre}
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>

                                        {/* States handling */}
                                        {ingredientes.length === 0 ? (
                                            <div className="w-full text-center py-8">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    No hay ingredientes en el inventario
                                                </p>
                                            </div>
                                        ) : ingredientesFiltrados.length === 0 && (
                                            <div className="w-full text-center py-8">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    {busquedaIngrediente
                                                        ? 'No se encontraron ingredientes'
                                                        : 'Todos los ingredientes disponibles están seleccionados'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ingredientes Activos */}
                                {ingredientesSeleccionados.length > 0 && (
                                    <div className="space-y-6 pt-6 border-t border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Personalización Activa
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ingredientesSeleccionados.map(ing => (
                                                <motion.div
                                                    key={ing.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${ing.obligatorio ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${ing.obligatorio ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                            {ing.obligatorio ? <CheckCircle size={16} /> : <Info size={16} />}
                                                        </div>
                                                        <span className={`text-xs font-black uppercase tracking-tight ${ing.obligatorio ? 'text-orange-900' : 'text-slate-600'}`}>{ing.nombre}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleObligatorio(ing.id)}
                                                            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${ing.obligatorio ? 'text-orange-600 hover:bg-orange-100' : 'text-slate-400 hover:bg-slate-200'}`}
                                                        >
                                                            {ing.obligatorio ? 'REQUERIDO' : 'OPCIONAL'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeIngrediente(ing.id)}
                                                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Crear Nuevo Ingrediente Fast */}
                                <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative flex-1 group w-full">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Plus size={16} className="text-slate-400" />
                                        </div>
                                        <input
                                            value={nuevoIngrediente}
                                            onChange={e => setNuevoIngrediente(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Registrar nuevo ingrediente..."
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCrearIngrediente}
                                        disabled={!nuevoIngrediente.trim()}
                                        className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all disabled:opacity-30 shadow-xl shadow-slate-900/10"
                                    >
                                        Agregar al Inventario
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Context */}
                        <AnimatePresence>
                            {productoError && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-6 bg-red-500 text-white rounded-[2rem] flex items-center gap-6 shadow-2xl shadow-red-500/30"
                                >
                                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                        <AlertCircle size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black uppercase tracking-tighter">Interrupción en Despliegue</h4>
                                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1">{productoError}</p>
                                    </div>
                                    <button onClick={clearProductoError} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full lg:w-[400px] h-20 bg-orange-500 text-white rounded-[2rem] relative overflow-hidden group shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <div className="relative z-10 flex items-center justify-center gap-4">
                                    {submitting ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                                    ) : (
                                        <Plus size={24} />
                                    )}
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">
                                        {submitting ? 'Desplegando...' : 'Publicar Producto Elite'}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}