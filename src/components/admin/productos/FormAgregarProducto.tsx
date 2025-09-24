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
            { id: ingrediente.id, nombre: ingrediente.nombre, obligatorio: false },
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
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire("Error", "La imagen no debe superar los 5MB", "error");
            return;
        }
        setPreview(URL.createObjectURL(file));
    };

    const onSubmitForm: SubmitHandler<FormData> = async (data) => {
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
        <div className="p-6">
            <div className="">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 rounded-2xl shadow-lg">
                            <Package className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agregar Nuevo Producto</h1>
                            <p className="text-gray-600">Crea un producto personalizable para tu menú</p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmitForm)}
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
                                {/* Imagen - Ocupa 2 columnas en desktop */}
                                <div className="lg:col-span-2">
                                    <label className="block mb-3 font-medium text-gray-700">
                                        Imagen del producto
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-start gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                {...register("imagen")}
                                                onChange={handleImageChange}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 file:font-medium transition-colors"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Formatos: JPG, PNG, WebP. Tamaño máximo: 5MB
                                            </p>
                                        </div>
                                        {preview && (
                                            <div className="relative">
                                                <Image
                                                    src={preview}
                                                    alt="Vista previa"
                                                    width={120}
                                                    height={120}
                                                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreview(null);
                                                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                                                        if (fileInput) fileInput.value = '';
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${errors.nombre ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${errors.precio ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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

                                {/* Categoría - Ocupa 2 columnas en desktop */}
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
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all ${errors.categoria_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
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
                                                        if (e.key === "Enter" && !creandoCategoria && nuevaCategoria.trim()) {
                                                            e.preventDefault();
                                                            crearCategoria();
                                                        }
                                                    }}
                                                />
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={crearCategoria}
                                                        disabled={creandoCategoria || !nuevaCategoria.trim()}
                                                        className="flex-1 sm:flex-none px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                                    >
                                                        {creandoCategoria ? "Creando..." : "Crear"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewCategory(false);
                                                            setNuevaCategoria("");
                                                        }}
                                                        className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors border border-gray-300 rounded-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
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

                                {/* Descripción - Ocupa 2 columnas en desktop */}
                                <div className="lg:col-span-2">
                                    <label className="block mb-2 font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        {...register("descripcion")}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                        rows={3}
                                        placeholder="Describe los ingredientes principales y características especiales del producto..."
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Ingredientes */}
                        <section className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Ingredientes</h3>
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
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 max-h-40 overflow-y-auto pb-2 rounded-lg ">
                                            {ingredientes
                                                .filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id))
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
                                            {ingredientes.filter(ing => !ingredientesSeleccionados.find(sel => sel.id === ing.id)).length === 0 && (
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
                                    <div className=" pt-6">
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
                                                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
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
                            <div className="bg-gradient-to-r from-gray-50 to-orange-50 border border-gray-300 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <Info size={18} className="mr-2" />
                                    Guía de ingredientes para personalización
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className="text-orange-600" />
                                            <span className="font-medium text-orange-700">Ingredientes obligatorios</span>
                                        </div>
                                        <p className="text-gray-600 text-xs ml-6">
                                            No se pueden quitar del producto. Ideales para ingredientes base como pan, carne principal, etc.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Info size={16} className="text-gray-600" />
                                            <span className="font-medium text-gray-700">Ingredientes opcionales</span>
                                        </div>
                                        <p className="text-gray-600 text-xs ml-6">
                                            El cliente puede quitarlos en su pedido. Perfectos para salsas, vegetales, extras, etc.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Resumen del producto */}
                        {ingredientesSeleccionados.length > 0 && (
                            <section className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg p-4 sm:p-6 border border-gray-300">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                                    <Package size={20} className="mr-2" />
                                    Resumen del producto
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-800">{ingredientesSeleccionados.length}</div>
                                        <div className="text-xs sm:text-sm text-gray-600">Total ingredientes</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-orange-200">
                                        <div className="text-xl sm:text-2xl font-bold text-orange-600">{ingredientesObligatorios.length}</div>
                                        <div className="text-xs sm:text-sm text-gray-600">Obligatorios</div>
                                    </div>
                                    <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-600">{ingredientesOpcionales.length}</div>
                                        <div className="text-xs sm:text-sm text-gray-600">Personalizables</div>
                                    </div>
                                </div>

                                {ingredientesSeleccionados.length > 0 && (
                                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-2">Vista previa para el cliente:</p>
                                        <div className="text-xs text-gray-500">
                                            {ingredientesObligatorios.length > 0 && (
                                                <span className="text-orange-600">
                                                    Incluye: {ingredientesObligatorios.map(ing => ing.nombre).join(", ")}
                                                </span>
                                            )}
                                            {ingredientesObligatorios.length > 0 && ingredientesOpcionales.length > 0 && " | "}
                                            {ingredientesOpcionales.length > 0 && (
                                                <span className="text-gray-600">
                                                    Personalizable: {ingredientesOpcionales.map(ing => ing.nombre).join(", ")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Botón de envío */}
                        <div className="border-t border-gray-200 pt-6 sm:pt-8">
                            <button
                                type="submit"
                                disabled={submitting || ingredientesSeleccionados.length === 0}
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

                            {ingredientesSeleccionados.length === 0 && (
                                <p className="text-center text-sm text-gray-500 mt-2">
                                    Agrega al menos un ingrediente para continuar
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}