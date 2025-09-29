"use client";

import { useCarritoStore } from "@/src/store/carritoStore";
import { useClienteStore } from "@/src/store/clienteStore";
import { crearOrdenAction } from "@/src/actions/crearOrdenAction";
import Swal from "sweetalert2";
import { useState } from "react";
import {
    FaMinus,
    FaPlus,
    FaTrash,
    FaUser,
    FaPhone,
    FaStickyNote,
    FaCreditCard,
    FaMoneyBillWave,
    FaShoppingCart,
    FaUtensils,
    FaTruck,
    FaSpinner,
    FaMapMarkerAlt
} from "react-icons/fa";
import MapaUbicacion from "../domicilio/MapaUbicacion";

// Interfaces
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

interface DatosDomicilio {
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    distancia_base_km: number;
    costo_base: number;
    distancia_exceso_km: number;
    costo_exceso: number;
}

interface OrdenData {
    cliente: DatosCliente;
    productos: ProductoOrden[];
    total: number;
    estado: string;
    tipo_orden: "establecimiento" | "domicilio";
    domicilio?: DatosDomicilio;
    metodo_pago?: "efectivo" | "tarjeta" | "transferencia";
    monto_entregado?: number;
}

interface CarritoResumenProps {
    onClose: () => void;
    tipo: "establecimiento" | "domicilio";
}

interface UbicacionConfirmada {
    coordenadas: { lat: number; lng: number };
    distancia_km: number;
    costo_domicilio: number;
    duracion_estimada: number;
    // Agregar estos campos para que coincida con MapaUbicacion
    distancia_base_km: number;
    costo_base: number;
    distancia_exceso_km: number;
    costo_exceso: number;
}

