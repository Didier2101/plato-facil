"use client";

import { useState } from "react";
import { X, Edit, Trash2, Save } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
import type { ProductoFrontend } from "@/src/types/producto";
import { actualizarProductoAction } from "@/src/actions/actualizarProductoAction";
import { eliminarProductoAction } from "@/src/actions/eliminarProductoAction";
import { formatearPrecioCOP, formatearNumero, limpiarNumero, validarPrecio } from "@/src/utils/precio";
import { capitalizarSoloPrimera } from "@/src/utils/texto";

interface Props {
    producto: ProductoFrontend;
    onCerrar: () => void;
    onProductoActualizado: (producto: ProductoFrontend) => void;
    onProductoEliminado: (productoId: string) => void;
}

export default function DetalleProducto({ producto, onCerrar, onProductoActualizado, onProductoEliminado }: Props) {
    const [modoEdicion, setModoEdicion] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
    const [previewImagen, setPreviewImagen] = useState<string | null>(null);
    const [datosEdicion, setDatosEdicion] = useState({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        activo: producto.activo
    });

    const handleGuardarCambios = async () => {
        if (!datosEdicion.nombre.trim()) {
            Swal.fire("❌ Error", "El nombre es requerido", "error");
            return;
        }

        if (datosEdicion.precio <= 0 || !validarPrecio(datosEdicion.precio)) {
            Swal.fire("❌ Error", "El precio debe ser mayor a 0", "error");
            return;
        }

        setLoading(true);

        try {
            // Si hay una nueva imagen, crear FormData, sino solo enviar datos
            if (nuevaImagen) {
                const formData = new FormData();
                formData.append("nombre", datosEdicion.nombre.trim());
                formData.append("descripcion", datosEdicion.descripcion.trim());
                formData.append("precio", datosEdicion.precio.toString());
                formData.append("activo", datosEdicion.activo.toString());
                formData.append("imagen", nuevaImagen);

                const result = await actualizarProductoAction(String(producto.id), formData);

                if (!result.success) {
                    Swal.fire("❌ Error", result.error, "error");
                    return;
                }

                if (result.producto) {
                    onProductoActualizado(result.producto);
                    Swal.fire("✅ Actualizado", "Producto actualizado correctamente", "success");
                    setModoEdicion(false);
                    setNuevaImagen(null);
                    setPreviewImagen(null);
                }
            } else {
                // Solo actualizar datos sin imagen
                const result = await actualizarProductoAction(String(producto.id), datosEdicion);

                if (!result.success) {
                    Swal.fire("❌ Error", result.error, "error");
                    return;
                }

                if (result.producto) {
                    onProductoActualizado(result.producto);
                    Swal.fire("✅ Actualizado", "Producto actualizado correctamente", "success");
                    setModoEdicion(false);
                }
            }

        } catch (error) {
            console.error('Error actualizando producto:', error);
            Swal.fire("❌ Error", "No se pudo actualizar el producto", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Quieres eliminar el producto "${producto.nombre}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);

        try {
            const deleteResult = await eliminarProductoAction(String(producto.id));

            if (!deleteResult.success) {
                Swal.fire("❌ Error", deleteResult.error, "error");
                return;
            }

            onProductoEliminado(String(producto.id));
            Swal.fire("✅ Eliminado", "Producto eliminado correctamente", "success");

        } catch (error) {
            console.error('Error eliminando producto:', error);
            Swal.fire("❌ Error", "No se pudo eliminar el producto", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarEdicion = () => {
        setDatosEdicion({
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            activo: producto.activo
        });
        setNuevaImagen(null);
        setPreviewImagen(null);
        setModoEdicion(false);
    };

    const handleCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            Swal.fire("❌ Error", "Tipo de archivo no permitido. Solo JPG, PNG, WEBP", "error");
            return;
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            Swal.fire("❌ Error", "La imagen es demasiado grande. Máximo 5MB", "error");
            return;
        }

        setNuevaImagen(file);

        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImagen(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleEliminarImagen = () => {
        setNuevaImagen(null);
        setPreviewImagen(null);
    };

    const handleCambioPrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        // Permitir solo números
        const precio = limpiarNumero(valor);
        setDatosEdicion(prev => ({ ...prev, precio }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-200">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {modoEdicion ? "Editar Producto" : "Detalles del Producto"}
                    </h2>
                    <button
                        onClick={onCerrar}
                        className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Contenido - Layout de dos columnas */}
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Columna izquierda - Imagen */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-lg font-semibold text-gray-700 mb-4">
                                    Imagen del producto
                                </label>
                                {modoEdicion ? (
                                    <div className="space-y-6">
                                        {/* Preview de imagen actual o nueva */}
                                        <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
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
                                                        type="button"
                                                        onClick={handleEliminarImagen}
                                                        className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg z-10"
                                                        disabled={loading}
                                                    >
                                                        <X size={20} />
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
                                                <div className="flex items-center justify-center h-full text-gray-400 text-lg">
                                                    <div className="text-center">
                                                        <div className="text-4xl mb-2">📸</div>
                                                        <p>Sin imagen</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Input para cambiar imagen */}
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCambioImagen}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                                disabled={loading}
                                            />
                                            <p className="text-sm text-gray-500 mt-2 text-center">
                                                Formatos: JPG, PNG, WEBP • Máximo 5MB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Modo vista
                                    <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
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
                                                    <div className="text-6xl mb-4">🍽️</div>
                                                    <p className="text-xl">Sin imagen</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Estado */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    Estado del Producto
                                </label>
                                {modoEdicion ? (
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={datosEdicion.activo}
                                            onChange={(e) => setDatosEdicion(prev => ({ ...prev, activo: e.target.checked }))}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            disabled={loading}
                                        />
                                        <span className="text-lg font-medium text-gray-700">Producto activo</span>
                                    </label>
                                ) : (
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-4 h-4 rounded-full ${producto.activo ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className={`text-lg font-semibold ${producto.activo ? 'text-green-700' : 'text-red-700'}`}>
                                            {producto.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Columna derecha - Información */}
                        <div className="space-y-6">
                            {/* Nombre */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    Nombre del Producto
                                </label>
                                {modoEdicion ? (
                                    <input
                                        type="text"
                                        value={datosEdicion.nombre}
                                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, nombre: e.target.value }))}
                                        className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={loading}
                                        placeholder="Ingresa el nombre del producto"
                                    />
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">  {capitalizarSoloPrimera(producto.nombre)}
                                    </p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    Descripción
                                </label>
                                {modoEdicion ? (
                                    <textarea
                                        value={datosEdicion.descripcion}
                                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, descripcion: e.target.value }))}
                                        rows={4}
                                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                        disabled={loading}
                                        placeholder="Describe el producto..."
                                    />
                                ) : (
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        {producto.descripcion
                                            ? capitalizarSoloPrimera(producto.descripcion)
                                            : "Este producto no tiene descripción."
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Precio y Categoría */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Precio
                                    </label>
                                    {modoEdicion ? (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-lg">
                                                    $
                                                </span>
                                                <input
                                                    type="text"
                                                    value={formatearNumero(datosEdicion.precio)}
                                                    onChange={handleCambioPrecio}
                                                    className="w-full pl-8 pr-4 py-3 text-xl font-semibold border border-gray-300 rounded-xl focus:ring-3 focus:ring-green-500 focus:border-green-500 transition-colors text-right"
                                                    disabled={loading}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 text-center">
                                                Precio en pesos colombianos
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-700 mb-1">
                                                {formatearPrecioCOP(producto.precio)}
                                            </div>
                                            <p className="text-sm text-green-600 font-medium">
                                                Pesos colombianos
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                                        Categoría
                                    </label>
                                    <div className="flex flex-col items-center space-y-2">
                                        <span className="text-lg font-semibold text-purple-800 bg-purple-200 px-4 py-2 rounded-full text-center">
                                            {producto.categoria}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer con botones */}
                <div className="flex justify-between items-center p-8 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
                    {modoEdicion ? (
                        <div className="flex space-x-4">
                            <button
                                onClick={handleCancelarEdicion}
                                className="flex items-center px-6 py-3 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors font-semibold text-lg"
                                disabled={loading}
                            >
                                <X size={20} className="mr-2" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardarCambios}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 font-semibold text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Save size={20} className="mr-2" />
                                )}
                                Guardar Cambios
                            </button>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setModoEdicion(true)}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-semibold text-lg"
                                disabled={loading}
                            >
                                <Edit size={20} className="mr-2" />
                                Editar Producto
                            </button>
                            <button
                                onClick={handleEliminar}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 font-semibold text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                ) : (
                                    <Trash2 size={20} className="mr-2" />
                                )}
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}