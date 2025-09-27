"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaMinus, FaPlus, FaShoppingCart, FaTimes } from "react-icons/fa";
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
}: ProductoDetalleModalProps) {
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState("");
    const [imageError, setImageError] = useState(false);

    const { agregarProducto } = useCarritoStore();

    // ✅ todos los ingredientes inician en true
    const [ingredientesPersonalizados, setIngredientesPersonalizados] =
        useState<IngredientePersonalizado[]>(
            () =>
                producto.ingredientes?.map((pi) => ({
                    ingrediente_id: pi.ingrediente_id,
                    nombre: pi.ingrediente.nombre,
                    incluido: true,
                    obligatorio: pi.obligatorio,
                })) || []
        );

    const productoId =
        typeof producto.id === "string" ? parseInt(producto.id, 10) : producto.id;

    const subtotal = producto.precio * cantidad;

    const toggleIngrediente = (ingredienteId: string) => {
        setIngredientesPersonalizados((prev) =>
            prev.map((ing) =>
                ing.ingrediente_id === ingredienteId
                    ? {
                        ...ing,
                        incluido: ing.obligatorio ? true : !ing.incluido, // obligatorios no cambian
                    }
                    : ing
            )
        );
    };

    const handleAgregarAlCarrito = () => {
        const productoCarrito = {
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url || null,
            categoria: producto.categoria,
            cantidad,
            ingredientes_personalizados: ingredientesPersonalizados,
            notas: notas.trim() || undefined,
            personalizacion_id: `${productoId}-${Date.now()}`,
        };

        agregarProducto(productoCarrito);

        Swal.fire({
            icon: "success",
            title: "Agregado al carrito",
            text: `${producto.nombre} x${cantidad}`,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
        });

        onClose();
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
            {/* Overlay */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                key="panel"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.3 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 100) {
                        onClose();
                    }
                }}
                className="
          mx-auto 
          fixed left-0 right-0 
          bottom-0 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2
          bg-white rounded-t-3xl lg:rounded-3xl 
          shadow-2xl z-50 
          max-h-[90vh] flex flex-col 
          lg:max-w-lg
          h-full lg:h-auto
        "
            >
                {/* Barra deslizable en móvil */}
                <div className="lg:hidden w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-4" />

                {/* Botón X en desktop */}
                <button
                    onClick={onClose}
                    className="hidden lg:block absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FaTimes size={20} />
                </button>

                {/* Contenedor principal con scroll */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Contenido con scroll */}
                    <div className="flex-1 overflow-y-auto scrollbar-none px-6 space-y-6 mt-2 lg:mt-4 pb-4">
                        {/* Imagen + info */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative w-full h-48 sm:w-32 sm:h-32 rounded-lg overflow-hidden bg-gray-200">
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
                                        <span className="text-4xl">🍔</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-bold">{producto.nombre}</h3>
                                <p className="text-sm text-gray-600">{producto.categoria}</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    ${producto.precio.toLocaleString("es-CO")}
                                </p>
                                {producto.descripcion && (
                                    <p className="text-sm text-gray-600">{producto.descripcion}</p>
                                )}
                            </div>
                        </div>

                        {/* Ingredientes */}
                        {ingredientesPersonalizados.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-800">
                                    Personalizar ingredientes
                                </h4>
                                <div className="space-y-2">
                                    {ingredientesPersonalizados.map((ing) => (
                                        <div
                                            key={ing.ingrediente_id}
                                            className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
                                        >
                                            <span>{ing.nombre}</span>
                                            <SwitchCustom
                                                checked={ing.incluido}
                                                onChange={() => toggleIngrediente(ing.ingrediente_id)}
                                                disabled={ing.obligatorio}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Notas especiales
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                placeholder="Ej: sin cebolla, extra salsa..."
                                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Footer fijo abajo */}
                    <div
                        className="
              p-6 border-t bg-white 
              rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4
              mt-auto
            "
                    >
                        {/* Cantidad */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                                disabled={cantidad <= 1}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                <FaMinus size={14} />
                            </button>
                            <span className="text-lg font-semibold">{cantidad}</span>
                            <button
                                onClick={() => setCantidad((c) => c + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                            >
                                <FaPlus size={14} />
                            </button>
                        </div>

                        {/* Botón agregar */}
                        <button
                            onClick={handleAgregarAlCarrito}
                            className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                            <FaShoppingCart />
                            Agregar ${subtotal.toLocaleString("es-CO")}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}