export default function CarritoResumen({ onClose, tipo }: CarritoResumenProps) {
    const { productos, total, actualizarCantidad, removerProducto, limpiarCarrito } = useCarritoStore();
    const { nombre, telefono, direccion, setCliente } = useClienteStore();

    const [procesando, setProcesando] = useState(false);
    const [notasCliente, setNotasCliente] = useState("");
    const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta" | "transferencia" | "">("");

    const [montoEntregado, setMontoEntregado] = useState<number | "">("");
    const [datosDomicilio, setDatosDomicilio] = useState<DatosDomicilio | null>(null);

    // Calcular total final incluyendo domicilio
    const totalFinal = total + (datosDomicilio?.costo_domicilio || 0);

    const cambio = metodoPago === "efectivo" && montoEntregado !== ""
        ? Number(montoEntregado) - totalFinal
        : null;

    // Función para limpiar datos del formulario
    const limpiarDatosCliente = () => {
        setCliente({ nombre: "", telefono: "", direccion: "" });
        setNotasCliente("");
        setMetodoPago("");
        setMontoEntregado("");
        setDatosDomicilio(null);
    };

    // Función para cerrar modal
    const handleClose = () => {
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


    // Manejo de confirmación de ubicación desde MapaUbicacion
    const handleUbicacionConfirmada = (ubicacion: UbicacionConfirmada) => {
        setDatosDomicilio({
            costo_domicilio: ubicacion.costo_domicilio,
            distancia_km: ubicacion.distancia_km,
            duracion_estimada: ubicacion.duracion_estimada,
            distancia_base_km: ubicacion.distancia_base_km,
            costo_base: ubicacion.costo_base,
            distancia_exceso_km: ubicacion.distancia_exceso_km,
            costo_exceso: ubicacion.costo_exceso
        });
    };

    // Manejo de limpiar ubicación desde MapaUbicacion
    const handleLimpiarUbicacion = () => {
        setDatosDomicilio(null);
    };

    const handleProcesarOrden = async () => {
        // Validaciones básicas mejoradas
        if (!nombre.trim()) {
            Swal.fire("Nombre requerido", "Debes ingresar el nombre del cliente", "warning");
            return;
        }

        if (productos.length === 0) {
            Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
            return;
        }

        // Validaciones específicas para domicilio - más estrictas
        if (tipo === "domicilio") {
            if (!datosDomicilio) {
                Swal.fire("Calcular domicilio", "Debes calcular el costo de domicilio primero", "warning");
                return;
            }

            if (!telefono?.trim()) {
                Swal.fire("Teléfono requerido", "El teléfono es obligatorio para domicilios", "warning");
                return;
            }

            if (!direccion?.trim()) {
                Swal.fire("Dirección requerida", "Debes escribir la dirección exacta de entrega", "warning");
                return;
            }

            // ✅ NUEVO: Validar método de pago obligatorio para domicilios
            if (!metodoPago) {
                Swal.fire("Método de pago requerido", "Selecciona cómo va a pagar el cliente", "warning");
                return;
            }

            // ✅ MEJORADO: Validación más clara para efectivo
            if (metodoPago === "efectivo") {
                if (montoEntregado === "" || Number(montoEntregado) <= 0) {
                    Swal.fire("Monto inválido", "Debes indicar con cuánto dinero va a pagar el cliente", "warning");
                    return;
                }

                if (Number(montoEntregado) < totalFinal) {
                    const faltante = totalFinal - Number(montoEntregado);
                    Swal.fire(
                        "Monto insuficiente",
                        `El cliente necesita $${faltante.toLocaleString("es-CO")} adicionales para completar el pago`,
                        "warning"
                    );
                    return;
                }
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
                    nombre: nombre.trim(), // ✅ Limpieza de datos
                    telefono: telefono?.trim() || undefined,
                    direccion: tipo === "domicilio" ? direccion?.trim() : "En establecimiento",
                    notas: notasCliente?.trim() || undefined,
                },
                productos: productosOrden,
                total, // Este es solo el subtotal de productos
                estado: "orden_tomada",
                tipo_orden: tipo,
                domicilio: datosDomicilio || undefined,
                metodo_pago: metodoPago || undefined,
                monto_entregado: metodoPago === "efectivo" ? Number(montoEntregado) : undefined,
            };

            const result = await crearOrdenAction(ordenData);

            if (result.success) {
                const conPersonalizacion = productos.filter(p => {
                    if (!p.ingredientes_personalizados) return false;
                    return p.ingredientes_personalizados.some(ing => !ing.incluido && !ing.obligatorio) || p.notas;
                }).length;

                // ✅ MEJORADO: Mostrar información separada en el éxito
                Swal.fire({
                    icon: "success",
                    title: "Orden creada exitosamente",
                    html: `
                    <div class="text-center">
                        <p class="text-lg font-semibold mb-3">Pedido #${result.orden?.id.slice(-8)}</p>
                        
                        <div class="bg-gray-50 rounded-lg p-3 mb-3">
                            <div class="text-sm space-y-1">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Productos:</span>
                                    <span class="font-medium">$${result.orden?.subtotal_productos?.toLocaleString("es-CO") || total.toLocaleString("es-CO")}</span>
                                </div>
                                ${result.orden?.costo_domicilio ? `
                                    <div class="flex justify-between text-blue-600">
                                        <span>Domicilio:</span>
                                        <span class="font-medium">$${result.orden.costo_domicilio.toLocaleString("es-CO")}</span>
                                    </div>
                                ` : ''}
                                <div class="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                                    <span>Total:</span>
                                    <span class="text-green-600">$${result.orden?.total_final?.toLocaleString("es-CO") || totalFinal.toLocaleString("es-CO")}</span>
                                </div>
                            </div>
                        </div>

                        ${datosDomicilio ? `
                            <div class="bg-blue-50 rounded-lg p-3 mb-3">
                                <p class="text-sm text-blue-700">
                                    <span class="font-medium">Distancia:</span> ${datosDomicilio.distancia_km} km<br>
                                    <span class="font-medium">Tiempo estimado:</span> ${datosDomicilio.duracion_estimada} min
                                </p>
                            </div>
                        ` : ''}

                        ${metodoPago === "efectivo" && result.orden?.cambio_a_devolver !== null && result.orden?.cambio_a_devolver !== undefined && result.orden?.cambio_a_devolver > 0 ? `
                            <div class="bg-green-50 rounded-lg p-3 mb-3">
                                <p class="text-sm text-green-700">
                                    <span class="font-medium">Cambio a devolver:</span> ${result.orden.cambio_a_devolver.toLocaleString("es-CO")}
                                </p>
                            </div>
                        ` : ''}

                        ${conPersonalizacion > 0 ? `<p class="text-xs text-gray-500">${conPersonalizacion} productos personalizados</p>` : ''}
                    </div>
                `,
                    confirmButtonText: "Perfecto",
                    confirmButtonColor: "#f97316",
                    width: '400px'
                }).then(() => {
                    limpiarCarrito();
                    limpiarDatosCliente(); // ✅ Limpiar también datos del cliente
                    onClose();
                });
            } else {
                // ✅ MEJORADO: Mostrar errores más claros del backend
                Swal.fire("Error", result.error || "No se pudo crear la orden", "error");
            }
        } catch (err) {
            console.error("Error procesando orden:", err);
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

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500 text-white px-3 py-2 rounded-lg">
                                {tipo === "domicilio" ? <FaTruck className="text-lg" /> : <FaShoppingCart className="text-lg" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {tipo === "domicilio" ? "Pedido a domicilio" : "Nueva orden"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {productos.length} productos en el carrito
                                </p>
                            </div>
                        </div>

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
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal productos</span>
                                <span>${total.toLocaleString("es-CO")}</span>
                            </div>

                            {datosDomicilio && (
                                <div className="flex justify-between items-center text-sm text-blue-600">
                                    <span className="flex items-center gap-1">
                                        <FaTruck size={12} />
                                        Domicilio ({datosDomicilio.distancia_km} km)
                                    </span>
                                    <span>${datosDomicilio.costo_domicilio.toLocaleString("es-CO")}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="text-gray-900 font-medium">Total final</span>
                                <span className="text-2xl font-bold text-green-600">
                                    ${totalFinal.toLocaleString("es-CO")}
                                </span>
                            </div>
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
                            {/* Sección de ubicación para domicilio - Solo para calcular costo */}
                            {tipo === "domicilio" && (
                                <MapaUbicacion
                                    onUbicacionConfirmada={handleUbicacionConfirmada}
                                    onLimpiar={handleLimpiarUbicacion}
                                    ubicacionActual={datosDomicilio ? {
                                        coordenadas: { lat: 0, lng: 0 },
                                        distancia_km: datosDomicilio.distancia_km,
                                        costo_domicilio: datosDomicilio.costo_domicilio,
                                        duracion_estimada: datosDomicilio.duracion_estimada,
                                        distancia_base_km: datosDomicilio.distancia_base_km,
                                        costo_base: datosDomicilio.costo_base,
                                        distancia_exceso_km: datosDomicilio.distancia_exceso_km,
                                        costo_exceso: datosDomicilio.costo_exceso
                                    } : null}
                                />
                            )}

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
                                                    <p className="text-sm text-gray-600">${p.precio.toLocaleString("es-CO")} c/u</p>
                                                </div>

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
                                                        <div className="flex items-center gap-2 mb-2">
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
                                            value={nombre}
                                            onChange={(e) => setCliente({ nombre: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />

                                    </div>

                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Teléfono *"
                                            value={telefono}
                                            onChange={(e) => setCliente({ telefono: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            required={tipo === "domicilio"}
                                        />
                                    </div>

                                    {tipo === "domicilio" && (
                                        <>
                                            <div className="relative">
                                                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Dirección exacta de entrega *"
                                                    value={direccion}
                                                    onChange={(e) => setCliente({ direccion: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                <p className="text-xs text-blue-700">
                                                    <strong>Importante:</strong> Escribe la dirección completa y exacta donde debe llegar el pedido.
                                                    Ejemplo: Calle 123 #45-67, Apto 301, Edificio Torres del Parque, Barrio Chapinero
                                                </p>
                                            </div>

                                            <div className="relative">
                                                <FaStickyNote className="absolute left-3 top-4 text-gray-400" size={14} />
                                                <select
                                                    value={metodoPago}
                                                    onChange={(e) => setMetodoPago(e.target.value as "efectivo" | "tarjeta" | "transferencia" | "")}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    required={tipo === "domicilio"}
                                                >
                                                    <option value="">Seleccionar método de pago *</option>
                                                    <option value="efectivo">💵 Efectivo</option>
                                                    <option value="tarjeta">💳 Tarjeta</option>
                                                    <option value="transferencia">📱 Transferencia</option>
                                                </select>
                                            </div>

                                            {/* Información de pago */}
                                            <div className="pt-4 border-t border-gray-200">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <FaCreditCard className="text-orange-500" />
                                                    Información de pago
                                                </h4>
                                                <select
                                                    value={metodoPago}
                                                    onChange={(e) => setMetodoPago(e.target.value as "efectivo" | "tarjeta" | "transferencia" | "")}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                >
                                                    <option value="">Seleccionar método de pago</option>
                                                    <option value="efectivo">💵 Efectivo</option>
                                                    <option value="tarjeta">💳 Tarjeta</option>
                                                    <option value="transferencia">📱 Transferencia</option>
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
                                                        {cambio !== null && cambio >= 0 && (
                                                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                                                <p className="text-sm text-green-700">
                                                                    Cambio a devolver:{" "}
                                                                    <span className="font-bold text-green-800">
                                                                        ${cambio.toLocaleString("es-CO")}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        )}
                                                        {cambio !== null && cambio < 0 && (
                                                            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                                                <p className="text-sm text-red-700">
                                                                    Faltan:{" "}
                                                                    <span className="font-bold text-red-800">
                                                                        ${Math.abs(cambio).toLocaleString("es-CO")}
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
                            disabled={procesando || (tipo === "domicilio" && !datosDomicilio)}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {procesando ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <>
                                    {tipo === "domicilio" ? <FaTruck /> : <FaShoppingCart />}
                                    {tipo === "domicilio" && !datosDomicilio
                                        ? "Calcula el costo de domicilio primero"
                                        : "Confirmar pedido"
                                    }
                                </>
                            )}
                        </button>

                        {tipo === "domicilio" && !datosDomicilio && (
                            <p className="text-center text-sm text-gray-500 mt-2">
                                Selecciona tu ubicación en el mapa para calcular el costo de envío
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}