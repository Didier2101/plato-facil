"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Edit,
    Trash2,
    Save,
    Image as ImageIcon,
    Plus,
    Minus,
    AlertCircle,
    ChevronDown,
    CheckCircle,
    Utensils,
    DollarSign,
    Tag,
    Trash
} from "lucide-react";
import Image from "next/image";
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import { formatearPrecioCOP, formatearNumero } from "@/src/shared/utils/precio";
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
            <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Media Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-orange-500" />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                Activo Visual
                            </h4>
                        </div>

                        <div className="relative aspect-square lg:aspect-video rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 group shadow-inner">
                            {modoEdicion ? (
                                <>
                                    {previewImagen ? (
                                        <Image
                                            src={previewImagen}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : producto.imagen_url ? (
                                        <Image
                                            src={producto.imagen_url}
                                            alt={producto.nombre}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                                            <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sin Imagen</span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                                        <label className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 cursor-pointer hover:bg-orange-500 hover:text-white transition-all shadow-2xl">
                                            <Edit className="h-6 w-6" />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleCambioImagen} disabled={loading} />
                                        </label>
                                        {(previewImagen || producto.imagen_url) && (
                                            <button
                                                onClick={handleEliminarImagen}
                                                className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-2xl"
                                                disabled={loading}
                                            >
                                                <Trash className="h-6 w-6" />
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {producto.imagen_url ? (
                                        <Image
                                            src={producto.imagen_url}
                                            alt={producto.nombre}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 text-center">
                                            <ImageIcon className="h-16 w-16 mb-4 opacity-10" />
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-20 px-10">Este producto aún no cuenta con un activo visual de alta definición</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="bg-slate-50/50 rounded-[1.5rem] p-6 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-3 w-3 rounded-full ${producto.activo ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${producto.activo ? 'text-green-600' : 'text-red-600'}`}>
                                    {producto.activo ? "Canal Activo" : "Canal Inactivo"}
                                </span>
                            </div>
                            {modoEdicion && (
                                <button
                                    onClick={() => setDatosEdicion(prev => ({ ...prev, activo: !prev.activo }))}
                                    className={`h-10 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${datosEdicion.activo ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                        }`}
                                >
                                    {datosEdicion.activo ? 'Desactivar' : 'Activar'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Data Section */}
                    <div className="space-y-8">
                        {/* Title & Description */}
                        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                    <Utensils className="h-4 w-4 text-orange-500" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                                    Definición Técnica
                                </h4>
                            </div>

                            {modoEdicion ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={datosEdicion.nombre}
                                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, nombre: e.target.value }))}
                                        className="w-full text-2xl font-black text-slate-900 tracking-tighter uppercase p-0 border-none focus:ring-0 placeholder:text-slate-200"
                                        placeholder="NOMBRE DEL PRODUCTO"
                                    />
                                    <textarea
                                        value={datosEdicion.descripcion}
                                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, descripcion: e.target.value }))}
                                        className="w-full text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed p-0 border-none focus:ring-0 resize-none h-24 placeholder:text-slate-200"
                                        placeholder="DESCRIPCIÓN DETALLADA..."
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 line-clamp-2">
                                        {producto.nombre}
                                    </h1>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                        {producto.descripcion || "Sin descripción técnica disponible"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <DollarSign className="h-4 w-4 text-orange-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Inversión</h4>
                                </div>
                                {modoEdicion ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-orange-500">$</span>
                                        <input
                                            type="text"
                                            value={formatearNumero(datosEdicion.precio)}
                                            onChange={handleCambioPrecio}
                                            className="w-full bg-transparent border-none focus:ring-0 text-3xl font-black tracking-tighter appearance-none p-0"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-3xl font-black tracking-tighter">
                                        {formatearPrecioCOP(producto.precio)}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50">
                                <div className="flex items-center gap-3 mb-6">
                                    <Tag className="h-4 w-4 text-orange-500" />
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Colección</h4>
                                </div>
                                {modoEdicion ? (
                                    <select
                                        value={datosEdicion.categoria_id}
                                        onChange={(e) => setDatosEdicion(prev => ({ ...prev, categoria_id: e.target.value }))}
                                        className="w-full bg-slate-50 border-none rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                                    >
                                        <option value="">SELECCIONAR...</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="text-xl font-black text-slate-900 tracking-tighter uppercase line-clamp-1">
                                        {producto.categoria || "Geral"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ingredients Section */}
                <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                                <Utensils className="h-7 w-7 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Configuración de Componentes</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-orange-500" />
                                    Personalización del Producto
                                </p>
                            </div>
                        </div>

                        {modoEdicion && !cargandoIngredientes && (
                            <div className="flex-1 max-w-md">
                                <select
                                    onChange={(e) => {
                                        const ing = ingredientesNoSeleccionados.find(i => i.id.toString() === e.target.value);
                                        if (ing) handleAgregarIngrediente(ing);
                                        e.target.value = "";
                                    }}
                                    className="w-full h-12 bg-white/70 backdrop-blur-xl border border-slate-100 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                                >
                                    <option value="">+ AGREGAR COMPONENTE...</option>
                                    {ingredientesNoSeleccionados.map(ing => (
                                        <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {ingredientesSeleccionados.length === 0 ? (
                        <div className="text-center py-20 bg-white/40 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <Utensils className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sin componentes de personalización asignados</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {ingredientesSeleccionados.map((ing) => (
                                    <motion.div
                                        key={ing.ingrediente_id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-lg shadow-slate-100 flex items-center justify-between"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2 truncate">
                                                {ing.nombre}
                                            </h5>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => modoEdicion && handleToggleObligatorio(ing.ingrediente_id)}
                                                    className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${ing.obligatorio
                                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                                            : 'bg-slate-100 text-slate-400'
                                                        } ${modoEdicion ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                                                >
                                                    {ing.obligatorio ? 'Obligatorio' : 'Opcional'}
                                                </button>
                                            </div>
                                        </div>
                                        {modoEdicion && (
                                            <button
                                                onClick={() => handleQuitarIngrediente(ing.ingrediente_id)}
                                                className="h-10 w-10 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [
        producto, modoEdicion, loading, datosEdicion, previewImagen,
        ingredientesSeleccionados, ingredientesNoSeleccionados, cargandoIngredientes,
        categorias, cargandoCategorias, setDatosEdicion, setModoEdicion,
        handleCambioPrecio, handleToggleObligatorio, handleQuitarIngrediente,
        handleAgregarIngrediente, handleCambioImagen, handleEliminarImagen
    ]);

    const footerContent = useMemo(() => {
        return (
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 w-full`}>
                {modoEdicion ? (
                    <>
                        <button
                            onClick={handleCancelarEdicion}
                            className={`h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all ${isMobile ? 'order-2 w-full' : 'flex-1'}`}
                            disabled={loading}
                        >
                            Abortar Cambios
                        </button>
                        <button
                            onClick={handleGuardarCambios}
                            className={`h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-orange-500 transition-all ${isMobile ? 'order-1 w-full' : 'flex-2'}`}
                            disabled={loading}
                        >
                            {loading ? "Sincronizando..." : "Consolidar Actualización"}
                        </button>
                    </>
                ) : confirmandoCambioEstado ? (
                    <div className="w-full bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <AlertCircle className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest">Estado Crítico</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">¿Confirmas el cambio de disponibilidad operativa?</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={() => setConfirmandoCambioEstado(false)}
                                className="flex-1 md:flex-none px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                disabled={loading}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCambiarEstado}
                                className={`flex-1 md:flex-none px-10 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${producto.activo ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                disabled={loading}
                            >
                                {producto.activo ? "Confirmar Desconexión" : "Confirmar Activación"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setModoEdicion(true)}
                            className={`h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-orange-500 transition-all ${isMobile ? 'w-full' : 'flex-1'}`}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <Edit className="h-4 w-4" />
                                Modificar Definición
                            </div>
                        </button>
                        <button
                            onClick={() => setConfirmandoCambioEstado(true)}
                            className={`h-16 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${producto.activo
                                    ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                    : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                                } ${isMobile ? 'w-full' : 'flex-1'}`}
                        >
                            {producto.activo ? "Sacar de Inventario" : "Reincorporar al Menú"}
                        </button>
                    </>
                )}
            </div>
        );
    }, [
        modoEdicion, loading, isMobile, producto.activo, confirmandoCambioEstado,
        handleCancelarEdicion, handleGuardarCambios, handleCambiarEstado,
        setConfirmandoCambioEstado, setModoEdicion
    ]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl"
        >
            <motion.div
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 50, scale: 0.95 }}
                className="bg-white rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col relative"
            >
                {/* Close Button */}
                <button
                    onClick={onCerrar}
                    className="absolute top-8 right-8 z-10 h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xl"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-slate-900 to-orange-500" />

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="p-10 lg:p-16">
                        <div className="mb-12">
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] block mb-4">
                                {modoEdicion ? "Cámara de Edición" : "Visualización Elite"}
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                {modoEdicion ? "Modificando Activo" : "Detalles del Activo"}
                            </h2>
                        </div>

                        {panelContent}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 lg:p-12 border-t border-slate-50 bg-slate-50/30 backdrop-blur-md">
                    <div className="max-w-4xl mx-auto">
                        {footerContent}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
