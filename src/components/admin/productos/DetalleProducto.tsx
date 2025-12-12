"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Edit, Trash2, Save, Image as ImageIcon, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import type { ProductoFrontend } from "@/src/types/producto";
import { actualizarProductoAction } from "@/src/actions/actualizarProductoAction";
import { formatearPrecioCOP, formatearNumero, limpiarNumero, validarPrecio } from "@/src/utils/precio";
import { capitalizarSoloPrimera } from "@/src/utils/texto";
import { desactivarProductoAction } from "@/src/actions/desactivarProductoAction";
import { obtenerIngredientesAction } from "@/src/actions/obtenerIngredientesAction";

interface Props {
    producto: ProductoFrontend;
    onCerrar: () => void;
    onProductoActualizado: (producto: ProductoFrontend) => void;
    onProductoEliminado: (productoId: string) => void;
    isMobile?: boolean;
}

interface IngredienteDisponible {
    id: string;
    nombre: string;
    activo: boolean;
}

interface IngredienteSeleccionado {
    ingrediente_id: string;
    nombre: string;
    obligatorio: boolean;
}

export default function DetalleProducto({
    producto,
    onCerrar,
    onProductoActualizado,
    onProductoEliminado,
    isMobile = false
}: Props) {
    const [modoEdicion, setModoEdicion] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
    const [previewImagen, setPreviewImagen] = useState<string | null>(null);

    const [ingredientesDisponibles, setIngredientesDisponibles] = useState<IngredienteDisponible[]>([]);
    const [cargandoIngredientes, setCargandoIngredientes] = useState(false);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteSeleccionado[]>([]);

    const [datosEdicion, setDatosEdicion] = useState({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        activo: producto.activo
    });

    useEffect(() => {
        cargarIngredientesDisponibles();

        if (producto.ingredientes) {
            const ingredientesIniciales = producto.ingredientes.map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                obligatorio: pi.obligatorio
            }));
            setIngredientesSeleccionados(ingredientesIniciales);
        }
    }, [producto]);

    const cargarIngredientesDisponibles = async () => {
        setCargandoIngredientes(true);
        try {
            const result = await obtenerIngredientesAction();
            if (result.success && result.ingredientes) {
                setIngredientesDisponibles(result.ingredientes);
            }
        } catch (error) {
            console.error('Error cargando ingredientes:', error);
        } finally {
            setCargandoIngredientes(false);
        }
    };

    const handleAgregarIngrediente = useCallback((ingrediente: IngredienteDisponible) => {
        if (ingredientesSeleccionados.some(i => i.ingrediente_id === ingrediente.id)) {
            return;
        }

        setIngredientesSeleccionados(prev => [...prev, {
            ingrediente_id: ingrediente.id,
            nombre: ingrediente.nombre,
            obligatorio: true
        }]);
    }, [ingredientesSeleccionados]);

    const handleQuitarIngrediente = useCallback((ingredienteId: string) => {
        setIngredientesSeleccionados(prev =>
            prev.filter(i => i.ingrediente_id !== ingredienteId)
        );
    }, []);

    const handleToggleObligatorio = useCallback((ingredienteId: string) => {
        setIngredientesSeleccionados(prev =>
            prev.map(i =>
                i.ingrediente_id === ingredienteId
                    ? { ...i, obligatorio: !i.obligatorio }
                    : i
            )
        );
    }, []);

    const handleGuardarCambios = useCallback(async () => {
        if (!datosEdicion.nombre.trim()) {
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "El nombre es requerido",
                timer: 2500,
                showConfirmButton: false,
            });
            return;
        }

        if (datosEdicion.precio <= 0 || !validarPrecio(datosEdicion.precio)) {
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "El precio debe ser mayor a 0",
                timer: 2500,
                showConfirmButton: false,
            });
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("nombre", datosEdicion.nombre.trim());
            formData.append("descripcion", datosEdicion.descripcion.trim());
            formData.append("precio", datosEdicion.precio.toString());
            formData.append("activo", datosEdicion.activo.toString());
            formData.append("ingredientes", JSON.stringify(ingredientesSeleccionados));

            if (nuevaImagen) {
                formData.append("imagen", nuevaImagen);
            }

            const result = await actualizarProductoAction(String(producto.id), formData);

            if (!result.success) {
                Swal.fire({
                    toast: true,
                    icon: "error",
                    position: "top-end",
                    title: result.error,
                    timer: 2500,
                    showConfirmButton: false,
                });
                return;
            }

            if (result.producto) {
                onProductoActualizado(result.producto);
                Swal.fire({
                    toast: true,
                    icon: "success",
                    position: "top-end",
                    title: "Producto actualizado correctamente",
                    timer: 2500,
                    showConfirmButton: false,
                });
                setModoEdicion(false);
                setNuevaImagen(null);
                setPreviewImagen(null);
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "No se pudo actualizar el producto",
                timer: 2500,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    }, [datosEdicion, nuevaImagen, ingredientesSeleccionados, producto.id, onProductoActualizado]);

    const handleEliminar = useCallback(async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres desactivar el producto "${producto.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);

        try {
            const deleteResult = await desactivarProductoAction(String(producto.id));

            if (!deleteResult.success) {
                Swal.fire({
                    toast: true,
                    icon: "error",
                    position: "top-end",
                    title: deleteResult.error,
                    timer: 2500,
                    showConfirmButton: false,
                });
                return;
            }

            onProductoEliminado(String(producto.id));
            Swal.fire({
                toast: true,
                icon: "success",
                position: "top-end",
                title: "Producto eliminado correctamente",
                timer: 2500,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error('Error eliminando producto:', error);
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "No se pudo eliminar el producto",
                timer: 2500,
                showConfirmButton: false,
            });
        } finally {
            setLoading(false);
        }
    }, [producto.id, producto.nombre, onProductoEliminado]);

    const handleCancelarEdicion = useCallback(() => {
        setDatosEdicion({
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            activo: producto.activo
        });

        if (producto.ingredientes) {
            const ingredientesIniciales = producto.ingredientes.map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                obligatorio: pi.obligatorio
            }));
            setIngredientesSeleccionados(ingredientesIniciales);
        }

        setNuevaImagen(null);
        setPreviewImagen(null);
        setModoEdicion(false);
    }, [producto]);

    const handleCambioImagen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "Tipo de archivo no permitido. Solo JPG, PNG, WEBP",
                timer: 2500,
                showConfirmButton: false,
            });
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "La imagen es demasiado grande. Máximo 5MB",
                timer: 2500,
                showConfirmButton: false,
            });
            return;
        }

        setNuevaImagen(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImagen(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleEliminarImagen = useCallback(() => {
        setNuevaImagen(null);
        setPreviewImagen(null);
    }, []);

    const handleCambioPrecio = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        const precio = limpiarNumero(valor);
        setDatosEdicion(prev => ({ ...prev, precio }));
    }, []);

    const ingredientesNoSeleccionados = useMemo(() => {
        return ingredientesDisponibles.filter(
            ing => !ingredientesSeleccionados.some(sel => sel.ingrediente_id === ing.id)
        );
    }, [ingredientesDisponibles, ingredientesSeleccionados]);

    const panelContent = useMemo(() => {
        return (
            <div className="space-y-6">
                <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="font-semibold text-gray-800">
                        {capitalizarSoloPrimera(producto.nombre)}
                    </p>
                    <p className="text-sm text-gray-600">
                        Categoría: {producto.categoria}
                    </p>
                    <p className="text-xs text-gray-500">
                        ID: {producto.id}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <ImageIcon className="text-orange-500" />
                                Imagen del Producto
                            </h4>

                            {modoEdicion ? (
                                <div className="space-y-4">
                                    <div className="relative w-full h-48 lg:h-64 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                                        {previewImagen ? (
                                            <>
                                                <Image
                                                    src={previewImagen}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    priority
                                                />
                                                <button
                                                    onClick={handleEliminarImagen}
                                                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg z-10"
                                                    disabled={loading}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : producto.imagen_url ? (
                                            <Image
                                                src={producto.imagen_url}
                                                alt={producto.nombre}
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <div className="text-center">
                                                    <ImageIcon size={32} className="mx-auto mb-2" />
                                                    <p>Sin imagen</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCambioImagen}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                            disabled={loading}
                                        />
                                        <p className="text-sm text-gray-500 mt-2 text-center">
                                            Formatos: JPG, PNG, WEBP • Máximo 5MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-48 lg:h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
                                    {producto.imagen_url ? (
                                        <Image
                                            src={producto.imagen_url}
                                            alt={producto.nombre}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <div className="text-center">
                                                <ImageIcon size={48} className="mx-auto mb-2" />
                                                <p className="text-lg">Sin imagen</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="hidden lg:block bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado del Producto
                            </label>
                            {modoEdicion ? (
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={datosEdicion.activo}
                                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, activo: e.target.checked }))}
                                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                        disabled={loading}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Producto activo</span>
                                </label>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${producto.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={`text-sm font-semibold ${producto.activo ? 'text-green-700' : 'text-red-700'}`}>
                                        {producto.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Producto
                            </label>
                            {modoEdicion ? (
                                <input
                                    type="text"
                                    value={datosEdicion.nombre}
                                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                                    disabled={loading}
                                    placeholder="Ingresa el nombre del producto"
                                />
                            ) : (
                                <p className="text-lg font-bold text-gray-900">
                                    {capitalizarSoloPrimera(producto.nombre)}
                                </p>
                            )}
                        </div>

                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción
                            </label>
                            {modoEdicion ? (
                                <textarea
                                    value={datosEdicion.descripcion}
                                    onChange={(e) => setDatosEdicion(prev => ({ ...prev, descripcion: e.target.value }))}
                                    rows={4}
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors resize-none"
                                    disabled={loading}
                                    placeholder="Describe el producto..."
                                />
                            ) : (
                                <p className="text-gray-700 leading-relaxed">
                                    {producto.descripcion
                                        ? capitalizarSoloPrimera(producto.descripcion)
                                        : "Este producto no tiene descripción."
                                    }
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio
                                </label>
                                {modoEdicion ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            value={formatearNumero(datosEdicion.precio)}
                                            onChange={handleCambioPrecio}
                                            className="w-full pl-8 pr-3 py-2 font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-right"
                                            disabled={loading}
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-green-700">
                                            {formatearPrecioCOP(producto.precio)}
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">Pesos colombianos</p>
                                    </div>
                                )}
                            </div>

                            <div className="lg:hidden bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                {modoEdicion ? (
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={datosEdicion.activo}
                                            onChange={(e) => setDatosEdicion(prev => ({ ...prev, activo: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            disabled={loading}
                                        />
                                        <span className="text-sm font-medium text-gray-700">Activo</span>
                                    </label>
                                ) : (
                                    <div className="flex items-center space-x-2 justify-center">
                                        <div className={`w-3 h-3 rounded-full ${producto.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className={`text-sm font-semibold ${producto.activo ? 'text-green-700' : 'text-red-700'}`}>
                                            {producto.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="sm:col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <div className="text-center">
                                    <span className="text-lg font-semibold text-purple-800 bg-purple-200 px-4 py-2 rounded-full">
                                        {producto.categoria}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE INGREDIENTES */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        🥗 Ingredientes del Producto
                    </h4>

                    {modoEdicion ? (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    Ingredientes actuales ({ingredientesSeleccionados.length})
                                </p>

                                {ingredientesSeleccionados.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No hay ingredientes agregados</p>
                                        <p className="text-sm">Agrega ingredientes desde el selector de abajo</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {ingredientesSeleccionados.map(ing => (
                                            <div
                                                key={ing.ingrediente_id}
                                                className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-300"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="font-medium text-gray-800">
                                                        {capitalizarSoloPrimera(ing.nombre)}
                                                    </span>

                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={ing.obligatorio}
                                                            onChange={() => handleToggleObligatorio(ing.ingrediente_id)}
                                                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                                        />
                                                        <span className={ing.obligatorio ? "text-orange-600 font-semibold" : "text-gray-500"}>
                                                            Obligatorio
                                                        </span>
                                                    </label>
                                                </div>

                                                <button
                                                    onClick={() => handleQuitarIngrediente(ing.ingrediente_id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    disabled={loading}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    Agregar ingredientes
                                </p>

                                {cargandoIngredientes ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                                    </div>
                                ) : ingredientesNoSeleccionados.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                        <p>No hay más ingredientes disponibles</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
                                        {ingredientesNoSeleccionados.map(ing => (
                                            <button
                                                key={ing.id}
                                                onClick={() => handleAgregarIngrediente(ing)}
                                                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-orange-100 border border-gray-300 hover:border-orange-300 rounded-lg transition-colors text-left"
                                                disabled={loading}
                                            >
                                                <Plus size={14} className="text-orange-600 flex-shrink-0" />
                                                <span className="truncate">{capitalizarSoloPrimera(ing.nombre)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {ingredientesSeleccionados.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Este producto no tiene ingredientes configurados</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ingredientesSeleccionados.map(ing => (
                                        <div
                                            key={ing.ingrediente_id}
                                            className="flex items-center gap-3 bg-white p-3 rounded-lg border border-yellow-300"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">
                                                    {capitalizarSoloPrimera(ing.nombre)}
                                                </p>
                                                <p className={`text-xs ${ing.obligatorio ? "text-orange-600 font-semibold" : "text-gray-500"}`}>
                                                    {ing.obligatorio ? "Obligatorio" : "Opcional"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }, [
        producto,
        modoEdicion,
        loading,
        datosEdicion,
        previewImagen,
        ingredientesSeleccionados,
        ingredientesNoSeleccionados,
        cargandoIngredientes,
        handleEliminarImagen,
        handleCambioImagen,
        handleCambioPrecio,
        handleAgregarIngrediente,
        handleQuitarIngrediente,
        handleToggleObligatorio
    ]);

    const footerContent = useMemo(() => {
        return (
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 w-full`}>
                {modoEdicion ? (
                    <>
                        <button
                            onClick={handleCancelarEdicion}
                            className={`flex items-center justify-center px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-semibold ${isMobile ? 'w-full' : 'flex-1'}`}
                            disabled={loading}
                        >
                            <X size={18} className="mr-2" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleGuardarCambios}
                            className={`flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 font-semibold ${isMobile ? 'w-full' : 'flex-1'}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save size={18} className="mr-2" />
                            )}
                            Guardar Cambios
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setModoEdicion(true)}
                            className={`flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg font-semibold ${isMobile ? 'w-full' : 'flex-1'}`}
                            disabled={loading}
                        >
                            <Edit size={18} className="mr-2" />
                            Editar Producto
                        </button>
                        <button
                            onClick={handleEliminar}
                            className={`flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 font-semibold ${isMobile ? 'w-full' : 'flex-1'}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Trash2 size={18} className="mr-2" />
                            )}
                            Desactivar
                        </button>
                    </>
                )}
            </div>
        );
    }, [modoEdicion, loading, isMobile, handleCancelarEdicion, handleGuardarCambios, handleEliminar]);

    if (isMobile) {
        return (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black z-40"
                    onClick={onCerrar}
                />

                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(event, info) => {
                        if (info.offset.y > 100) {
                            onCerrar();
                        }
                    }}
                >
                    <div
                        className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
                        onClick={onCerrar}
                    />

                    <div className="px-6 border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">
                                {modoEdicion ? "Editar Producto" : "Detalles del Producto"}
                            </h3>
                            <button
                                onClick={onCerrar}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                disabled={loading}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {panelContent}
                    </div>

                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        {footerContent}
                    </div>
                </motion.div>
            </>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                    <h3 className="text-2xl font-bold text-gray-800">
                        {modoEdicion ? "Editar Producto" : "Detalles del Producto"}
                    </h3>
                    <button
                        onClick={onCerrar}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {panelContent}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    {footerContent}
                </div>
            </motion.div>
        </motion.div>
    );
}