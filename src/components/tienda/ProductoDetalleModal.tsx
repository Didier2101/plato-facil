"use client";

import { IngredientePersonalizado, useCarritoStore } from "@/src/store/carritoStore";
import { ProductoFrontend } from "@/src/types/producto";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Swal from "sweetalert2";



interface ProductoDetalleModalProps {
    producto: ProductoFrontend;
    onClose: () => void;
}

export default function ProductoDetalleModal({ producto, onClose }: ProductoDetalleModalProps) {
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState("");
    const [agregando, setAgregando] = useState(false);
    const [imageError, setImageError] = useState(false);

    const { agregarProducto } = useCarritoStore();

    // Estado para ingredientes personalizados - CORREGIDO para usar tu estructura
    const [ingredientesPersonalizados, setIngredientesPersonalizados] = useState<IngredientePersonalizado[]>(
        () => {
            // Inicializar con todos los ingredientes del producto usando tu estructura
            return producto.ingredientes?.map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                incluido: pi.obligatorio, // Obligatorios vienen incluidos por defecto
                obligatorio: pi.obligatorio
            })) || [];
        }
    );

    const productoId = typeof producto.id === "string" ? parseInt(producto.id, 10) : producto.id;

    // Función para toggle de ingredientes
    const toggleIngrediente = (ingredienteId: string) => {
        setIngredientesPersonalizados(prev =>
            prev.map(ing =>
                ing.ingrediente_id === ingredienteId
                    ? { ...ing, incluido: ing.obligatorio ? true : !ing.incluido } // Obligatorios no se pueden quitar
                    : ing
            )
        );
    };

    // Función para generar ID único de personalización
    const generarPersonalizacionId = (productoId: number, ingredientes: IngredientePersonalizado[], notas?: string) => {
        // Solo considerar ingredientes excluidos para el ID
        const ingredientesExcluidos = ingredientes
            .filter(ing => !ing.incluido && !ing.obligatorio)
            .map(ing => ing.ingrediente_id)
            .sort()
            .join(',');

        const notasLimpia = (notas || '').trim();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);

        return `${productoId}-${ingredientesExcluidos}-${notasLimpia.replace(/\s+/g, '_')}-${timestamp}-${random}`;
    };

    // Obtener ingredientes excluidos para mostrar en el resumen
    const ingredientesExcluidos = ingredientesPersonalizados.filter(ing => !ing.incluido && !ing.obligatorio);

    const handleAgregarAlCarrito = async () => {
        setAgregando(true);

        try {
            // Solo incluir ingredientes que están incluidos (para mostrar correctamente)
            const ingredientesParaGuardar = ingredientesPersonalizados.map(ing => ({
                ...ing,
                incluido: ing.incluido || ing.obligatorio // Asegurar que obligatorios siempre estén incluidos
            }));

            const productoCarrito = {
                id: productoId,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen_url: producto.imagen_url || null,
                categoria: producto.categoria,
                cantidad: cantidad,
                ingredientes_personalizados: ingredientesParaGuardar,
                notas: notas.trim() || undefined,
                personalizacion_id: generarPersonalizacionId(productoId, ingredientesPersonalizados, notas)
            };

            agregarProducto(productoCarrito);

            // Preparar mensaje de confirmación mostrando ingredientes excluidos
            const tienePersonalizacion = ingredientesExcluidos.length > 0 || notas.trim();
            const mensajePersonalizacion = tienePersonalizacion
                ? ` (${ingredientesExcluidos.length > 0 ? `sin ${ingredientesExcluidos.map(i => i.nombre).join(", ")}` : ""}${notas ? ", con notas" : ""})`
                : "";

            Swal.fire({
                icon: "success",
                title: "Agregado al carrito",
                text: `${producto.nombre} x${cantidad}${mensajePersonalizacion}`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: "top-end"
            });

            onClose();
        } catch (error) {
            console.error("Error agregando al carrito:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo agregar el producto al carrito",
                timer: 2000
            });
        } finally {
            setAgregando(false);
        }
    };

    const subtotal = producto.precio * cantidad;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Personalizar producto</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Información del producto */}
                    <div className="flex gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            {producto.imagen_url && !imageError ? (
                                <Image
                                    src={producto.imagen_url}
                                    alt={producto.nombre}
                                    fill
                                    className="object-cover"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{producto.nombre}</h3>
                            <p className="text-sm text-gray-600 mb-2">{producto.categoria}</p>
                            <p className="text-2xl font-bold text-orange-600">
                                ${producto.precio.toLocaleString("es-CO")}
                            </p>
                            {producto.descripcion && (
                                <p className="text-sm text-gray-600 mt-2">{producto.descripcion}</p>
                            )}
                        </div>
                    </div>

                    {/* Ingredientes */}
                    {ingredientesPersonalizados.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800">Personalizar ingredientes</h4>

                            {/* Ingredientes obligatorios */}
                            <div>
                                <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                    Ingredientes incluidos siempre
                                </h5>
                                <div className="space-y-2">
                                    {ingredientesPersonalizados
                                        .filter(ing => ing.obligatorio)
                                        .map(ing => (
                                            <div key={ing.ingrediente_id} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                                <span className="text-sm font-medium text-green-800">{ing.nombre}</span>
                                                <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                                                    Siempre incluido
                                                </span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Ingredientes opcionales */}
                            {ingredientesPersonalizados.some(ing => !ing.obligatorio) && (
                                <div>
                                    <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                        Ingredientes opcionales (puedes quitarlos)
                                    </h5>
                                    <div className="space-y-2">
                                        {ingredientesPersonalizados
                                            .filter(ing => !ing.obligatorio)
                                            .map(ing => (
                                                <div key={ing.ingrediente_id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border">
                                                    <span className="text-sm font-medium text-gray-700">{ing.nombre}</span>
                                                    <button
                                                        onClick={() => toggleIngrediente(ing.ingrediente_id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${ing.incluido
                                                            ? "bg-green-600 text-white"
                                                            : "bg-red-500 text-white"
                                                            }`}
                                                    >
                                                        {ing.incluido ? "✓ Incluir" : "✗ No incluir"}
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notas especiales */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas especiales (opcional)
                        </label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Ej: Sin cebolla, extra salsa, punto de la carne..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                            rows={3}
                            maxLength={200}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {notas.length}/200 caracteres
                        </div>
                    </div>

                    {/* Resumen de personalización mostrando solo ingredientes excluidos */}
                    {(ingredientesExcluidos.length > 0 || notas.trim()) && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-red-800 mb-2">Tu personalización:</h5>
                            <div className="space-y-1 text-sm text-red-700">
                                {ingredientesExcluidos.length > 0 && (
                                    <div>• Sin: {ingredientesExcluidos.map(ing => ing.nombre).join(", ")}</div>
                                )}
                                {notas.trim() && (
                                    <div>• Notas: {notas}</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con cantidad y total */}
                <div className="p-4 border-t bg-white">
                    {/* Cantidad */}
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-gray-700">Cantidad:</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                                disabled={cantidad <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="text-lg font-semibold min-w-[2rem] text-center">
                                {cantidad}
                            </span>
                            <button
                                onClick={() => setCantidad(prev => Math.min(10, prev + 1))}
                                disabled={cantidad >= 10}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Total y botón agregar */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm text-gray-600">Subtotal:</span>
                            <div className="text-2xl font-bold text-orange-600">
                                ${subtotal.toLocaleString("es-CO")}
                            </div>
                        </div>
                        <button
                            onClick={handleAgregarAlCarrito}
                            disabled={agregando}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg"
                        >
                            {agregando ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <ShoppingCart size={20} />
                            )}
                            {agregando ? "Agregando..." : "Agregar al carrito"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}