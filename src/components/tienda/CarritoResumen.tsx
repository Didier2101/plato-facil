"use client";

import { useCarritoStore } from "@/src/store/carritoStore";
import { useState } from "react";
import Swal from "sweetalert2";
import { crearOrdenAction } from "@/src/actions/crearOrdenAction";
import {
    FaMinus,
    FaPlus,
    FaTrash,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaStickyNote,
    FaCreditCard,
    FaMoneyBillWave,
    FaShoppingCart,
    FaUtensils
} from "react-icons/fa";

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
    metodo_pago?: "efectivo" | "tarjeta";
    monto_entregado?: number;
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

    const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "">("");
    const [montoEntregado, setMontoEntregado] = useState<number | "">("");

    const cambio =
        metodoPago === "efectivo" && montoEntregado !== ""
            ? Number(montoEntregado) - total
            : null;

    // Función para limpiar datos del formulario
    const limpiarDatosCliente = () => {
        setDatosCliente({
            nombre: "",
            telefono: "",
            direccion: "",
            notas: "",
        });
        setMetodoPago("");
        setMontoEntregado("");
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
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#6b7280",
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
            Swal.fire("Nombre requerido", "Debes ingresar el nombre del cliente", "warning");
            return;
        }

        if (tipo === "domicilio" && !datosCliente.direccion?.trim()) {
            Swal.fire("Dirección requerida", "Debes ingresar la dirección de entrega", "warning");
            return;
        }

        if (productos.length === 0) {
            Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
            return;
        }

        if (tipo === "domicilio" && metodoPago === "efectivo") {
            if (montoEntregado === "" || Number(montoEntregado) < total) {
                Swal.fire("Pago inválido", "Debes indicar un monto suficiente para pagar en efectivo", "warning");
                return;
            }
        }

        setProcesando(true);

        try {
            const productosOrden: ProductoOrden[] = productos.map((p) => ({
                producto_id: p.id,
                nombre: p.nombre,
                precio: p.precio,
                cantidad: p.cantidad,
                subtotal: p.precio * p.cantidad,
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
                metodo_pago: metodoPago || undefined,
                monto_entregado: metodoPago === "efectivo" ? Number(montoEntregado) : undefined,
            };

            const result = await crearOrdenAction(ordenData);

            if (result.success) {
                const conPersonalizacion = productos.filter(p => {
                    if (!p.ingredientes_personalizados) return false;
                    return p.ingredientes_personalizados.some(ing => !ing.incluido && !ing.obligatorio) || p.notas;
                }).length;

                Swal.fire({
                    icon: "success",
                    title: "Orden creada",
                    text: `Pedido #${result.orden?.id.slice(-8)}${conPersonalizacion > 0 ? ` (${conPersonalizacion} productos personalizados)` : ''}`,
                    confirmButtonText: "Ok",
                    confirmButtonColor: "#f97316"
                }).then(() => {
                    limpiarCarrito();
                    limpiarDatosCliente();
                    onClose();
                });
            } else {
                Swal.fire("Error", result.error || "No se pudo crear la orden", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Ocurrió un error procesando la orden", "error");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={handleClose}
            />

            {/* Panel desde abajo */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] flex flex-col overflow-hidden">
                {/* Handle de arrastre */}
                <div className="flex justify-center pt-2 pb-1">
                    <div
                        className="w-16 h-1.5 bg-gray-300 rounded-full cursor-pointer"
                        onClick={handleClose}
                    />
                </div>

                {/* Header - Estilo OrdenCard */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Icono principal */}
                            <div className="bg-orange-500 text-white px-3 py-2 rounded-lg">
                                <FaShoppingCart className="text-lg" />
                            </div>

                            {/* Título y subtítulo */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {tipo === "domicilio" ? "Pedido a domicilio" : "Nueva orden"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {productos.length} productos en el carrito
                                </p>
                            </div>
                        </div>

                        {/* Botón de limpiar */}
                        {productos.length > 0 && (
                            <button
                                onClick={handleLimpiarTodo}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Limpiar carrito"
                            >
                                <FaTrash size={16} />
                            </button>
                        )}
                    </div>

                    {/* Total en el header */}
                    {productos.length > 0 && (
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-gray-600">Total del pedido</span>
                            <span className="text-2xl font-bold text-green-600">
                                ${total.toLocaleString("es-CO")}
                            </span>
                        </div>
                    )}
                </div>

                {/* Contenido scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {productos.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                            <p className="text-sm text-gray-500">Agrega productos para continuar</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            {/* Sección de productos */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                                    <FaUtensils className="text-orange-500" />
                                    Productos seleccionados
                                </h4>

                                {productos.map((p) => (
                                    <div
                                        key={p.personalizacion_id || `${p.id}-${Math.random()}`}
                                        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-sm text-gray-900">{p.nombre}</h5>

                                                </div>

                                                {/* Controles de cantidad */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad - 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                                        >
                                                            <FaMinus size={12} />
                                                        </button>
                                                        <div className="bg-gray-100 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                            {p.cantidad}
                                                        </div>
                                                        <button
                                                            onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad + 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                                        >
                                                            <FaPlus size={12} />
                                                        </button>
                                                    </div>


                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="font-bold text-sm text-gray-900">
                                                        ${(p.precio * p.cantidad).toLocaleString("es-CO")}
                                                    </p>
                                                    <button
                                                        onClick={() => p.personalizacion_id && removerProducto(p.personalizacion_id)}
                                                        className="text-xs text-red-500 hover:text-red-700 mt-1 transition-colors"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Personalizaciones */}
                                            {(p.ingredientes_personalizados && p.ingredientes_personalizados.some(ing => !ing.incluido && !ing.obligatorio)) || p.notas ? (
                                                <div className="mt-4 pt-3 border-t border-gray-200">

                                                    {p.ingredientes_personalizados && p.ingredientes_personalizados.filter(ing => !ing.incluido && !ing.obligatorio).length > 0 && (
                                                        <div className="flex items-center  gap-2 mb-2">
                                                            <p className="text-sm font-medium text-red-700">Sin:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {p.ingredientes_personalizados
                                                                    .filter(ing => !ing.incluido && !ing.obligatorio)
                                                                    .map(ing => (
                                                                        <span
                                                                            key={ing.ingrediente_id}
                                                                            className="text-xs text-red-700"
                                                                        >
                                                                            {ing.nombre},
                                                                        </span>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                    {p.notas && (
                                                        <div className="text-sm text-blue-700 mt-2 p-2 bg-blue-50 rounded-lg">
                                                            <span className="font-medium">Notas:</span> {p.notas}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Datos del cliente */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                    <FaUser className="text-orange-500" />
                                    Datos del cliente
                                </h4>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Nombre del cliente *"
                                            value={datosCliente.nombre}
                                            onChange={(e) =>
                                                setDatosCliente({ ...datosCliente, nombre: e.target.value })
                                            }
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>

                                    {tipo === "domicilio" && (
                                        <>
                                            <div className="relative">
                                                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Teléfono"
                                                    value={datosCliente.telefono}
                                                    onChange={(e) =>
                                                        setDatosCliente({ ...datosCliente, telefono: e.target.value })
                                                    }
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="relative">
                                                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Dirección de entrega *"
                                                    value={datosCliente.direccion}
                                                    onChange={(e) =>
                                                        setDatosCliente({ ...datosCliente, direccion: e.target.value })
                                                    }
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="relative">
                                                <FaStickyNote className="absolute left-3 top-4 text-gray-400" size={14} />
                                                <textarea
                                                    placeholder="Notas adicionales (ej: piso, referencia...)"
                                                    value={datosCliente.notas}
                                                    onChange={(e) =>
                                                        setDatosCliente({ ...datosCliente, notas: e.target.value })
                                                    }
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    rows={2}
                                                />
                                            </div>

                                            {/* Información de pago */}
                                            <div className="pt-4 border-t border-gray-200">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FaCreditCard className="text-orange-500" />
                                                    Información de pago
                                                </h4>
                                                <select
                                                    value={metodoPago}
                                                    onChange={(e) => setMetodoPago(e.target.value as "efectivo" | "tarjeta" | "")}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                >
                                                    <option value="">Seleccionar método de pago</option>
                                                    <option value="efectivo">Efectivo</option>
                                                    <option value="tarjeta">Tarjeta</option>
                                                </select>

                                                {metodoPago === "efectivo" && (
                                                    <div className="mt-3 space-y-3">
                                                        <div className="relative">
                                                            <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                            <input
                                                                type="number"
                                                                placeholder="¿Con cuánto paga el cliente?"
                                                                value={montoEntregado}
                                                                onChange={(e) => setMontoEntregado(e.target.value ? Number(e.target.value) : "")}
                                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                            />
                                                        </div>
                                                        {cambio !== null && (
                                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                                <p className="text-sm text-green-700">
                                                                    Cambio a devolver:{" "}
                                                                    <span className="font-bold text-green-800">
                                                                        ${cambio.toLocaleString("es-CO")}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer con botón */}
                {productos.length > 0 && (
                    <div className="p-6 border-t border-gray-200 bg-white">
                        <button
                            onClick={handleProcesarOrden}
                            disabled={procesando}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {procesando ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ) : (
                                <>
                                    <FaShoppingCart />
                                    Confirmar pedido
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}