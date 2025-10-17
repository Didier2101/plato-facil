"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaMinus, FaPlus, FaShoppingCart, FaTimes, FaArrowLeft } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    IngredientePersonalizado,
    useCarritoStore,
} from "@/src/store/carritoStore";
import { ProductoFrontend } from "@/src/types/producto";

interface ProductoDetalleModalProps {
    producto: ProductoFrontend;
    onClose: () => void;
    productosSugeridos?: ProductoFrontend[];
    onProductoSugeridoClick?: (producto: ProductoFrontend) => void;
    zIndexBase?: number;
}

// 🔘 Switch personalizado (naranja/gris)
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
            className={`${checked ? "bg-orange-500" : "bg-gray-300"}
        relative inline-flex h-6 w-11 items-center rounded-full transition ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            <span
                className={`${checked ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
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
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState("");
    const [imageError, setImageError] = useState(false);
    const [personalizarAbierto, setPersonalizarAbierto] = useState(false);
    const [imageErrorsSugeridos, setImageErrorsSugeridos] = useState<Record<string, boolean>>({});

    const { agregarProducto } = useCarritoStore();

    // ✅ Reiniciar estado cuando cambia el producto
    useEffect(() => {
        setCantidad(1);
        setNotas("");
        setPersonalizarAbierto(false);
        setImageError(false);

        // Reiniciar ingredientes personalizables
        setIngredientesPersonalizables(
            producto.ingredientes
                ?.filter(pi => !pi.obligatorio)
                .map((pi) => ({
                    ingrediente_id: pi.ingrediente_id,
                    nombre: pi.ingrediente.nombre,
                    incluido: true,
                    obligatorio: false,
                })) || []
        );
    }, [producto.id, producto.ingredientes]);

    // ✅ Solo incluir ingredientes NO obligatorios para personalización
    const [ingredientesPersonalizables, setIngredientesPersonalizables] =
        useState<IngredientePersonalizado[]>(
            () =>
                producto.ingredientes
                    ?.filter(pi => !pi.obligatorio)
                    .map((pi) => ({
                        ingrediente_id: pi.ingrediente_id,
                        nombre: pi.ingrediente.nombre,
                        incluido: true,
                        obligatorio: false,
                    })) || []
        );

    const productoId =
        typeof producto.id === "string" ? parseInt(producto.id, 10) : producto.id;

    const subtotal = producto.precio * cantidad;

    const toggleIngrediente = (ingredienteId: string) => {
        setIngredientesPersonalizables((prev) =>
            prev.map((ing) =>
                ing.ingrediente_id === ingredienteId
                    ? {
                        ...ing,
                        incluido: !ing.incluido,
                    }
                    : ing
            )
        );
    };

    const handleAgregarAlCarrito = () => {
        const ingredientesObligatoriosCarrito = producto.ingredientes
            ?.filter(pi => pi.obligatorio)
            .map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                incluido: true,
                obligatorio: true,
            })) || [];

        const todosLosIngredientes = [
            ...ingredientesObligatoriosCarrito,
            ...ingredientesPersonalizables
        ];

        const productoCarrito = {
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url || null,
            categoria: producto.categoria,
            cantidad,
            ingredientes_personalizados: todosLosIngredientes,
            notas: notas.trim() || undefined,
            // ❌ ELIMINADO: personalizacion_id - el store lo generará automáticamente
        };

        agregarProducto(productoCarrito);

        Swal.fire({
            icon: "success",
            title: "",
            text: "",
            timer: 1000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            background: "#f97316",
            iconColor: "#ffffff",
            width: "80px",
            customClass: {
                popup: "!rounded-full !shadow-lg !flex !items-center !justify-center",
                icon: "!border-0 !m-0 !scale-75"
            }
        });

        onClose();
    };

    // ✅ NUEVO: Cuando se clickea un sugerido, cambiar el producto del modal
    const handleSugeridoClick = (productoSugerido: ProductoFrontend) => {
        if (onProductoSugeridoClick) {
            onProductoSugeridoClick(productoSugerido);
        }
    };

    // 🚫 Bloquear scroll del body mientras el modal está abierto
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <AnimatePresence>
            {/* Overlay con animación de entrada/salida */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 bg-black/50"
                style={{ zIndex: zIndexBase }}
                onClick={onClose}
            />

            {/* Modal principal */}
            <motion.div
                key="modal"
                initial={{
                    x: "100%",
                    opacity: 0
                }}
                animate={{
                    x: 0,
                    opacity: 1
                }}
                exit={{
                    x: "100%",
                    opacity: 0
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeInOut"
                }}
                style={{ zIndex: zIndexBase + 1 }}
                className="
                    fixed inset-0 lg:inset-auto 
                    lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                    bg-white
                    lg:rounded-3xl lg:shadow-2xl
                    lg:max-w-lg lg:w-full lg:max-h-[90vh]
                    flex flex-col
                "
            >
                {/* Contenido con scroll */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {/* Imagen del producto - PEGADA ARRIBA EN MÓVIL */}
                    <div className="relative w-full h-64 lg:h-56 bg-gray-100">
                        {producto.imagen_url && !imageError ? (
                            <Image
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                fill
                                className="object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <Image
                                    src="/assets/logo-kavvo-solo.png"
                                    alt="Logo Kavvo"
                                    width={80}
                                    height={80}
                                    className="object-contain opacity-60"
                                />
                            </div>
                        )}

                        {/* Botón flecha DENTRO DE LA IMAGEN - Solo móvil */}
                        <div className="lg:hidden absolute top-4 left-4">
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                            >
                                <FaArrowLeft className="text-lg" />
                            </button>
                        </div>

                        {/* Botón X DENTRO DE LA IMAGEN - Solo desktop */}
                        <div className="hidden lg:block absolute top-4 right-4">
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Contenido informativo */}
                    <div className="p-6 space-y-6">
                        {/* Información básica */}
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">
                                ${producto.precio.toLocaleString("es-CO")}
                            </p>

                            <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>

                            {producto.descripcion && (
                                <p className="text-sm text-gray-600 leading-relaxed">{producto.descripcion}</p>
                            )}
                        </div>

                        {/* Acordeón: Personalizar ingredientes */}
                        {ingredientesPersonalizables.length > 0 && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setPersonalizarAbierto(!personalizarAbierto)}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">
                                        Personalizar ingredientes
                                    </span>
                                    <IoIosArrowDown
                                        className={`text-xl text-gray-600 transition-transform duration-300 ${personalizarAbierto ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {personalizarAbierto && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 space-y-3 bg-white">
                                                {ingredientesPersonalizables.map((ing) => (
                                                    <div
                                                        key={ing.ingrediente_id}
                                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                                                    >
                                                        <span className="font-medium text-gray-900">{ing.nombre}</span>
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

                        {/* Notas especiales */}
                        <div className="space-y-3">
                            <label className="block text-base font-semibold text-gray-900">
                                Notas especiales
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                placeholder="Ej: sin cebolla, extra salsa, bien cocido..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors"
                                rows={3}
                            />
                        </div>

                        {/* Productos sugeridos */}
                        {productosSugeridos.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-900">
                                    También te podría gustar
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {productosSugeridos.slice(0, 4).map((sugerido) => (
                                        <div
                                            key={sugerido.id}
                                            className="border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
                                            onClick={() => handleSugeridoClick(sugerido)}
                                        >
                                            <div className="relative h-24 w-full bg-gray-100">
                                                {sugerido.imagen_url && !imageErrorsSugeridos[sugerido.id] ? (
                                                    <Image
                                                        src={sugerido.imagen_url}
                                                        alt={sugerido.nombre}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        onError={() => setImageErrorsSugeridos(prev => ({
                                                            ...prev,
                                                            [sugerido.id]: true
                                                        }))}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Image
                                                            src="/assets/logo-kavvo-solo.png"
                                                            alt="Logo"
                                                            width={40}
                                                            height={40}
                                                            className="object-contain opacity-60"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2">
                                                <p className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                                                    {sugerido.nombre}
                                                </p>
                                                <p className="text-sm font-bold text-orange-600">
                                                    ${sugerido.precio.toLocaleString("es-CO")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer fijo */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-white lg:rounded-b-3xl">
                    <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Selector de cantidad */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                    disabled={cantidad <= 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaMinus size={14} className="text-gray-700" />
                                </button>
                                <span className="text-lg font-semibold w-8 text-center">{cantidad}</span>
                                <button
                                    onClick={() => setCantidad((c) => c + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <FaPlus size={14} className="text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Botón agregar al carrito */}
                        <button
                            onClick={handleAgregarAlCarrito}
                            className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-105 min-w-[200px]"
                        >
                            <FaShoppingCart className="text-lg" />
                            <span>Agregar ${subtotal.toLocaleString("es-CO")}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}