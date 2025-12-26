"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaMinus, FaPlus, FaArrowLeft } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { ShoppingBag, X, Star, Sparkles, Utensils, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import { useProductoDetalleTienda } from "../hooks/useProductoDetalleTienda";

interface ProductoDetalleModalProps {
    producto: ProductoFrontend;
    onClose: () => void;
    productosSugeridos?: ProductoFrontend[];
    onProductoSugeridoClick?: (producto: ProductoFrontend) => void;
    zIndexBase?: number;
}

// 🔘 Premium Custom Switch
function SwitchCustom({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            className={`
                relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300
                ${checked ? "bg-orange-500 shadow-lg shadow-orange-200" : "bg-gray-200"}
                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
            `}
        >
            <span
                className={`
                    inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-sm
                    ${checked ? "translate-x-6" : "translate-x-1"}
                `}
            />
        </button>
    );
}

export default function ProductoDetalleModal({
    producto,
    onClose,
    productosSugeridos = [],
    onProductoSugeridoClick,
    zIndexBase = 50,
}: ProductoDetalleModalProps) {
    const {
        cantidad,
        setCantidad,
        notas,
        setNotas,
        imageError,
        setImageError,
        personalizarAbierto,
        setPersonalizarAbierto,
        ingredientesPersonalizables,
        toggleIngrediente,
        handleAgregarAlCarrito,
        subtotal,
        imageErrorsSugeridos,
        handleSetImageErrorSugerido
    } = useProductoDetalleTienda(producto, onClose);

    const handleSugeridoClick = (productoSugerido: ProductoFrontend) => {
        if (onProductoSugeridoClick) {
            onProductoSugeridoClick(productoSugerido);
        }
    };

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <AnimatePresence>
            {/* High-End Overlay */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-md"
                style={{ zIndex: zIndexBase }}
                onClick={onClose}
            />

            {/* Premium Modal - App Delivery Style */}
            <motion.div
                key="modal"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                style={{ zIndex: zIndexBase + 1 }}
                className="
                    fixed inset-x-0 bottom-0 lg:inset-auto 
                    lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                    bg-white 
                    rounded-t-[3.5rem] lg:rounded-[3.5rem] 
                    shadow-[0_-20px_50px_rgba(0,0,0,0.1)] lg:shadow-2xl
                    lg:max-w-2xl lg:w-full lg:max-h-[92vh]
                    flex flex-col overflow-hidden
                    border-t-8 border-orange-500 lg:border-t-0
                "
            >
                {/* Mobile Handle */}
                <div className="lg:hidden w-16 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 opacity-50" />

                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    {/* Visual Section: Image + Actions */}
                    <div className="relative w-full aspect-[4/3] lg:aspect-video bg-gray-50 overflow-hidden">
                        {producto.imagen_url && !imageError ? (
                            <Image
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-white">
                                <Utensils className="h-20 w-20 text-orange-200" />
                                <p className="text-[10px] font-black text-orange-300 uppercase tracking-[0.3em] mt-4">Delicia Kavvo</p>
                            </div>
                        )}

                        {/* Floating Navigation Controls */}
                        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-gray-900 shadow-xl border border-white/50"
                            >
                                <FaArrowLeft className="h-4 w-4" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="hidden lg:flex h-12 w-12 rounded-2xl bg-white/90 backdrop-blur-xl items-center justify-center text-gray-900 shadow-xl border border-white/50"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-6 left-6">
                            <div className="bg-slate-900/90 backdrop-blur-xl text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10">
                                <Sparkles className="h-4 w-4 text-orange-500 fill-orange-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Más Vendido</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-8 pt-10 space-y-10">
                        {/* Summary Block */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex-1 space-y-3">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-tight">
                                    {producto.nombre}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center text-orange-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-current" />
                                        ))}
                                        <span className="ml-2 text-xs font-black text-gray-400">4.9 (120+)</span>
                                    </div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                                    <span className="text-xs font-black text-orange-600 uppercase tracking-widest leading-none">Popular hoy</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Precio Total</span>
                                <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                    <span className="text-orange-500 text-xl mr-0.5">$</span>
                                    {producto.precio.toLocaleString("es-CO")}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {producto.descripcion && (
                            <div className="bg-orange-50/50 rounded-[2rem] p-6 border border-orange-100/50">
                                <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
                                    &quot;{producto.descripcion}&quot;
                                </p>
                            </div>
                        )}

                        {/* Customization Accordion */}
                        {ingredientesPersonalizables.length > 0 && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setPersonalizarAbierto(!personalizarAbierto)}
                                    className="w-full flex items-center justify-between p-6 bg-white border-2 border-slate-50 rounded-[2rem] shadow-xl shadow-slate-100/50 hover:border-orange-200 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Personaliza tu orden</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ajusta los ingredientes</p>
                                        </div>
                                    </div>
                                    <IoIosArrowDown className={`text-xl text-gray-400 transition-transform duration-300 ${personalizarAbierto ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {personalizarAbierto && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-slate-50/50 rounded-[2.5rem] border border-slate-100"
                                        >
                                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {ingredientesPersonalizables.map((ing) => (
                                                    <div
                                                        key={ing.ingrediente_id}
                                                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-transparent hover:border-orange-200 transition-all shadow-sm"
                                                    >
                                                        <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{ing.nombre}</span>
                                                        <SwitchCustom
                                                            checked={ing.incluido}
                                                            onChange={() => toggleIngrediente(ing.ingrediente_id)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Special Notes Block */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 ml-2">
                                <MessageSquare className="h-4 w-4 text-orange-500" />
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Notas Especiales</h4>
                            </div>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                placeholder="¿Algo que debamos saber? (Ej: sin cebolla, bien cocido...)"
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-500/10 py-5 px-6 rounded-[2rem] outline-none transition-all font-bold text-gray-900 text-sm resize-none shadow-inner"
                                rows={3}
                            />
                        </div>

                        {/* Suggested Products Grid */}
                        {productosSugeridos.length > 0 && (
                            <div className="space-y-6 pt-6 border-t-2 border-gray-50">
                                <div className="flex items-center justify-between ml-2">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Completa tu combo</h4>
                                    <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Ver todo</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {productosSugeridos.slice(0, 4).map((sugerido) => (
                                        <motion.div
                                            key={sugerido.id}
                                            whileHover={{ y: -5 }}
                                            onClick={() => handleSugeridoClick(sugerido)}
                                            className="group bg-white rounded-[2rem] p-3 border border-slate-100 shadow-lg shadow-slate-100/50 hover:border-orange-200 cursor-pointer overflow-hidden transition-all"
                                        >
                                            <div className="relative h-28 w-full rounded-[1.5rem] overflow-hidden mb-3 bg-gray-50">
                                                {sugerido.imagen_url && !imageErrorsSugeridos[sugerido.id] ? (
                                                    <Image
                                                        src={sugerido.imagen_url}
                                                        alt={sugerido.nombre}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={() => handleSetImageErrorSugerido(sugerido.id.toString())}
                                                    />
                                                ) : (
                                                    <div className="h-full flex items-center justify-center grayscale opacity-30">🍔</div>
                                                )}
                                            </div>
                                            <div className="px-1">
                                                <p className="text-[10px] font-black text-gray-900 line-clamp-1 uppercase tracking-tighter mb-1">
                                                    {sugerido.nombre}
                                                </p>
                                                <p className="text-sm font-black text-orange-500 tracking-tighter">
                                                    ${sugerido.precio.toLocaleString("es-CO")}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Block - STICKY */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pt-4 bg-white/80 backdrop-blur-2xl border-t border-gray-100 lg:rounded-b-[3.5rem]">
                    <div className="max-w-2xl mx-auto flex items-center gap-6">
                        {/* Premium Quantity Selector */}
                        <div className="flex items-center bg-gray-100 rounded-[2rem] p-1.5 shadow-inner">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                disabled={cantidad <= 1}
                                className="h-12 w-12 flex items-center justify-center rounded-[1.5rem] bg-white text-gray-900 shadow-sm disabled:opacity-30 disabled:shadow-none hover:text-orange-500 transition-colors"
                            >
                                <FaMinus className="text-sm" />
                            </motion.button>
                            <span className="text-lg font-black w-14 text-center text-gray-900">{cantidad}</span>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setCantidad((c) => c + 1)}
                                className="h-12 w-12 flex items-center justify-center rounded-[1.5rem] bg-slate-900 text-white shadow-xl hover:bg-orange-500 transition-all"
                            >
                                <FaPlus className="text-sm" />
                            </motion.button>
                        </div>

                        {/* Add to Cart Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAgregarAlCarrito}
                            className="flex-1 bg-gray-900 hover:bg-orange-500 text-white h-16 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl hover:shadow-orange-200"
                        >
                            <div className="h-8 w-8 bg-white/10 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <span className="uppercase tracking-widest text-xs">Agregar</span>
                            <div className="h-1 w-1 rounded-full bg-white/30" />
                            <span className="text-lg tracking-tighter">${subtotal.toLocaleString("es-CO")}</span>
                        </motion.button>
                    </div>
                    <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] mt-4">
                        Calidad Premium Garantizada by Kavvo ©
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
