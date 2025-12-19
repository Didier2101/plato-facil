// src/modules/admin/productos/components/FormAgregarProducto.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import {
    Image as FileText,
    Tag,
    DollarSign,
    Plus,
    X,
    Package,
    AlertCircle,
    CheckCircle,
    Info,
} from 'lucide-react';
import Loading from '@/src/shared/components/ui/Loading';
import { PageHeader } from '@/src/shared/components';
import { useCategorias, useIngredientes, useCrearProducto } from '../hooks';
import { type CrearProductoData } from '../schemas/productoSchema';
import type { IngredienteFrontend as Ingrediente } from '../types/producto';
import ProductImageUploader from './ProductImageUploader';
import { toast } from '@/src/shared/services/toast.service';

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
        crearCategoria,
        cargarCategorias
    } = useCategorias();

    const {
        ingredientes,
        loading: loadingIngredientes,
        crearIngrediente,
        cargarIngredientes
    } = useIngredientes();

    // Hook para crear producto con optimización de imágenes
    const {
        form,
        crearProducto,
        submitting,
        error: productoError,
        setPreviewImage,
        optimizationStats,
        clearError: clearProductoError
    } = useCrearProducto();

    // Estados locales
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteSeleccionado[]>([]);
    const [nuevoIngrediente, setNuevoIngrediente] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        cargarCategorias();
        cargarIngredientes();
    }, [cargarCategorias, cargarIngredientes]);

    // Handlers
    const handleCrearCategoria = async () => {
        if (!nuevaCategoria.trim()) return;

        const result = await crearCategoria({
            nombre: nuevaCategoria,
            activo: true,
        });
        if (result.success && result.categoria) {
            // Establecer la nueva categoría como seleccionada
            form.setValue('categoria_id', result.categoria.id);
            setNuevaCategoria('');
            setShowNewCategory(false);
        }
    };

    const handleCrearIngrediente = async () => {
        if (!nuevoIngrediente.trim()) return;

        const result = await crearIngrediente({
            nombre: nuevoIngrediente,
            activo: true,
        });
        if (result.success && result.ingrediente) {
            // Agregar ingrediente a la lista de seleccionados
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
            // Crear un FileList artificial para el formulario
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            const fileList = dataTransfer.files;

            form.setValue('imagen', fileList);
            form.clearErrors('imagen');

            // Crear URL para preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewImage(objectUrl);
        } else {
            form.setValue('imagen', undefined);
            setPreviewImage(null);
        }
    }, [form, setPreviewImage]);

    const handleSubmitForm = useCallback(async (data: CrearProductoData) => {
        // Verificar si hay ingredientes seleccionados
        if (ingredientesSeleccionados.length === 0) {
            const confirmed = await new Promise((resolve) => {
                toast.warning('Producto sin personalización', {
                    description: 'Este producto no tendrá ingredientes personalizables. ¿Deseas continuar?',
                    duration: 5000,
                    action: {
                        label: 'Continuar',
                        onClick: () => resolve(true),
                    },
                    cancel: {
                        label: 'Cancelar',
                        onClick: () => resolve(false),
                    },
                });
            });

            if (!confirmed) return;
        }

        // Verificar ingredientes obligatorios si hay ingredientes
        if (ingredientesSeleccionados.length > 0) {
            const obligatorios = ingredientesSeleccionados.filter(ing => ing.obligatorio);
            if (obligatorios.length === 0) {
                const confirmed = await new Promise((resolve) => {
                    toast.warning('Sin ingredientes obligatorios', {
                        description: 'Todos los ingredientes son opcionales. ¿Estás seguro?',
                        duration: 5000,
                        action: {
                            label: 'Sí, continuar',
                            onClick: () => resolve(true),
                        },
                        cancel: {
                            label: 'Revisar',
                            onClick: () => resolve(false),
                        },
                    });
                });

                if (!confirmed) return;
            }
        }

        // Agregar ingredientes seleccionados a los datos
        const dataConIngredientes = {
            ...data,
            ingredientes: ingredientesSeleccionados
        };

        const result = await crearProducto(dataConIngredientes);

        // Resetear solo si fue exitoso
        if (result.success) {
            // Limpiar estados locales
            setIngredientesSeleccionados([]);
            setShowNewCategory(false);
            setNuevaCategoria('');
            setNuevoIngrediente('');

            // Mostrar opción para crear otro producto
            toast.success('¡Producto creado!', {
                description: '¿Deseas crear otro producto?',
                duration: 5000,
                action: {
                    label: 'Sí, crear otro',
                    onClick: () => {
                        // Solo resetear el formulario, no los otros estados
                        form.reset();
                        setPreviewImage(null);
                    },
                },
            });
        }
    }, [crearProducto, form, ingredientesSeleccionados, setPreviewImage]);

    const ingredientesObligatorios = ingredientesSeleccionados.filter(ing => ing.obligatorio);
    const ingredientesOpcionales = ingredientesSeleccionados.filter(ing => !ing.obligatorio);

    // Si está cargando, mostrar spinner
    if (loadingCategorias || loadingIngredientes) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading
                    texto="Cargando formulario..."
                    tamaño="grande"
                    color="orange-500"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <PageHeader
                title="Agregar Nuevo Producto"
                description="Crea un producto personalizable para tu menú"
                icon={<Package />}
                variant="productos"
                showBorder={true}
            />

            <div className=" px-6 py-8">
                <form
                    onSubmit={form.handleSubmit(handleSubmitForm)}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    {/* Header del formulario */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-500 text-white p-4 sm:p-6">
                        <div className="flex items-center gap-3">
                            <Package size={28} />
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">Crear Producto</h2>
                                <p className="text-gray-300 text-sm">Completa la información del producto</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                        {/* Información básica */}
                        <section className="space-y-4 sm:space-y-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                                Información básica
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Imagen */}
                                <div className="lg:col-span-2">
                                    <ProductImageUploader
                                        onImageUpload={handleImageUpload}
                                        label="Imagen del producto"
                                        maxSizeMB={5}
                                    />
                                    {form.formState.errors.imagen && (
                                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {form.formState.errors.imagen.message}
                                        </p>
                                    )}

                                    {/* Estadísticas de optimización del hook */}
                                    {optimizationStats.reductionPercentage && (
                                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 text-green-700 text-sm">
                                                <CheckCircle size={16} />
                                                <span className="font-medium">Imagen optimizada:</span>
                                                <span>{optimizationStats.reductionPercentage}% de reducción</span>
                                            </div>
                                            <p className="text-xs text-green-600 mt-1">
                                                Formato final: {optimizationStats.format?.toUpperCase()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Nombre */}
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Nombre del producto *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileText className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            {...form.register('nombre')}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${form.formState.errors.nombre
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300'
                                                }`}
                                            placeholder="Ej. Hamburguesa Especial"
                                        />
                                    </div>
                                    {form.formState.errors.nombre && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {form.formState.errors.nombre.message}
                                        </p>
                                    )}
                                </div>

                                {/* Precio */}
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Precio *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            {...form.register('precio', { valueAsNumber: true })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${form.formState.errors.precio
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300'
                                                }`}
                                            placeholder="15000"
                                        />
                                    </div>
                                    {form.formState.errors.precio && (
                                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {form.formState.errors.precio.message}
                                        </p>
                                    )}
                                </div>

                                {/* Categoría */}
                                <div className="lg:col-span-2">
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Categoría *
                                    </label>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Tag className="text-gray-400" size={20} />
                                            </div>
                                            <select
                                                {...form.register('categoria_id')}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${form.formState.errors.categoria_id
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Selecciona una categoría</option>
                                                {categorias.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {!showNewCategory ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewCategory(true)}
                                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors text-sm"
                                            >
                                                <Plus size={16} />
                                                Crear nueva categoría
                                            </button>
                                        ) : (
                                            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                                <input
                                                    type="text"
                                                    value={nuevaCategoria}
                                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                                    placeholder="Nombre de la nueva categoría"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && nuevaCategoria.trim()) {
                                                            e.preventDefault();
                                                            handleCrearCategoria();
                                                        }
                                                    }}
                                                />
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={handleCrearCategoria}
                                                        disabled={!nuevaCategoria.trim()}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                                    >
                                                        Crear
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewCategory(false);
                                                            setNuevaCategoria('');
                                                        }}
                                                        className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-300 rounded-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {form.formState.errors.categoria_id && (
                                            <p className="text-red-500 text-sm flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                {form.formState.errors.categoria_id.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="lg:col-span-2">
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        {...form.register('descripcion')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                        rows={3}
                                        placeholder="Describe los ingredientes principales y características especiales del producto..."
                                    />
                                    {form.formState.errors.descripcion && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {form.formState.errors.descripcion.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Ingredientes */}
                        <section className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                                        Ingredientes (Opcional)
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Agrega ingredientes solo si deseas que el producto sea personalizable
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {ingredientesSeleccionados.length} ingrediente{ingredientesSeleccionados.length !== 1 ? 's' : ''} seleccionado{ingredientesSeleccionados.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            {loadingIngredientes ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                                    <p className="text-gray-500">Cargando ingredientes...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Ingredientes disponibles */}
                                    <div>
                                        <h4 className="text-md sm:text-lg font-medium text-gray-700 mb-3">
                                            Ingredientes disponibles
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-100 overflow-y-auto pb-2 rounded-lg">
                                            {ingredientes
                                                .filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id.toString()))
                                                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                .map((ing) => (
                                                    <button
                                                        key={ing.id}
                                                        type="button"
                                                        onClick={() => handleSelectIngrediente(ing)}
                                                        className="px-2 py-2 bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-orange-700 rounded-lg text-xs sm:text-sm font-medium transition-all hover:border-orange-300 shadow-sm"
                                                    >
                                                        + {ing.nombre}
                                                    </button>
                                                ))}
                                            {ingredientes.filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id.toString())).length === 0 && (
                                                <div className="col-span-full text-center text-gray-500 py-4 text-sm">
                                                    Todos los ingredientes han sido seleccionados
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Ingredientes seleccionados */}
                                    {ingredientesSeleccionados.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                <h4 className="text-md sm:text-lg font-medium text-gray-700">
                                                    Ingredientes del producto
                                                </h4>
                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIngredientesSeleccionados(prev =>
                                                                prev.map(ing => ({ ...ing, obligatorio: true }))
                                                            );
                                                        }}
                                                        className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                                                    >
                                                        Todos obligatorios
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIngredientesSeleccionados(prev =>
                                                                prev.map(ing => ({ ...ing, obligatorio: false }))
                                                            );
                                                        }}
                                                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        Todos opcionales
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Obligatorios */}
                                            {ingredientesObligatorios.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-orange-700 mb-3 flex items-center">
                                                        <CheckCircle size={16} className="mr-2" />
                                                        Ingredientes principales ({ingredientesObligatorios.length})
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {ingredientesObligatorios.map((ing) => (
                                                            <div
                                                                key={ing.id}
                                                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-orange-50 px-4 py-3 rounded-lg border border-orange-200 gap-2"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-orange-800">{ing.nombre}</span>
                                                                    <span className="text-xs text-orange-600 bg-orange-200 px-2 py-1 rounded-full">
                                                                        Obligatorio
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleObligatorio(ing.id)}
                                                                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Hacer opcional
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeIngrediente(ing.id)}
                                                                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                                                        title="Quitar ingrediente"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Opcionales */}
                                            {ingredientesOpcionales.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                                        <Info size={16} className="mr-2" />
                                                        Ingredientes personalizables ({ingredientesOpcionales.length})
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {ingredientesOpcionales.map((ing) => (
                                                            <div
                                                                key={ing.id}
                                                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-300 gap-2"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-gray-800">{ing.nombre}</span>
                                                                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                                                                        Opcional
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleObligatorio(ing.id)}
                                                                        className="text-xs px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors"
                                                                    >
                                                                        Hacer obligatorio
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeIngrediente(ing.id)}
                                                                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                                                        title="Quitar ingrediente"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Crear nuevo ingrediente */}
                                    <div className="pt-6">
                                        <h5 className="text-md font-medium text-gray-700 mb-3">
                                            ¿No encuentras un ingrediente?
                                        </h5>
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <input
                                                type="text"
                                                value={nuevoIngrediente}
                                                onChange={(e) => setNuevoIngrediente(e.target.value)}
                                                placeholder="Nombre del nuevo ingrediente"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-full"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && nuevoIngrediente.trim()) {
                                                        e.preventDefault();
                                                        handleCrearIngrediente();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCrearIngrediente}
                                                disabled={!nuevoIngrediente.trim()}
                                                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Plus size={16} />
                                                    Crear ingrediente
                                                </div>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            El nuevo ingrediente se agregará automáticamente como opcional
                                        </p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Error del producto */}
                        {productoError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-medium text-red-800">Error al crear producto</h4>
                                        <p className="text-sm text-red-700 mt-1">{productoError}</p>
                                        <button
                                            type="button"
                                            onClick={clearProductoError}
                                            className="text-xs text-red-600 hover:text-red-800 mt-2"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón de envío */}
                        <div className="border-t border-gray-200 pt-6 sm:pt-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl py-3 sm:py-4 text-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                                        Creando producto...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} className="sm:w-6 sm:h-6" />
                                        Agregar producto al menú
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-3">
                                {ingredientesSeleccionados.length === 0
                                    ? "✨ Los ingredientes son opcionales - puedes crear el producto sin ellos"
                                    : `✅ Producto con ${ingredientesSeleccionados.length} ingrediente${ingredientesSeleccionados.length !== 1 ? 's' : ''}`
                                }
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}