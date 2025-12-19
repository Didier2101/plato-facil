import { motion, AnimatePresence } from "framer-motion";
import {
    FaMinus,
    FaPlus,
    FaTrash,
    FaUser,
    FaPhone,
    FaCreditCard,
    FaMoneyBillWave,
    FaShoppingCart,
    FaUtensils,
    FaTruck,
    FaSpinner,
    FaMapMarkerAlt,
    FaTimes,
    FaRoute,
    FaClock,
    FaArrowLeft
} from "react-icons/fa";
import ModalDatosCliente from "@/src/modules/cliente/domicilios/components/ModalDatosCliente";
import type { TipoOrden } from "@/src/shared/types/orden";
import { useCarritoResumen } from "../hooks/useCarritoResumen";


interface CarritoResumenProps {
    onClose: () => void;
    tipo: TipoOrden;
}

export default function CarritoResumen({ onClose, tipo }: CarritoResumenProps) {
    const {
        procesando,
        notasCliente,
        setNotasCliente,
        metodoPago,
        setMetodoPago,
        montoEntregado,
        setMontoEntregado,
        datosDomicilio,
        calculandoDomicilio,
        errorDomicilio,
        mostrarModalCliente,
        setMostrarModalCliente,
        datosEditados,
        setDatosEditados,
        totalFinal,
        cambio,
        handleLimpiarTodo,
        handleProcesarOrden,
        recalcularDomicilio,
        productos,
        removerProducto,
        actualizarCantidad,
        total,
        cliente
    } = useCarritoResumen(tipo, onClose);

    const handleClose = () => onClose();
    const handleCloseModalCliente = () => setMostrarModalCliente(false);


    return (
        <>
            <AnimatePresence>
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed inset-0 bg-black/50 z-50"
                    onClick={handleClose}
                />

                <motion.div
                    key="modal"
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="fixed inset-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-white z-50 lg:rounded-3xl lg:shadow-2xl lg:max-w-2xl lg:w-full lg:max-h-[90vh] flex flex-col"
                >
                    <div className="flex-shrink-0 border-b border-gray-200 bg-white lg:rounded-t-3xl">
                        <div className="lg:hidden flex items-center gap-3 p-4">
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <FaArrowLeft className="text-gray-700 text-lg" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900 truncate">
                                {tipo === "mesa" ? "Orden en Mesa" : tipo === "para_llevar" ? "Orden Para Llevar" : "Pedido a domicilio"}
                            </h2>
                        </div>

                        <div className="hidden lg:flex items-center justify-between p-6">
                            <h2 className="text-xl font-bold text-gray-900 truncate">
                                {tipo === "mesa" ? "Orden en Mesa" : tipo === "para_llevar" ? "Orden Para Llevar" : "Pedido a domicilio"}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <FaTimes className="text-gray-700 text-lg" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <div className="p-6 space-y-6">
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-500 text-white p-2 rounded-lg">
                                            {tipo === "domicilio" ? <FaTruck className="text-lg" /> : <FaUtensils className="text-lg" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">
                                                {tipo === "mesa" ? "Orden en Mesa" : tipo === "para_llevar" ? "Orden Para Llevar" : "Pedido a domicilio"}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {tipo !== "domicilio" && datosEditados.nombre
                                                    ? `Identificador: ${datosEditados.nombre}`
                                                    : cliente?.nombre
                                                        ? `Cliente: ${cliente.nombre}`
                                                        : `${productos.length} productos en el carrito`
                                                }
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

                                {productos.length > 0 && (
                                    <div className="space-y-2">
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

                            {productos.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <FaShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                                    <p className="text-sm text-gray-500">Agrega productos para continuar</p>
                                </div>
                            ) : (
                                <>
                                    {tipo === "domicilio" && (
                                        <div className="space-y-4">
                                            {calculandoDomicilio ? (
                                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                    <div className="flex items-center gap-3">
                                                        <FaSpinner className="animate-spin text-blue-600" size={20} />
                                                        <div>
                                                            <h4 className="font-semibold text-blue-900">Calculando costo de domicilio</h4>
                                                            <p className="text-sm text-blue-700">Obteniendo tu ubicación...</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : datosDomicilio ? (
                                                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold text-green-900 flex items-center gap-2">
                                                            <FaTruck className="text-green-600" />
                                                            Costo de domicilio calculado
                                                        </h4>
                                                        <button
                                                            onClick={recalcularDomicilio}
                                                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                                                        >
                                                            Recalcular
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div className="bg-white rounded-lg p-3">
                                                            <FaRoute className="mx-auto text-blue-600 mb-1" />
                                                            <p className="text-xs text-gray-600">Distancia</p>
                                                            <p className="font-bold text-blue-900">{datosDomicilio.distancia_km} km</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3">
                                                            <FaClock className="mx-auto text-green-600 mb-1" />
                                                            <p className="text-xs text-gray-600">Tiempo</p>
                                                            <p className="font-bold text-green-900">{datosDomicilio.duracion_estimada} min</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3">
                                                            <span className="text-orange-600 text-lg block">$</span>
                                                            <p className="text-xs text-gray-600">Costo</p>
                                                            <p className="font-bold text-orange-900">${datosDomicilio.costo_domicilio.toLocaleString('es-CO')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : errorDomicilio ? (
                                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                                    <h4 className="font-semibold text-red-900 mb-2">Error calculando domicilio</h4>
                                                    <p className="text-sm text-red-700 mb-3">{errorDomicilio}</p>
                                                    <button
                                                        onClick={recalcularDomicilio}
                                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                                                    >
                                                        Intentar nuevamente
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
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

                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                            <FaUser className="text-orange-500" />
                                            {tipo === "domicilio" ? "Datos del cliente" : tipo === "mesa" ? "Identificación Mesa" : "Datos de Entrega"}
                                        </h4>

                                        <div className="space-y-3">
                                            {tipo !== "domicilio" ? (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {tipo === "mesa" ? "Mesa / Cliente" : "Nombre del cliente"} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={datosEditados.nombre}
                                                        onChange={(e) => setDatosEditados(prev => ({ ...prev, nombre: e.target.value }))}
                                                        placeholder={tipo === "mesa" ? "Ej: Mesa 5 o Juan" : "Ej: Maria para llevar"}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                                                    {!cliente?.nombre ? (
                                                        <div className="text-center py-4">
                                                            <FaUser className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                            <p className="text-sm text-gray-500">No hay datos del cliente</p>
                                                            <button
                                                                onClick={() => setMostrarModalCliente(true)}
                                                                className="mt-3 text-sm text-orange-600 hover:text-orange-700 underline"
                                                            >
                                                                Agregar datos
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <FaUser className="text-gray-400" size={14} />
                                                                <p className="text-sm"><span className="font-medium">Nombre:</span> {cliente.nombre}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <FaPhone className="text-gray-400" size={14} />
                                                                <p className="text-sm"><span className="font-medium">Teléfono:</span> {cliente.telefono || 'No especificado'}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <FaMapMarkerAlt className="text-gray-400" size={14} />
                                                                <p className="text-sm"><span className="font-medium">Dirección:</span> {cliente.direccion || 'No especificado'}</p>
                                                            </div>
                                                            <div className="pt-2 border-t border-gray-200">
                                                                <button
                                                                    onClick={() => setMostrarModalCliente(true)}
                                                                    className="w-full text-sm text-orange-600 hover:text-orange-700 py-2"
                                                                >
                                                                    Editar datos
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Notas adicionales (opcional)
                                                </label>
                                                <textarea
                                                    value={notasCliente}
                                                    onChange={(e) => setNotasCliente(e.target.value)}
                                                    placeholder={tipo === "domicilio"
                                                        ? "Ej: Timbre no funciona, tocar la puerta..."
                                                        : "Ej: Llegaré en 15 minutos..."
                                                    }
                                                    rows={2}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                                />
                                            </div>

                                            {tipo === "domicilio" && (
                                                <>
                                                    <div className="pt-4 border-t border-gray-200">
                                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
                                </>
                            )}
                        </div>
                    </div>

                    {productos.length > 0 && (
                        <div className="flex-shrink-0 border-t border-gray-200 bg-white lg:rounded-b-3xl">
                            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-600">
                                    {tipo === "domicilio" && calculandoDomicilio && (
                                        <p className="text-center text-blue-600 flex items-center gap-2">
                                            <FaSpinner className="animate-spin" />
                                            Calculando costo de envío...
                                        </p>
                                    )}
                                    {tipo === "domicilio" && errorDomicilio && (
                                        <p className="text-center text-red-600">
                                            Error calculando domicilio
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleProcesarOrden}
                                    disabled={procesando || (tipo === "domicilio" && (!datosDomicilio || calculandoDomicilio))}
                                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:scale-105 min-w-[200px]"
                                >
                                    {procesando ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <>
                                            {tipo === "domicilio" ? <FaTruck /> : <FaShoppingCart />}
                                            {tipo === "domicilio" && calculandoDomicilio
                                                ? "Calculando..."
                                                : tipo === "domicilio" && !datosDomicilio
                                                    ? "Calculando domicilio..."
                                                    : "Confirmar pedido"
                                            }
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {mostrarModalCliente && (
                <ModalDatosCliente
                    onClose={handleCloseModalCliente}
                />
            )}
        </>
    );
}