"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
} from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";

import {
    obtenerCategoriasAction,
    crearCategoriaAction,
} from "@/src/actions/categoriasActions";

import { crearProductoAction } from "@/src/actions/crearProductoAction";

import { obtenerIngredientesAction } from "@/src/actions/obtenerIngredientesAction";

import type { Categoria, Ingrediente } from "@/src/types/producto";
import { crearIngredienteAction } from "@/src/actions/ingredientesActions";

interface FormData {
    imagen: FileList;
    nombre: string;
    categoria_id: string;
    descripcion: string;
    precio: number;
}

export default function FormAgregarProducto() {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Categorías
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState("");
    const [creandoCategoria, setCreandoCategoria] = useState(false);

    // Ingredientes
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [loadingIngredientes, setLoadingIngredientes] = useState(true);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<
        { id: string; nombre: string; obligatorio: boolean }[]
    >([]);
    const [nuevoIngrediente, setNuevoIngrediente] = useState("");
    const [creandoIngrediente, setCreandoIngrediente] = useState(false);

    useEffect(() => {
        cargarCategorias();
        cargarIngredientes();
    }, []);

    const cargarCategorias = async () => {
        try {
            setLoadingCategorias(true);
            const result = await obtenerCategoriasAction();
            if (result.success && result.categorias) {
                setCategorias(result.categorias);
            }
        } catch (error) {
            console.error("Error cargando categorías:", error);
        } finally {
            setLoadingCategorias(false);
        }
    };

    const cargarIngredientes = async () => {
        try {
            setLoadingIngredientes(true);
            const result = await obtenerIngredientesAction();
            if (result.success && result.ingredientes) {
                setIngredientes(result.ingredientes);
            }
        } catch (error) {
            console.error("Error cargando ingredientes:", error);
        } finally {
            setLoadingIngredientes(false);
        }
    };

    const crearCategoria = async () => {
        if (!nuevaCategoria.trim()) return;
        setCreandoCategoria(true);
        try {
            const result = await crearCategoriaAction({ nombre: nuevaCategoria });
            if (result.success && result.categoria) {
                setCategorias((prev) => [...prev, result.categoria]);
                setValue("categoria_id", result.categoria.id);
                setNuevaCategoria("");
                setShowNewCategory(false);
                Swal.fire({
                    icon: "success",
                    title: "Categoría creada",
                    text: `${result.categoria.nombre} ha sido creada`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Error creando categoría:", error);
            Swal.fire("Error", "No se pudo crear la categoría", "error");
        } finally {
            setCreandoCategoria(false);
        }
    };

    const crearIngrediente = async () => {
        if (!nuevoIngrediente.trim()) return;
        setCreandoIngrediente(true);
        try {
            const result = await crearIngredienteAction({ nombre: nuevoIngrediente });
            if (result.success && result.ingrediente) {
                setIngredientes((prev) => [...prev, result.ingrediente]);
                // Agregar automáticamente como opcional
                setIngredientesSeleccionados(prev => [...prev, {
                    id: result.ingrediente.id,
                    nombre: result.ingrediente.nombre,
                    obligatorio: false
                }]);
                setNuevoIngrediente("");
                Swal.fire({
                    icon: "success",
                    title: "Ingrediente creado",
                    text: `${result.ingrediente.nombre} ha sido agregado como opcional`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Error creando ingrediente:", error);
            Swal.fire("Error", "No se pudo crear el ingrediente", "error");
        } finally {
            setCreandoIngrediente(false);
        }
    };

    const handleSelectIngrediente = (ingrediente: Ingrediente) => {
        if (ingredientesSeleccionados.find((i) => i.id === ingrediente.id)) return;
        setIngredientesSeleccionados((prev) => [
            ...prev,
            { id: ingrediente.id, nombre: ingrediente.nombre, obligatorio: false }, // Por defecto opcional
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files[0]) return;
        const file = files[0];
        if (!file.type.startsWith("image/")) {
            Swal.fire("Error", "Selecciona un archivo de imagen válido", "error");
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            Swal.fire("Error", "La imagen no debe superar los 5MB", "error");
            return;
        }
        setPreview(URL.createObjectURL(file));
    };

    const onSubmitForm: SubmitHandler<FormData> = async (data) => {
        // Validaciones adicionales
        if (ingredientesSeleccionados.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Sin ingredientes",
                text: "Agrega al menos un ingrediente al producto",
                confirmButtonText: "Ok"
            });
            return;
        }

        const obligatorios = ingredientesSeleccionados.filter(ing => ing.obligatorio);
        if (obligatorios.length === 0) {
            const result = await Swal.fire({
                icon: "question",
                title: "Sin ingredientes obligatorios",
                text: "Todos los ingredientes son opcionales. ¿Estás seguro?",
                showCancelButton: true,
                confirmButtonText: "Sí, continuar",
                cancelButtonText: "Revisar"
            });
            if (!result.isConfirmed) return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("nombre", data.nombre);
            formData.append("categoria_id", data.categoria_id);
            formData.append("descripcion", data.descripcion);
            formData.append("precio", data.precio.toString());
            if (data.imagen && data.imagen[0]) {
                formData.append("imagen", data.imagen[0]);
            }

            // Adjuntar ingredientes seleccionados
            formData.append("ingredientes", JSON.stringify(ingredientesSeleccionados));

            const result = await crearProductoAction(formData);

            if (!result.success) {
                Swal.fire(
                    "Error",
                    result.error || "No se pudo crear el producto",
                    "error"
                );
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Producto creado exitosamente",
                text: `${data.nombre} ha sido agregado al menú`,
                confirmButtonText: "Crear otro",
                showCancelButton: true,
                cancelButtonText: "Cerrar"
            }).then((result) => {
                if (result.isConfirmed) {
                    // Reset completo del formulario
                    reset();
                    setPreview(null);
                    setIngredientesSeleccionados([]);
                    setShowNewCategory(false);
                    setNuevaCategoria("");
                    setNuevoIngrediente("");
                }
            });

        } catch (error) {
            console.error("Error en submit:", error);
            Swal.fire("Error", "Error inesperado al crear el producto", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const ingredientesObligatorios = ingredientesSeleccionados.filter(ing => ing.obligatorio);
    const ingredientesOpcionales = ingredientesSeleccionados.filter(ing => !ing.obligatorio);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <form
                onSubmit={handleSubmit(onSubmitForm)}
                className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center gap-3">
                        <Package size={32} />
                        <div>
                            <h1 className="text-2xl font-bold">Agregar Nuevo Producto</h1>
                            <p className="text-blue-100">Crea un producto personalizable para tu menú</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Información básica */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                            Información básica
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Imagen */}
                            <div className="lg:col-span-2">
                                <label className="block mb-3 font-medium text-gray-700">
                                    Imagen del producto
                                </label>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("imagen")}
                                        onChange={handleImageChange}
                                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:font-medium"
                                    />
                                    {preview && (
                                        <div className="relative">
                                            <Image
                                                src={preview}
                                                alt="Vista previa"
                                                width={120}
                                                height={120}
                                                className="w-30 h-30 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreview(null);
                                                    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                                    if (fileInput) fileInput.value = '';
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB
                                </p>
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
                                        {...register("nombre", {
                                            required: "El nombre es requerido",
                                            minLength: { value: 2, message: "Mínimo 2 caracteres" }
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.nombre ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Ej. Hamburguesa Especial"
                                    />
                                </div>
                                {errors.nombre && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.nombre.message}
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
                                        {...register("precio", {
                                            valueAsNumber: true,
                                            required: "El precio es requerido",
                                            min: { value: 0.01, message: "El precio debe ser mayor a 0" }
                                        })}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.precio ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="15000"
                                    />
                                </div>
                                {errors.precio && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.precio.message}
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
                                            {...register("categoria_id", {
                                                required: "La categoría es requerida",
                                            })}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.categoria_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                                                }`}
                                            disabled={loadingCategorias}
                                        >
                                            <option value="">
                                                {loadingCategorias ? "Cargando..." : "Selecciona una categoría"}
                                            </option>
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
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                        >
                                            <Plus size={16} />
                                            Crear nueva categoría
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <input
                                                type="text"
                                                value={nuevaCategoria}
                                                onChange={(e) => setNuevaCategoria(e.target.value)}
                                                placeholder="Nombre de la nueva categoría"
                                                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter" && !creandoCategoria && nuevaCategoria.trim()) {
                                                        e.preventDefault();
                                                        crearCategoria();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={crearCategoria}
                                                disabled={creandoCategoria || !nuevaCategoria.trim()}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {creandoCategoria ? "Creando..." : "Crear"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategory(false);
                                                    setNuevaCategoria("");
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {errors.categoria_id && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.categoria_id.message}
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
                                    {...register("descripcion")}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    rows={3}
                                    placeholder="Describe los ingredientes principales y características especiales del producto..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Ingredientes */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">Ingredientes</h2>
                            <div className="text-sm text-gray-500">
                                {ingredientesSeleccionados.length} ingrediente{ingredientesSeleccionados.length !== 1 ? 's' : ''} seleccionado{ingredientesSeleccionados.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {loadingIngredientes ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-500">Cargando ingredientes...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Ingredientes disponibles */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-3">
                                        Ingredientes disponibles
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-lg border">
                                        {ingredientes
                                            .filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id))
                                            .map((ing) => (
                                                <button
                                                    key={ing.id}
                                                    type="button"
                                                    onClick={() => handleSelectIngrediente(ing)}
                                                    className="px-3 py-2 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-all border hover:border-blue-300 shadow-sm"
                                                >
                                                    + {ing.nombre}
                                                </button>
                                            ))}
                                        {ingredientes.filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id)).length === 0 && (
                                            <div className="col-span-full text-center text-gray-500 py-4">
                                                Todos los ingredientes han sido seleccionados
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ingredientes seleccionados */}
                                {ingredientesSeleccionados.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-700">
                                                Ingredientes del producto
                                            </h3>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIngredientesSeleccionados(prev =>
                                                            prev.map(ing => ({ ...ing, obligatorio: true }))
                                                        );
                                                    }}
                                                    className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
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
                                                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    Todos opcionales
                                                </button>
                                            </div>
                                        </div>

                                        {/* Obligatorios */}
                                        {ingredientesObligatorios.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center">
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Ingredientes principales ({ingredientesObligatorios.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {ingredientesObligatorios.map((ing) => (
                                                        <div
                                                            key={ing.id}
                                                            className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg border border-green-200"
                                                        >
                                                            <div>
                                                                <span className="font-medium text-green-800">{ing.nombre}</span>
                                                                <span className="text-xs text-green-600 ml-2 bg-green-200 px-2 py-1 rounded-full">
                                                                    Obligatorio
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleObligatorio(ing.id)}
                                                                    className="text-xs px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 transition-colors"
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
                                                <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
                                                    <Info size={16} className="mr-2" />
                                                    Ingredientes personalizables ({ingredientesOpcionales.length})
                                                </h4>
                                                <div className="space-y-2">
                                                    {ingredientesOpcionales.map((ing) => (
                                                        <div
                                                            key={ing.id}
                                                            className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg border border-blue-200"
                                                        >
                                                            <div>
                                                                <span className="font-medium text-blue-800">{ing.nombre}</span>
                                                                <span className="text-xs text-blue-600 ml-2 bg-blue-200 px-2 py-1 rounded-full">
                                                                    Opcional
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleObligatorio(ing.id)}
                                                                    className="text-xs px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors"
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
                                <div className="border-t pt-6">
                                    <h4 className="text-md font-medium text-gray-700 mb-3">
                                        ¿No encuentras un ingrediente?
                                    </h4>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                                        <input
                                            type="text"
                                            value={nuevoIngrediente}
                                            onChange={(e) => setNuevoIngrediente(e.target.value)}
                                            placeholder="Nombre del nuevo ingrediente"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter" && !creandoIngrediente && nuevoIngrediente.trim()) {
                                                    e.preventDefault();
                                                    crearIngrediente();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={crearIngrediente}
                                            disabled={creandoIngrediente || !nuevoIngrediente.trim()}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            {creandoIngrediente ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Creando...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Plus size={16} />
                                                    Crear ingrediente
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        El nuevo ingrediente se agregará automáticamente como opcional
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Guía para el usuario */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                                <Info size={18} className="mr-2" />
                                Guía de ingredientes para personalización
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-600" />
                                        <span className="font-medium text-green-700">Ingredientes obligatorios</span>
                                    </div>
                                    <p className="text-green-600 text-xs ml-6">
                                        No se pueden quitar del producto. Ideales para ingredientes base como pan, carne principal, etc.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Info size={16} className="text-blue-600" />
                                        <span className="font-medium text-blue-700">Ingredientes opcionales</span>
                                    </div>
                                    <p className="text-blue-600 text-xs ml-6">
                                        El cliente puede quitarlos en su pedido. Perfectos para salsas, vegetales, extras, etc.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Resumen del producto */}
                    {ingredientesSeleccionados.length > 0 && (
                        <section className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                <Package size={20} className="mr-2" />
                                Resumen del producto
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-gray-800">{ingredientesSeleccionados.length}</div>
                                    <div className="text-sm text-gray-600">Total ingredientes</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">{ingredientesObligatorios.length}</div>
                                    <div className="text-sm text-gray-600">Obligatorios</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-blue-600">{ingredientesOpcionales.length}</div>
                                    <div className="text-sm text-gray-600">Personalizables</div>
                                </div>
                            </div>

                            {ingredientesSeleccionados.length > 0 && (
                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                    <p className="text-sm text-gray-600 mb-2">Vista previa para el cliente:</p>
                                    <div className="text-xs text-gray-500">
                                        {ingredientesObligatorios.length > 0 && (
                                            <span className="text-green-600">
                                                Incluye: {ingredientesObligatorios.map(ing => ing.nombre).join(", ")}
                                            </span>
                                        )}
                                        {ingredientesObligatorios.length > 0 && ingredientesOpcionales.length > 0 && " | "}
                                        {ingredientesOpcionales.length > 0 && (
                                            <span className="text-blue-600">
                                                Personalizable: {ingredientesOpcionales.map(ing => ing.nombre).join(", ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Botón de envío */}
                    <div className="border-t pt-8">
                        <button
                            type="submit"
                            disabled={submitting || ingredientesSeleccionados.length === 0}
                            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    Creando producto...
                                </>
                            ) : (
                                <>
                                    <Plus size={24} />
                                    Agregar producto al menú
                                </>
                            )}
                        </button>

                        {ingredientesSeleccionados.length === 0 && (
                            <p className="text-center text-sm text-gray-500 mt-2">
                                Agrega al menos un ingrediente para continuar
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}