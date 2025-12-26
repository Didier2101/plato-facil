"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Minus,
    Plus,
    Trash2,
    User,
    Phone,
    CreditCard,
    ShoppingBag,
    Truck,
    MapPin,
    X,
    CheckCircle2,
    AlertCircle,
    Banknote,
    MessageSquare
} from "lucide-react";
import { useClienteStore } from "@/src/modules/cliente/domicilios/store/clienteStore";
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

    const { setMostrarModal } = useClienteStore();

    const handleClose = () => onClose();

    return (
        <>
            <AnimatePresence>
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-white sm:rounded-[3.5rem] rounded-t-[3.5rem] shadow-2xl flex flex-col h-[92vh] sm:h-[88vh] overflow-hidden border-t border-x border-white"
                    >
                        {/* Header Section */}
                        <div className="p-10 pb-8 flex items-center justify-between bg-slate-50/50 backdrop-blur-md border-b border-slate-100">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <ShoppingBag className="h-8 w-8 relative z-10 transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Tu Pedido</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">
                                            {tipo === "domicilio" ? "Delivery Especial" : tipo === "para_llevar" ? "Pickup" : "Local Service"}
                                        </p>
                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{productos.length} Items</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:scale-110 border border-slate-100 shadow-sm"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-10 pb-96 scrollbar-hide">
                            {productos.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                                    <div className="h-32 w-32 bg-slate-50 rounded-full flex items-center justify-center ring-[20px] ring-slate-50/30">
                                        <ShoppingBag className="h-12 w-12 text-slate-200" />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Tu bolsa está vacía</p>
                                        <p className="text-xs text-slate-400 font-bold max-w-[240px] leading-relaxed uppercase tracking-widest">Aún no has agregado ninguna de nuestras delicias</p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 active:scale-95 transition-all"
                                    >
                                        Seguir Explorando
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Products List */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between px-2">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Resumen de Selección</h3>
                                            <button
                                                onClick={handleLimpiarTodo}
                                                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline px-2"
                                            >
                                                Vaciar Carrito
                                            </button>
                                        </div>
                                        <div className="grid gap-4">
                                            {productos.map((p) => (
                                                <motion.div
                                                    layout
                                                    key={p.personalizacion_id || p.id}
                                                    className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-50 shadow-sm flex items-center gap-6 hover:border-orange-100 hover:shadow-xl hover:shadow-slate-100 transition-all group relative overflow-hidden"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{p.nombre}</h4>
                                                        <p className="text-[10px] font-black text-orange-500 uppercase mt-1 tracking-widest">
                                                            ${p.precio.toLocaleString("es-CO")} p/u
                                                        </p>
                                                        {p.notas && (
                                                            <div className="mt-3 flex items-center gap-2 text-[9px] font-black text-slate-400 bg-slate-50 w-fit px-4 py-1.5 rounded-full uppercase tracking-tighter">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {p.notas}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-[1.8rem] border border-slate-100">
                                                        <button
                                                            onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad - 1)}
                                                            className="h-10 w-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-sm hover:text-red-500 hover:bg-red-50/50 active:scale-90 transition-all"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-black text-slate-900">{p.cantidad}</span>
                                                        <button
                                                            onClick={() => p.personalizacion_id && actualizarCantidad(p.personalizacion_id, p.cantidad + 1)}
                                                            className="h-10 w-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all hover:bg-orange-500"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => p.personalizacion_id && removerProducto(p.personalizacion_id)}
                                                        className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Delivery Info */}
                                    {tipo === "domicilio" && (
                                        <section className="space-y-5">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Logística de Envío</h3>

                                            {calculandoDomicilio ? (
                                                <div className="bg-orange-50/30 rounded-[3rem] p-12 border-2 border-orange-100/50 flex flex-col items-center gap-6 text-center">
                                                    <div className="h-16 w-16 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-orange-200 animate-bounce">
                                                        <Truck className="h-8 w-8" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-black text-orange-600 uppercase tracking-[0.2em]">Estimando recorrido...</p>
                                                        <p className="text-[10px] font-bold text-orange-400 uppercase">Calculando distancias en tiempo real</p>
                                                    </div>
                                                </div>
                                            ) : datosDomicilio ? (
                                                <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-1000 group-hover:scale-150 group-hover:-translate-x-10 group-hover:translate-y-10">
                                                        <Truck className="h-32 w-32" />
                                                    </div>
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                                                                <Truck className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Estado de ruta</p>
                                                                <p className="text-sm font-black uppercase tracking-widest">Disponible para entrega</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={recalcularDomicilio}
                                                            className="text-[10px] font-black text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest"
                                                        >
                                                            Recalcular
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-5 relative z-10">
                                                        <div className="bg-white/5 backdrop-blur-sm rounded-[1.8rem] p-5 border border-white/5">
                                                            <p className="text-[10px] font-black text-orange-500/60 uppercase mb-2 tracking-tighter text-center">Distancia</p>
                                                            <p className="text-lg font-black tracking-tight text-center">{datosDomicilio.distancia_km} <span className="text-[10px] opacity-40">KM</span></p>
                                                        </div>
                                                        <div className="bg-white/5 backdrop-blur-sm rounded-[1.8rem] p-5 border border-white/5">
                                                            <p className="text-[10px] font-black text-orange-500/60 uppercase mb-2 tracking-tighter text-center">Estimado</p>
                                                            <p className="text-lg font-black tracking-tight text-center">{datosDomicilio.duracion_estimada} <span className="text-[10px] opacity-40">MIN</span></p>
                                                        </div>
                                                        <div className="bg-orange-500 rounded-[1.8rem] p-5 shadow-2xl shadow-orange-500/20 text-center">
                                                            <p className="text-[10px] font-black text-white uppercase mb-2 tracking-tighter">Envío</p>
                                                            <p className="text-lg font-black tracking-tight">${datosDomicilio.costo_domicilio.toLocaleString('es-CO')}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : errorDomicilio ? (
                                                <div className="bg-red-50/50 rounded-[3rem] p-10 border-2 border-red-100 flex flex-col items-center gap-6 text-center">
                                                    <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-500">
                                                        <AlertCircle className="h-8 w-8" />
                                                    </div>
                                                    <p className="text-xs font-black text-red-800 uppercase tracking-widest leading-loose max-w-sm">{errorDomicilio}</p>
                                                    <button onClick={recalcularDomicilio} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Reintentar</button>
                                                </div>
                                            ) : null}
                                        </section>
                                    )}

                                    {/* Client Info */}
                                    <section className="space-y-6">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Protocolo de Entrega</h3>
                                        <div className="bg-white rounded-[3rem] p-10 border-2 border-slate-50 shadow-sm space-y-10">
                                            {tipo !== "domicilio" ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 px-2">
                                                        <User className="h-5 w-5 text-orange-500" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                            {tipo === "mesa" ? "Identificación Mesa" : "Responsable de Recogida"}
                                                        </p>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={datosEditados.nombre}
                                                        onChange={(e) => setDatosEditados(prev => ({ ...prev, nombre: e.target.value }))}
                                                        placeholder={tipo === "mesa" ? "Ej: Mesa 5 o tu Apellido" : "Nombre completo"}
                                                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:outline-none focus:border-orange-500/50 focus:bg-white focus:ring-8 focus:ring-orange-50/30 transition-all font-black text-slate-900 uppercase text-xs tracking-widest"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    {!cliente?.nombre ? (
                                                        <button
                                                            onClick={() => setMostrarModal(true)}
                                                            className="w-full py-16 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center gap-5 hover:border-orange-500 hover:bg-orange-50/30 transition-all group"
                                                        >
                                                            <div className="h-16 w-16 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                                <User className="h-8 w-8" />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900">Configurar ubicación</p>
                                                                <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Es necesario para el domicilio</p>
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <div className="space-y-8 relative">
                                                            <button
                                                                onClick={() => setMostrarModal(true)}
                                                                className="absolute top-0 right-0 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-lg shadow-slate-200"
                                                            >
                                                                EDITAR DATOS
                                                            </button>

                                                            <div className="flex items-center gap-6">
                                                                <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100">
                                                                    <User className="h-7 w-7" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nombre del Cliente</p>
                                                                    <p className="text-base font-black text-slate-900 uppercase tracking-tight">{cliente.nombre}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6">
                                                                <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-100">
                                                                    <Phone className="h-7 w-7" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Línea de Contacto</p>
                                                                    <p className="text-base font-black text-slate-900 uppercase tracking-tight">{cliente.telefono}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-start gap-6">
                                                                <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                                                    <MapPin className="h-7 w-7" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Punto de Entrega</p>
                                                                    <p className="text-base font-black text-slate-900 uppercase leading-snug tracking-tight">{cliente.direccion}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="pt-8 border-t border-slate-100">
                                                <div className="flex items-center gap-3 mb-5 px-2">
                                                    <MessageSquare className="h-4 w-4 text-orange-500" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anotaciones Gourmet</p>
                                                </div>
                                                <textarea
                                                    value={notasCliente}
                                                    onChange={(e) => setNotasCliente(e.target.value)}
                                                    placeholder="Ej: Término medio, sin cebolla, portería 5..."
                                                    rows={4}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:outline-none focus:border-orange-500/30 focus:bg-white focus:ring-8 focus:ring-orange-50/30 transition-all font-bold text-slate-600 text-xs resize-none"
                                                />
                                            </div>

                                            {tipo === "domicilio" && (
                                                <div className="pt-10 border-t border-slate-100 space-y-6">
                                                    <div className="flex items-center gap-3 px-2">
                                                        <CreditCard className="h-4 w-4 text-orange-500" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forma de Pago</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div className="relative group">
                                                            <select
                                                                value={metodoPago}
                                                                onChange={(e) => setMetodoPago(e.target.value as "efectivo" | "tarjeta" | "transferencia" | "")}
                                                                className="w-full px-8 py-6 bg-slate-900 text-white border-none rounded-[2rem] focus:outline-none focus:ring-8 focus:ring-orange-100 appearance-none font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 cursor-pointer pr-16"
                                                            >
                                                                <option value="" className="text-white">Seleccionar Método</option>
                                                                <option value="efectivo">💵 Efectivo Nacional</option>
                                                                <option value="tarjeta">💳 Tarjeta Débito/Crédito</option>
                                                                <option value="transferencia">📱 Transferencia Directa</option>
                                                            </select>
                                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500">
                                                                <Plus className="h-5 w-5 rotate-45" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {metodoPago === "efectivo" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="space-y-4 pt-2"
                                                        >
                                                            <div className="relative">
                                                                <Banknote className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-orange-500/40" />
                                                                <input
                                                                    type="number"
                                                                    placeholder="¿Con cuánto pagas?"
                                                                    value={montoEntregado}
                                                                    onChange={(e) => setMontoEntregado(e.target.value ? Number(e.target.value) : "")}
                                                                    className="w-full pl-20 pr-8 py-6 bg-orange-50/50 border-2 border-orange-100 rounded-[2rem] focus:outline-none focus:border-orange-500 transition-all font-black text-slate-900 text-lg placeholder:text-orange-500/30"
                                                                />
                                                            </div>
                                                            {cambio !== null && (
                                                                <div className={`p-8 rounded-[2rem] border-2 flex items-center justify-between shadow-lg relative overflow-hidden ${cambio >= 0 ? "bg-green-50 border-green-100 shadow-green-100" : "bg-red-50 border-red-100 shadow-red-100"
                                                                    }`}>
                                                                    <div className={`absolute top-0 right-0 p-4 opacity-5 ${cambio >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                                        <Banknote className="h-20 w-20" />
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${cambio >= 0 ? "text-green-600" : "text-red-600"
                                                                            }`}>
                                                                            {cambio >= 0 ? "Tu Vuelto Estimado" : "Monto Insuficiente"}
                                                                        </p>
                                                                        <p className={`text-2xl font-black tracking-tighter ${cambio >= 0 ? "text-green-900" : "text-red-900"
                                                                            }`}>
                                                                            ${Math.abs(cambio).toLocaleString("es-CO")}
                                                                        </p>
                                                                    </div>
                                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${cambio >= 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                                                                        {cambio >= 0 ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        {/* Sticky Footer Summary */}
                        {productos.length > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 p-10 pt-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-30px_60px_rgba(0,0,0,0.08)]">
                                <div className="space-y-6 max-w-xl mx-auto">
                                    <div className="space-y-3 px-4">
                                        <div className="flex items-center justify-between text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                            <span>Subtotal Gastronómico</span>
                                            <span className="text-slate-900">${total.toLocaleString("es-CO")}</span>
                                        </div>
                                        {datosDomicilio && (
                                            <div className="flex items-center justify-between text-orange-500 font-black text-[10px] uppercase tracking-[0.3em]">
                                                <span>Servicio de Logística (Envío)</span>
                                                <span className="bg-orange-100 px-3 py-1 rounded-full">+ ${datosDomicilio.costo_domicilio.toLocaleString("es-CO")}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Total a Liquidar</span>
                                                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                                    <span className="text-orange-500 text-xl mr-1.5">$</span>
                                                    {totalFinal.toLocaleString("es-CO")}
                                                </span>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest mb-2 shadow-lg shadow-slate-200">
                                                    {tipo === "domicilio" ? "A DOMICILIO" : tipo === "para_llevar" ? "RECOGIDA" : "MESA"}
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Incluye impuestos</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProcesarOrden}
                                        disabled={procesando || (tipo === "domicilio" && (!datosDomicilio || calculandoDomicilio))}
                                        className="w-full relative group overflow-hidden rounded-[2.5rem] disabled:opacity-50"
                                    >
                                        <div className="absolute inset-0 bg-slate-900 group-hover:bg-orange-500 transition-colors duration-500" />
                                        <div className="relative py-7 flex items-center justify-center gap-5 text-white">
                                            {procesando ? (
                                                <>
                                                    <div className="h-6 w-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                    <span className="font-black text-xs uppercase tracking-[0.4em]">Procesando Orden...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-7 w-7 group-hover:scale-125 transition-transform duration-500" />
                                                    <span className="font-black text-xs uppercase tracking-[0.4em]">Confirmar y Enviar Pedido</span>
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </AnimatePresence>
        </>
    );
}
