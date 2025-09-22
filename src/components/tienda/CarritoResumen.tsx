"use client";

import { useCarritoStore } from "@/src/store/carritoStore";
import { useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import { crearOrdenAction } from "@/src/actions/crearOrdenAction";
import { X, Settings, Minus, Plus } from "lucide-react";

// Tipos actualizados
interface ProductoOrden {
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    ingredientes_personalizados?: {
        ingrediente_id: string;
        nombre: string;
        incluido: boolean;
        obligatorio: boolean;
    }[];
    notas?: string;
    personalizacion_id?: string;
}

interface DatosCliente {
    nombre: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
}

interface OrdenData {
    cliente: DatosCliente;
    productos: ProductoOrden[];
    total: number;
    estado: string;
    tipo_orden: "establecimiento" | "domicilio";
}

interface CarritoResumenProps {
    onClose: () => void;
    tipo: "establecimiento" | "domicilio";
}

export default function CarritoResumen({ onClose, tipo }: CarritoResumenProps) {
    const { productos, total, actualizarCantidad, removerProducto, limpiarCarrito } =
        useCarritoStore();

    const [procesando, setProcesando] = useState(false);
    const [datosCliente, setDatosCliente] = useState<DatosCliente>({
        nombre: "",
        telefono: "",
        direccion: "",
        notas: "",
    });

    // Función para limpiar datos del formulario
    const limpiarDatosCliente = () => {
        setDatosCliente({
            nombre: "",
            telefono: "",
            direccion: "",
            notas: "",
        });
    };

    // Función para cerrar modal y limpiar datos
    const handleClose = () => {
        limpiarDatosCliente();
        onClose();
    };

    // Función para limpiar todo (carrito + formulario)
    const handleLimpiarTodo = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Se eliminará todo el contenido del carrito",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, limpiar todo",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                limpiarCarrito();
                limpiarDatosCliente();
                Swal.fire("Carrito limpio", "Se ha vaciado el carrito", "success");
            }
        });
    };

    const handleProcesarOrden = async () => {
        if (!datosCliente.nombre?.trim()) {
            Swal.fire("⚠️ Nombre requerido", "Debes ingresar el nombre del cliente", "warning");
            return;
        }

        if (tipo === "domicilio" && !datosCliente.direccion?.trim()) {
            Swal.fire("⚠️ Dirección requerida", "Debes ingresar la dirección de entrega", "warning");
            return;
        }

        if (productos.length === 0) {
            Swal.fire("⚠️ Carrito vacío", "Agrega productos antes de continuar", "warning");
            return;
        }

        setProcesando(true);

        try {
            // CORREGIDO: Convertir productos del carrito al formato de orden con personalización
            const productosOrden: ProductoOrden[] = productos.map((p) => ({
                producto_id: p.id,
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad,
                subtotal: p.precio * p.cantidad,
                // Incluir personalización exactamente como está en el carrito
                ingredientes_personalizados: p.ingredientes_personalizados,
                notas: p.notas,
                personalizacion_id: p.personalizacion_id
            }));

            const ordenData: OrdenData = {
                cliente: {
                    nombre: datosCliente.nombre,
                    telefono: datosCliente.telefono || undefined,
                    direccion: tipo === "domicilio" ? datosCliente.direccion : "En establecimiento",
                    notas: datosCliente.notas || undefined,
                },
                productos: productosOrden,
                total,
                estado: "orden_tomada",
                tipo_orden: tipo,
            };

            const result = await crearOrdenAction(ordenData);

            if (result.success) {
                // CORREGIDO: Contar productos con personalización (ingredientes excluidos)
                const conPersonalizacion = productos.filter(p => {
                    if (!p.ingredientes_personalizados) return false;
                    // Verificar si hay ingredientes excluidos (no incluidos y no obligatorios)
                    return p.ingredientes_personalizados.some(ing => !ing.incluido && !ing.obligatorio) || p.notas;
                }).length;

                Swal.fire({
                    icon: "success",
                    title: "Orden creada ✅",
                    text: `Pedido #${result.orden?.id.slice(-8)}${conPersonalizacion > 0 ? ` (${conPersonalizacion} productos personalizados)` : ''}`,
                    confirmButtonText: "Ok",
                }).then(() => {
                    // Limpiar carrito y formulario después de orden exitosa
                    limpiarCarrito();
                    limpiarDatosCliente();
                    onClose();
                });
            } else {
                Swal.fire("❌ Error", result.error || "No se pudo crear la orden", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("❌ Error", "Ocurrió un error procesando la orden", "error");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl flex flex-col">
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-lg font-semibold">
                        {tipo === "domicilio" ? "Tu pedido a domicilio" : "Pedido en establecimiento"}
                    </h2>
                    <div className="flex items-center space-x-2">
                        {/* Botón para limpiar carrito */}
                        {productos.length > 0 && (
                            <button
                                onClick={handleLimpiarTodo}
                                className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
                                title="Limpiar carrito"
                            >
                                🗑️ Limpiar
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Productos */}
                    {productos.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-lg">Tu carrito está vacío 🛒</p>
                            <p className="text-sm mt-2">Agrega productos para continuar</p>
                        </div>
                    ) : (
                        productos.map((p) => (
                            <div
                                key={p.personalizacion_id || `${p.id}-${Math.random()}`}
                                className="bg-gray-50 rounded-lg p-4 shadow-sm space-y-3"
                            >
                                {/* Información principal del producto */}
                                <div className="flex items-center">
                                    {/* Imagen */}
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                        {p.imagen_url ? (
                                            <Image
                                                src={p.imagen_url}
                                                alt={p.nombre}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                🍽️
                                            </div>
                                        )}
                                    </div>

                                    {/* Detalles */}
                                    <div className="ml-3 flex-1">
                                        <p className="font-medium">{p.nombre}</p>
                                        <p className="text-sm text-gray-500">
                                            ${p.precio.toLocaleString("es-CO")}
                                        </p>

                                        {/* Controles de cantidad */}
                                        <div className="flex items-center mt-2 space-x-2">
                                            <button
                                                onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="min-w-[20px] text-center">{p.cantidad}</span>
                                            <button
                                                onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal y acciones */}
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            ${(p.precio * p.cantidad).toLocaleString("es-CO")}
                                        </p>
                                        <button
                                            onClick={() => p.personalizacion_id && removerProducto(p.personalizacion_id)}
                                            className="text-xs text-red-500 hover:text-red-700 mt-1"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                {/* CORREGIDO: Personalización - mostrar solo ingredientes excluidos */}
                                {(p.ingredientes_personalizados && p.ingredientes_personalizados.some(ing => !ing.incluido && !ing.obligatorio)) || p.notas ? (
                                    <div className="border-t pt-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Settings size={14} className="text-red-600" />
                                            <span className="text-sm font-medium text-red-800">Personalizado</span>
                                        </div>

                                        {/* CORREGIDO: Solo mostrar ingredientes excluidos con "Sin:" */}
                                        {p.ingredientes_personalizados && p.ingredientes_personalizados.filter(ing => !ing.incluido && !ing.obligatorio).length > 0 && (
                                            <div className="text-sm text-red-700 mb-1">
                                                <span className="font-medium">Sin:</span>{" "}
                                                {p.ingredientes_personalizados
                                                    .filter(ing => !ing.incluido && !ing.obligatorio)
                                                    .map(ing => ing.nombre)
                                                    .join(", ")
                                                }
                                            </div>
                                        )}

                                        {/* Notas */}
                                        {p.notas && (
                                            <div className="text-sm text-blue-700 mt-1">
                                                <span className="font-medium">Notas:</span> {p.notas}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ))
                    )}

                    {/* Datos cliente */}
                    {productos.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="font-medium text-gray-700">Datos del cliente</h3>
                            <input
                                type="text"
                                placeholder="Nombre del cliente *"
                                value={datosCliente.nombre}
                                onChange={(e) =>
                                    setDatosCliente({ ...datosCliente, nombre: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {tipo === "domicilio" && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Teléfono"
                                        value={datosCliente.telefono}
                                        onChange={(e) =>
                                            setDatosCliente({ ...datosCliente, telefono: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dirección de entrega *"
                                        value={datosCliente.direccion}
                                        onChange={(e) =>
                                            setDatosCliente({ ...datosCliente, direccion: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <textarea
                                        placeholder="Notas adicionales (ej: piso, referencia...)"
                                        value={datosCliente.notas}
                                        onChange={(e) =>
                                            setDatosCliente({ ...datosCliente, notas: e.target.value })
                                        }
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {productos.length > 0 && (
                    <div className="p-4 border-t bg-white">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold text-blue-600">
                                ${total.toLocaleString("es-CO")}
                            </span>
                        </div>
                        <button
                            onClick={handleProcesarOrden}
                            disabled={procesando}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {procesando ? "Procesando..." : "Confirmar pedido"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}