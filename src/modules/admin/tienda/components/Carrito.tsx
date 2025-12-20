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
    FaArrowLeft,
    FaCheckCircle
} from "react-icons/fa";
import ModalDatosCliente from "@/src/modules/cliente/domicilios/components/ModalDatosCliente";
import type { TipoOrden } from "@/src/shared/types/orden";
import { useCarritoResumen } from "../hooks/useCarritoResumen";

interface CarritoResumenProps {
    onClose: () => void;
    tipo: TipoOrden;
}

export default function Carrito({ onClose, tipo }: CarritoResumenProps) {
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
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={handleClose}
                />

                <motion.div
                    key="modal"
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed inset-0 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 bg-white z-50 lg:rounded-3xl lg:shadow-2xl lg:max-w-3xl lg:w-full lg:max-h-[95vh] flex flex-col overflow-hidden"
                >
                    {/* Header con degradado */}
                    <div className="flex-shrink-0 relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

                        <div className="lg:hidden relative flex items-center gap-3 p-4">
                            <button
                                onClick={handleClose}
                                className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all"
                            >
                                <FaArrowLeft className="text-white text-lg" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl">
                                    {tipo === "domicilio" ? <FaTruck className="text-xl" /> : <FaUtensils className="text-xl" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight">
                                        {tipo === "mesa" ? "Orden en Mesa" : tipo === "para_llevar" ? "Para Llevar" : "Delivery"}
                                    </h2>
                                    <p className="text-orange-100 text-xs flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        En preparación
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex relative items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="bg-white/20 backdrop-blur-md p-3 rounded-2xl"
                                >
                                    {tipo === "domicilio" ? <FaTruck className="text-2xl" /> : <FaUtensils className="text-2xl" />}
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        {tipo === "mesa" ? "Orden en Mesa" : tipo === "para_llevar" ? "Orden Para Llevar" : "Pedido a Domicilio"}
                                    </h2>
                                    <p className="text-orange-100 text-sm flex items-center gap-2 mt-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        {tipo === "domicilio" ? "Entrega a domicilio" : "En preparación"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-3 rounded-xl transition-all hover:scale-110"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Contenido con scroll */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50">
                        <div className="p-6 space-y-6">
                            {/* Resumen superior */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-lg border border-gray-100"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-600 text-sm font-medium">Resumen del pedido</span>
                                    {productos.length > 0 && (
                                        <button
                                            onClick={handleLimpiarTodo}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                                            title="Limpiar carrito"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    )}
                                </div>

                                {productos.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Subtotal ({productos.length} items)</span>
                                            <span className="font-semibold text-gray-900">${total.toLocaleString("es-CO")}</span>
                                        </div>

                                        {datosDomicilio && (
                                            <div className="flex justify-between items-center text-sm bg-orange-50 -mx-5 px-5 py-3 rounded-xl">
                                                <span className="text-orange-700 flex items-center gap-2">
                                                    <FaTruck size={14} />
                                                    Domicilio • {datosDomicilio.distancia_km} km
                                                </span>
                                                <span className="font-semibold text-orange-700">${datosDomicilio.costo_domicilio.toLocaleString("es-CO")}</span>
                                            </div>
                                        )}

                                        <div className="pt-3 border-t-2 border-dashed border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-900 font-bold text-lg">Total a pagar</span>
                                                <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                                    ${totalFinal.toLocaleString("es-CO")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>

                            {productos.length === 0 ? (
                                <div className="text-center py-16 px-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                    >
                                        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <FaShoppingCart className="text-4xl text-gray-400" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h3>
                                    <p className="text-sm text-gray-500">Agrega productos para continuar con tu pedido</p>
                                </div>
                            ) : (
                                <>
                                    {/* Info de domicilio */}
                                    {tipo === "domicilio" && (
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="space-y-4"
                                        >
                                            {calculandoDomicilio ? (
                                                <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-5 border border-blue-200 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <FaSpinner className="animate-spin text-blue-600 text-xl" />
                                                        <div>
                                                            <h4 className="font-bold text-blue-900">Calculando costo de domicilio</h4>
                                                            <p className="text-sm text-blue-700">Obteniendo tu ubicación...</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : datosDomicilio ? (
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 shadow-sm">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-bold text-green-900 flex items-center gap-2">
                                                            <FaCheckCircle className="text-green-600" />
                                                            Información de entrega
                                                        </h4>
                                                        <button
                                                            onClick={recalcularDomicilio}
                                                            className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            Recalcular
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                                            <FaRoute className="mx-auto text-orange-500 mb-2 text-xl" />
                                                            <p className="text-xs text-gray-500 mb-1">Distancia</p>
                                                            <p className="font-bold text-gray-900">{datosDomicilio.distancia_km} km</p>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                                            <FaClock className="mx-auto text-orange-500 mb-2 text-xl" />
                                                            <p className="text-xs text-gray-500 mb-1">Tiempo</p>
                                                            <p className="font-bold text-gray-900">{datosDomicilio.duracion_estimada} min</p>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                                            <FaMoneyBillWave className="mx-auto text-orange-500 mb-2 text-xl" />
                                                            <p className="text-xs text-gray-500 mb-1">Envío</p>
                                                            <p className="font-bold text-gray-900">${datosDomicilio.costo_domicilio.toLocaleString('es-CO')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : errorDomicilio ? (
                                                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-5 border border-red-200 shadow-sm">
                                                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                                        <FaTimes className="text-red-600" />
                                                        Error calculando domicilio
                                                    </h4>
                                                    <p className="text-sm text-red-700 mb-3">{errorDomicilio}</p>
                                                    <button
                                                        onClick={recalcularDomicilio}
                                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
                                                    >
                                                        Intentar nuevamente
                                                    </button>
                                                </div>
                                            ) : null}
                                        </motion.div>
                                    )}

                                    {/* Lista de productos */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="space-y-3"
                                    >
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                            <FaUtensils className="text-orange-500" />
                                            Productos seleccionados
                                        </h4>

                                        {productos.map((p, idx) => (
                                            <motion.div
                                                key={p.personalizacion_id || `${p.id}-${Math.random()}`}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-gray-900 mb-1">{p.nombre}</h5>
                                                            <p className="text-sm text-gray-500">${p.precio.toLocaleString("es-CO")} c/u</p>

                                                            {(p.ingredientes_personalizados && p.ingredientes_personalizados.some(ing => !ing.incluido && !ing.obligatorio)) && (
                                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                                    <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg font-medium">
                                                                        Sin: {p.ingredientes_personalizados
                                                                            .filter(ing => !ing.incluido && !ing.obligatorio)
                                                                            .map(ing => ing.nombre)
                                                                            .join(", ")}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {p.notas && (
                                                                <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                                                                    💬 {p.notas}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end gap-3">
                                                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                                                <button
                                                                    onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad - 1)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-orange-50 hover:text-orange-600 transition-all shadow-sm"
                                                                >
                                                                    <FaMinus size={12} />
                                                                </button>
                                                                <div className="w-10 text-center font-bold text-gray-900">
                                                                    {p.cantidad}
                                                                </div>
                                                                <button
                                                                    onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad + 1)}
                                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-sm"
                                                                >
                                                                    <FaPlus size={12} />
                                                                </button>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="font-bold text-lg text-gray-900">
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
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {/* Datos del cliente / Mesa */}
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                    >
                                        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4 text-lg">
                                            <FaUser className="text-orange-500" />
                                            {tipo === "domicilio" ? "Datos del cliente" : tipo === "mesa" ? "Identificación Mesa" : "Datos de Entrega"}
                                        </h4>

                                        <div className="space-y-3">
                                            {tipo !== "domicilio" ? (
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        {tipo === "mesa" ? "Mesa / Cliente" : "Nombre del cliente"} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={datosEditados.nombre}
                                                        onChange={(e) => setDatosEditados(prev => ({ ...prev, nombre: e.target.value }))}
                                                        placeholder={tipo === "mesa" ? "Ej: Mesa 5 o Juan" : "Ej: Maria para llevar"}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                                                    {!cliente?.nombre ? (
                                                        <div className="text-center py-6">
                                                            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <FaUser className="text-2xl text-gray-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-3">No hay datos del cliente</p>
                                                            <button
                                                                onClick={() => setMostrarModalCliente(true)}
                                                                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:bg-orange-50 px-4 py-2 rounded-lg transition-all"
                                                            >
                                                                Agregar datos
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-orange-100 text-orange-600 p-2.5 rounded-lg">
                                                                    <FaUser size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Nombre</p>
                                                                    <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-orange-100 text-orange-600 p-2.5 rounded-lg">
                                                                    <FaPhone size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500">Teléfono</p>
                                                                    <p className="font-semibold text-gray-900">{cliente.telefono || 'No especificado'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-orange-100 text-orange-600 p-2.5 rounded-lg">
                                                                    <FaMapMarkerAlt size={14} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-gray-500">Dirección</p>
                                                                    <p className="font-semibold text-gray-900">{cliente.direccion || 'No especificado'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="pt-2 border-t border-gray-200">
                                                                <button
                                                                    onClick={() => setMostrarModalCliente(true)}
                                                                    className="w-full text-sm text-orange-600 hover:text-orange-700 font-medium py-2 hover:bg-orange-50 rounded-lg transition-all"
                                                                >
                                                                    Editar datos
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Notas adicionales (opcional)
                                                </label>
                                                <textarea
                                                    value={notasCliente}
                                                    onChange={(e) => setNotasCliente(e.target.value)}
                                                    placeholder={tipo === "domicilio"
                                                        ? "Ej: Timbre no funciona, tocar la puerta..."
                                                        : "Ej: Llegaré en 15 minutos..."
                                                    }
                                                    rows={3}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 resize-none transition-all"
                                                />
                                            </div>

                                            {tipo === "domicilio" && (
                                                <div className="pt-4 border-t border-gray-200">
                                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                        <FaCreditCard className="text-orange-500" />
                                                        Método de pago
                                                    </h4>
                                                    <select
                                                        value={metodoPago}
                                                        onChange={(e) => setMetodoPago(e.target.value as "efectivo" | "tarjeta" | "transferencia" | "")}
                                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 font-medium text-gray-700 bg-gray-50 transition-all"
                                                    >
                                                        <option value="">Seleccionar método de pago</option>
                                                        <option value="efectivo">💵 Efectivo</option>
                                                        <option value="tarjeta">💳 Tarjeta</option>
                                                        <option value="transferencia">📱 Transferencia</option>
                                                    </select>

                                                    {metodoPago === "efectivo" && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            className="mt-4 space-y-3"
                                                        >
                                                            <div className="relative">
                                                                <FaMoneyBillWave className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                                <input
                                                                    type="number"
                                                                    placeholder="¿Con cuánto paga el cliente?"
                                                                    value={montoEntregado}
                                                                    onChange={(e) => setMontoEntregado(e.target.value ? Number(e.target.value) : "")}
                                                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 font-medium transition-all"
                                                                />
                                                            </div>
                                                            {cambio !== null && cambio >= 0 && (
                                                                <motion.div
                                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200"
                                                                >
                                                                    <p className="text-sm text-green-700 flex items-center justify-between">
                                                                        <span>Cambio a devolver</span>
                                                                        <span className="font-bold text-xl text-green-800">
                                                                            ${cambio.toLocaleString("es-CO")}
                                                                        </span>
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                            {cambio !== null && cambio < 0 && (
                                                                <motion.div
                                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200"
                                                                >
                                                                    <p className="text-sm text-red-700 flex items-center justify-between">
                                                                        <span>Faltan</span>
                                                                        <span className="font-bold text-xl text-red-800">
                                                                            ${Math.abs(cambio).toLocaleString("es-CO")}
                                                                        </span>
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer fijo con botón de acción */}
                    {productos.length > 0 && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.3, type: "spring", damping: 20 }}
                            className="flex-shrink-0 border-t-2 border-gray-100 bg-white lg:rounded-b-3xl shadow-2xl"
                        >
                            <div className="p-6">
                                {tipo === "domicilio" && (calculandoDomicilio || errorDomicilio) && (
                                    <div className="mb-4 text-center text-sm">
                                        {calculandoDomicilio && (
                                            <p className="text-blue-600 flex items-center justify-center gap-2">
                                                <FaSpinner className="animate-spin" />
                                                Calculando costo de envío...
                                            </p>
                                        )}
                                        {errorDomicilio && (
                                            <p className="text-red-600 font-medium">
                                                Error calculando domicilio
                                            </p>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={handleProcesarOrden}
                                    disabled={procesando || (tipo === "domicilio" && (!datosDomicilio || calculandoDomicilio))}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    {procesando ? (
                                        <>
                                            <FaSpinner className="animate-spin text-xl" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheckCircle className="text-xl" />
                                            {tipo === "domicilio" && calculandoDomicilio
                                                ? "Calculando..."
                                                : tipo === "domicilio" && !datosDomicilio
                                                    ? "Calculando domicilio..."
                                                    : "Confirmar pedido"
                                            }
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 mt-3">
                                    Al confirmar aceptas nuestros términos y condiciones
                                </p>
                            </div>
                        </motion.div>
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