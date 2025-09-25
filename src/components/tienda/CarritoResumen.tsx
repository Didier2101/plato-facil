import React, { useState } from "react";
import { useCarritoStore } from "@/src/store/carritoStore";
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
    FaUtensils,
    FaRoute,
    FaClock,
    FaTruck
} from "react-icons/fa";

// Importar el componente CalculadorDomicilio
// import CalculadorDomicilio from "@/src/components/domicilio/CalculadorDomicilio";

// Simulación temporal del CalculadorDomicilio (REMOVER cuando uses el componente real)
const CalculadorDomicilio: React.FC<{
    onDireccionCalculada: (resultado: ResultadoCalculoDomicilio) => void;
    onClose: () => void;
}> = ({ onDireccionCalculada, onClose }) => {
    const [direccion, setDireccion] = useState('');
    const [calculando, setCalculando] = useState(false);

    const handleCalcular = async () => {
        if (!direccion.trim()) return;

        setCalculando(true);

        // Simular cálculo (reemplazar con el real)
        setTimeout(() => {
            const resultado = {
                direccion: {
                    direccion_formateada: direccion,
                    coordenadas: { lat: 4.6097, lng: -74.0817 }
                },
                ruta: {
                    distancia_km: 5.2,
                    duracion_minutos: 25,
                    costo_domicilio: 6800,
                    fuera_de_cobertura: false
                },
                costo_domicilio: 6800
            };

            onDireccionCalculada(resultado);
            setCalculando(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-4">Calcular Domicilio</h3>
                <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingresa tu dirección"
                    className="w-full p-3 border rounded-lg mb-4"
                />
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleCalcular}
                        disabled={calculando || !direccion.trim()}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg disabled:bg-gray-400"
                    >
                        {calculando ? 'Calculando...' : 'Calcular'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Tipos actualizados para incluir domicilio
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

// NUEVO: Interface para el resultado del cálculo de domicilio
interface ResultadoCalculoDomicilio {
    direccion: {
        direccion_formateada: string;
        coordenadas: { lat: number; lng: number };
        ciudad?: string;
        barrio?: string;
    };
    ruta: {
        distancia_km: number;
        duracion_minutos: number;
        costo_domicilio: number;
        fuera_de_cobertura: boolean;
    };
    costo_domicilio: number;
}

// NUEVO: Interface para datos de domicilio
interface DatosDomicilio {
    costo_domicilio: number;
    distancia_km: number;
    duracion_estimada: number;
    direccion_formateada?: string;
}

interface OrdenData {
    cliente: DatosCliente;
    productos: ProductoOrden[];
    total: number;
    estado: string;
    tipo_orden: "establecimiento" | "domicilio";
    domicilio?: DatosDomicilio; // NUEVO
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

    // NUEVO: Estados para domicilio
    const [mostrarCalculadorDomicilio, setMostrarCalculadorDomicilio] = useState(false);
    const [datosDomicilio, setDatosDomicilio] = useState<DatosDomicilio | null>(null);

    // Calcular total final incluyendo domicilio
    const totalFinal = total + (datosDomicilio?.costo_domicilio || 0);

    const cambio =
        metodoPago === "efectivo" && montoEntregado !== ""
            ? Number(montoEntregado) - totalFinal // MODIFICADO: usar totalFinal
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
        setDatosDomicilio(null); // NUEVO: limpiar domicilio
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

    // NUEVO: Manejar resultado del cálculo de domicilio
    const handleDireccionCalculada = (resultado: ResultadoCalculoDomicilio) => {
        setDatosDomicilio({
            costo_domicilio: resultado.costo_domicilio,
            distancia_km: resultado.ruta.distancia_km,
            duracion_estimada: resultado.ruta.duracion_minutos,
            direccion_formateada: resultado.direccion.direccion_formateada
        });

        // Actualizar dirección del cliente con la formateada
        setDatosCliente(prev => ({
            ...prev,
            direccion: resultado.direccion.direccion_formateada
        }));

        setMostrarCalculadorDomicilio(false);
    };

    const handleProcesarOrden = async () => {
        if (!datosCliente.nombre?.trim()) {
            Swal.fire("Nombre requerido", "Debes ingresar el nombre del cliente", "warning");
            return;
        }

        if (tipo === "domicilio") {
            if (!datosDomicilio) {
                Swal.fire("Calcula el domicilio", "Debes calcular el costo de domicilio primero", "warning");
                return;
            }

            if (!datosCliente.direccion?.trim()) {
                Swal.fire("Dirección requerida", "Debes ingresar la dirección de entrega", "warning");
                return;
            }
        }

        if (productos.length === 0) {
            Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
            return;
        }

        if (tipo === "domicilio" && metodoPago === "efectivo") {
            if (montoEntregado === "" || Number(montoEntregado) < totalFinal) {
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
                domicilio: datosDomicilio || undefined, // NUEVO: incluir datos de domicilio
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
                    html: `
                        <div class="text-center">
                            <p class="text-lg font-semibold mb-2">Pedido #${result.orden?.id.slice(-8)}</p>
                            <p class="text-gray-600 mb-2">Total: $${totalFinal.toLocaleString("es-CO")}</p>
                            ${datosDomicilio ? `
                                <div class="bg-blue-50 rounded-lg p-3 mt-3">
                                    <p class="text-sm text-blue-700">
                                        <span class="font-medium">Domicilio:</span> $${datosDomicilio.costo_domicilio.toLocaleString("es-CO")}<br>
                                        <span class="font-medium">Distancia:</span> ${datosDomicilio.distancia_km} km<br>
                                        <span class="font-medium">Tiempo estimado:</span> ${datosDomicilio.duracion_estimada} min
                                    </p>
                                </div>
                            ` : ''}
                            ${conPersonalizacion > 0 ? `<p class="text-xs text-gray-500 mt-2">${conPersonalizacion} productos personalizados</p>` : ''}
                        </div>
                    `,
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
                                {tipo === "domicilio" ? <FaTruck className="text-lg" /> : <FaShoppingCart className="text-lg" />}
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
                        <div className="mt-4 space-y-2">
                            {/* Subtotal de productos */}
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Subtotal productos</span>
                                <span>${total.toLocaleString("es-CO")}</span>
                            </div>

                            {/* Costo de domicilio */}
                            {datosDomicilio && (
                                <div className="flex justify-between items-center text-sm text-blue-600">
                                    <span className="flex items-center gap-1">
                                        <FaTruck size={12} />
                                        Domicilio ({datosDomicilio.distancia_km} km)
                                    </span>
                                    <span>${datosDomicilio.costo_domicilio.toLocaleString("es-CO")}</span>
                                </div>
                            )}

                            {/* Total final */}
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
                            {/* NUEVO: Sección de domicilio para pedidos a domicilio */}
                            {tipo === "domicilio" && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 text-lg mb-3 flex items-center gap-2">
                                        <FaTruck className="text-blue-600" />
                                        Información de Domicilio
                                    </h4>

                                    {!datosDomicilio ? (
                                        <div className="text-center py-4">
                                            <p className="text-blue-700 mb-3">
                                                Calcula el costo de envío a tu dirección
                                            </p>
                                            <button
                                                onClick={() => setMostrarCalculadorDomicilio(true)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                            >
                                                <FaRoute />
                                                Calcular Domicilio
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-white rounded-lg p-3 border">
                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <div className="text-center">
                                                        <FaRoute className="mx-auto text-blue-600 mb-1" />
                                                        <p className="text-sm text-gray-600">Distancia</p>
                                                        <p className="font-bold text-blue-900">{datosDomicilio.distancia_km} km</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <FaClock className="mx-auto text-green-600 mb-1" />
                                                        <p className="text-sm text-gray-600">Tiempo estimado</p>
                                                        <p className="font-bold text-green-900">{datosDomicilio.duracion_estimada} min</p>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t text-center">
                                                    <p className="text-sm text-gray-600">Costo de envío</p>
                                                    <p className="text-xl font-bold text-orange-600">
                                                        ${datosDomicilio.costo_domicilio.toLocaleString("es-CO")}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setDatosDomicilio(null);
                                                    setDatosCliente(prev => ({ ...prev, direccion: "" }));
                                                }}
                                                className="w-full text-blue-600 hover:text-blue-800 text-sm underline"
                                            >
                                                Cambiar dirección
                                            </button>
                                        </div>
                                    )}
                                </div>
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

                                            {/* Campo de dirección (readonly si ya se calculó domicilio) */}
                                            <div className="relative">
                                                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Dirección de entrega *"
                                                    value={datosCliente.direccion}
                                                    onChange={(e) =>
                                                        setDatosCliente({ ...datosCliente, direccion: e.target.value })
                                                    }
                                                    readOnly={!!datosDomicilio}
                                                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${datosDomicilio ? 'bg-gray-100 text-gray-600' : ''
                                                        }`}
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
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            ) : (
                                <>
                                    {tipo === "domicilio" ? <FaTruck /> : <FaShoppingCart />}
                                    {tipo === "domicilio" && !datosDomicilio
                                        ? "Calcula el domicilio primero"
                                        : "Confirmar pedido"
                                    }
                                </>
                            )}
                        </button>

                        {/* Texto informativo para domicilio */}
                        {tipo === "domicilio" && !datosDomicilio && (
                            <p className="text-center text-sm text-gray-500 mt-2">
                                Necesitas calcular el costo de domicilio antes de continuar
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal del calculador de domicilio */}
            {mostrarCalculadorDomicilio && (
                <CalculadorDomicilio
                    onDireccionCalculada={handleDireccionCalculada}
                    onClose={() => setMostrarCalculadorDomicilio(false)}
                />
            )}
        </>
    );
}