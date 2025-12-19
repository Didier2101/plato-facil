"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, Edit, Trash2, Save, Image as ImageIcon, Plus, Minus, AlertCircle, ChevronDown, CheckCircle } from "lucide-react";
import Image from "next/image";
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import { formatearPrecioCOP, formatearNumero } from "@/src/shared/utils/precio";
import { capitalizarSoloPrimera } from "@/src/shared/utils/texto";
import { useDetalleProducto } from "../hooks/useDetalleProducto";

interface Props {
    producto: ProductoFrontend;
    onCerrar: () => void;
    onProductoActualizado: (producto: ProductoFrontend) => void;
    onProductoEliminado: (productoId: string) => void;
    isMobile?: boolean;
}

export default function DetalleProducto({
    producto,
    onCerrar,
    onProductoActualizado,
    onProductoEliminado,
    isMobile = false
}: Props) {
    const {
        modoEdicion,
        setModoEdicion,
        loading,
        datosEdicion,
        setDatosEdicion,
        previewImagen,
        ingredientesSeleccionados,
        ingredientesNoSeleccionados,
        cargandoIngredientes,
        categorias,
        cargandoCategorias,
        confirmandoCambioEstado,
        setConfirmandoCambioEstado,
        handleAgregarIngrediente,
        handleQuitarIngrediente,
        handleToggleObligatorio,
        handleGuardarCambios,
        handleCambiarEstado,
        handleCancelarEdicion,
        handleCambioImagen,
        handleEliminarImagen,
        handleCambioPrecio
    } = useDetalleProducto({
        producto,
        onProductoActualizado,
        onProductoEliminado,
        onCerrar
    });

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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                <ImageIcon className="text-orange-500" />
                                Imagen del Producto
                            </h4>

                            {modoEdicion ? (
                                <div className="space-y-4">
                                    <div className="relative w-full h-64 lg:h-80 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
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
                                            Formatos: JPG, PNG, WEBP • Máximo 5MB (Se optimizará automáticamente)
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full h-64 lg:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
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
                                <p className="text-xl font-bold text-gray-900">
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

                            <div className="sm:col-span-1 bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <div className="text-center">
                                    {modoEdicion ? (
                                        <div className="relative">
                                            <select
                                                value={datosEdicion.categoria_id}
                                                onChange={(e) => setDatosEdicion(prev => ({ ...prev, categoria_id: e.target.value }))}
                                                className="w-full pl-4 pr-10 py-2 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-400 appearance-none font-medium text-purple-900"
                                                disabled={loading || cargandoCategorias}
                                            >
                                                <option value="">Selecciona categoría</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-purple-500">
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-lg font-semibold text-purple-800 bg-purple-200 px-4 py-2 rounded-full">
                                            {producto.categoria}
                                        </span>
                                    )}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {ingredientesSeleccionados.map(ing => (
                                            <div
                                                key={ing.ingrediente_id}
                                                className="flex items-center justify-between bg-white p-3 rounded-lg border border-yellow-300 shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="font-medium text-gray-800">
                                                        {capitalizarSoloPrimera(ing.nombre)}
                                                    </span>

                                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {ingredientesSeleccionados.map(ing => (
                                        <div
                                            key={ing.ingrediente_id}
                                            className="flex items-center gap-3 bg-white p-3 rounded-lg border border-yellow-300 shadow-sm"
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
        handleToggleObligatorio,
        categorias,
        cargandoCategorias,
        setDatosEdicion
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
                ) : confirmandoCambioEstado ? (
                    <div className="w-full bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-inner">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-orange-800 font-bold text-sm">¿Confirmas {producto.activo ? 'desactivar' : 'activar'} este producto?</p>
                                <p className="text-orange-600 text-xs">
                                    {producto.activo
                                        ? "Ya no estará visible para los clientes."
                                        : "Volverá a estar visible en el menú."}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setConfirmandoCambioEstado(false)}
                                className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                                disabled={loading}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCambiarEstado}
                                className={`flex-1 px-4 py-2 ${producto.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg transition-colors text-sm font-bold shadow-sm`}
                                disabled={loading}
                            >
                                {loading
                                    ? (producto.activo ? "Desactivando..." : "Activando...")
                                    : (producto.activo ? "Sí, desactivar" : "Sí, activar")}
                            </button>
                        </div>
                    </div>
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
                            onClick={() => setConfirmandoCambioEstado(true)}
                            className={`flex items-center justify-center px-6 py-3 bg-gradient-to-r ${producto.activo ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} text-white rounded-xl hover:brightness-110 transition-all shadow-lg disabled:opacity-50 font-semibold ${isMobile ? 'w-full' : 'flex-1'}`}
                            disabled={loading}
                        >
                            {producto.activo ? (
                                <Trash2 size={18} className="mr-2" />
                            ) : (
                                <CheckCircle size={18} className="mr-2" />
                            )}
                            {producto.activo ? "Desactivar" : "Activar"}
                        </button>
                    </>
                )}
            </div>
        );
    }, [
        modoEdicion,
        loading,
        isMobile,
        producto.activo,
        handleCancelarEdicion,
        handleGuardarCambios,
        handleCambiarEstado,
        confirmandoCambioEstado,
        setConfirmandoCambioEstado,
        setModoEdicion
    ]);

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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
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

                <div className="p-8 flex-1 overflow-y-auto">
                    {panelContent}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    {footerContent}
                </div>
            </motion.div>
        </motion.div>
    );
}