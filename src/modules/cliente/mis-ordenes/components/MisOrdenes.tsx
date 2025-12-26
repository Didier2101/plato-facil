"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { buscarOrdenPorTelefonoAction } from "@/src/modules/admin/ordenes/actions/buscarOrdenPorTelefonoAction";
import { useClienteStore } from "@/src/modules/cliente/domicilios/store/clienteStore";
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Package,
    MapPin,
    AlertTriangle,
    ArrowRight,
    Loader2,
    Truck,
    Box,
    Sparkles,
    Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ESTADOS_ORDEN } from '@/src/shared/constants/estado-orden';

// Tipos para el seguimiento
interface OrdenEstado {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: typeof ESTADOS_ORDEN[keyof typeof ESTADOS_ORDEN];
    tipo_orden: "establecimiento" | "domicilio";
    created_at: string;
    updated_at: string;
    productos: {
        nombre: string;
        cantidad: number;
        personalizaciones?: string[];
    }[];
    puede_cancelar: boolean;
}

// Configuración de estados premium
const estadosConfig = {
    [ESTADOS_ORDEN.ORDEN_TOMADA]: {
        label: "Preparando",
        desc: "Tu pedido está en cocina siendo preparado con amor.",
        icon: Clock,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
        progress: 25,
    },
    [ESTADOS_ORDEN.EN_PREPARACION]: {
        label: "Cocinando",
        desc: "Nuestros chefs están preparando tu pedido.",
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        progress: 40,
    },
    [ESTADOS_ORDEN.LISTA]: {
        label: "¡Listo!",
        desc: "Tu pedido está listo y esperando ser despachado.",
        icon: Box,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        progress: 50,
    },
    [ESTADOS_ORDEN.EN_CAMINO]: {
        label: "En Camino",
        desc: "Un repartidor lleva tu pedido a toda velocidad.",
        icon: Truck,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        progress: 75,
    },
    [ESTADOS_ORDEN.LLEGUE_A_DESTINO]: {
        label: "¡Llegamos!",
        desc: "El repartidor está en la puerta de tu dirección.",
        icon: MapPin,
        color: "text-pink-500",
        bgColor: "bg-pink-50",
        progress: 90,
    },
    [ESTADOS_ORDEN.ENTREGADA]: {
        label: "Entregado",
        desc: "¡Buen provecho! Esperamos que lo disfrutes.",
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-50",
        progress: 100,
    },
    [ESTADOS_ORDEN.CANCELADA]: {
        label: "Cancelado",
        desc: "Este pedido ha sido cancelado.",
        icon: XCircle,
        color: "text-gray-400",
        bgColor: "bg-gray-100",
        progress: 0,
    },
};

export default function MisOrdenes() {
    const { cliente, setCliente, clearCliente } = useClienteStore();
    const [telefono, setTelefono] = useState("");
    const [orden, setOrden] = useState<OrdenEstado | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [actualizandoEnTiempoReal, setActualizandoEnTiempoReal] = useState(false);

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const isComponentMounted = useRef(true);
    const cargaInicialRealizada = useRef(false);

    const detenerActualizacionesEnTiempoReal = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        setActualizandoEnTiempoReal(false);
    }, []);

    const buscarOrden = useCallback(async (silencioso = false) => {
        const telefonoABuscar = telefono.trim() || cliente?.telefono;

        if (!telefonoABuscar) {
            setError("Por favor ingresa tu número de teléfono");
            return;
        }

        if (!silencioso) {
            setLoading(true);
            setError("");
        }

        try {
            const result = await buscarOrdenPorTelefonoAction({
                telefono: telefonoABuscar,
            });

            if (result.success && result.orden) {
                if (isComponentMounted.current) {
                    setOrden(result.orden);
                    if (cliente) {
                        setCliente({
                            ...cliente,
                            telefono: telefonoABuscar,
                            nombre: result.orden.cliente_nombre,
                            direccion: result.orden.cliente_direccion,
                        });
                    }
                }
            } else {
                if (isComponentMounted.current) {
                    setError(result.error || "No encontramos órdenes activas con este número.");
                    setOrden(null);
                }
            }
        } catch {
            if (isComponentMounted.current) {
                setError("Error al buscar tu pedido. Intenta de nuevo.");
                setOrden(null);
            }
        } finally {
            if (!silencioso && isComponentMounted.current) {
                setLoading(false);
            }
        }
    }, [telefono, cliente, setCliente]);

    const iniciarActualizacionesEnTiempoReal = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
        setActualizandoEnTiempoReal(true);
        pollingInterval.current = setInterval(() => {
            buscarOrden(true);
        }, 10000);
    }, [buscarOrden]);

    useEffect(() => {
        if (orden && !([ESTADOS_ORDEN.ENTREGADA, ESTADOS_ORDEN.CANCELADA] as string[]).includes(orden.estado) && !actualizandoEnTiempoReal) {
            iniciarActualizacionesEnTiempoReal();
        }
    }, [orden, actualizandoEnTiempoReal, iniciarActualizacionesEnTiempoReal]);

    useEffect(() => {
        if (orden && ([ESTADOS_ORDEN.ENTREGADA, ESTADOS_ORDEN.CANCELADA] as string[]).includes(orden.estado)) {
            detenerActualizacionesEnTiempoReal();
        }
    }, [orden, detenerActualizacionesEnTiempoReal]);

    useEffect(() => {
        isComponentMounted.current = true;
        if (cliente?.telefono && !cargaInicialRealizada.current) {
            setTelefono(cliente.telefono);
            cargaInicialRealizada.current = true;
            setTimeout(() => buscarOrden(false), 500);
        }
        return () => {
            isComponentMounted.current = false;
            detenerActualizacionesEnTiempoReal();
        };
    }, [cliente?.telefono, buscarOrden, detenerActualizacionesEnTiempoReal]);

    const limpiarTelefono = () => {
        setTelefono("");
        clearCliente();
        setOrden(null);
        setError("");
        detenerActualizacionesEnTiempoReal();
        cargaInicialRealizada.current = false;
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString("es-CO", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 pb-24">
            {/* Header Moderno */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center space-x-2 bg-orange-100/50 px-4 py-2 rounded-2xl mb-4 text-orange-600">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest leading-none">Rastreo VIP</span>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                        Mis <span className="text-orange-500">Órdenes</span>
                    </h2>
                    <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">
                        {cliente?.nombre ? `¡Hola ${cliente.nombre.split(' ')[0]}! Aquí está tu pedido` : "Ingresa tu número para rastrear"}
                    </p>
                </div>

                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                        placeholder="Tu número (ej: 310...)"
                        className="w-full bg-white border-2 border-transparent focus:border-orange-500/10 py-5 pl-14 pr-6 rounded-[2rem] shadow-xl shadow-gray-200/50 outline-none transition-all font-bold text-gray-900"
                        onKeyPress={(e) => e.key === "Enter" && buscarOrden()}
                    />
                    <button
                        onClick={() => buscarOrden()}
                        disabled={loading || telefono.length < 7}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 hover:bg-orange-500 text-white p-3 rounded-2xl transition-all disabled:opacity-30"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                    </button>
                    {cliente?.telefono && (
                        <button
                            onClick={limpiarTelefono}
                            className="absolute -bottom-6 right-4 text-[10px] font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-colors"
                        >
                            Cambiar Número
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border-2 border-orange-100 rounded-[2rem] p-6 text-center"
                >
                    <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                    <p className="text-orange-800 font-black tracking-tight">{error}</p>
                </motion.div>
            )}

            {/* Visualización de la Orden */}
            <AnimatePresence mode="wait">
                {orden ? (
                    <motion.div
                        key={orden.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        {/* Card Principal - Estado */}
                        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                            {actualizandoEnTiempoReal && (
                                <div className="absolute top-6 right-8 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">En Vivo</span>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10">
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 ${estadosConfig[orden.estado].bgColor} shadow-inner`}>
                                    {(() => {
                                        const Icon = estadosConfig[orden.estado].icon;
                                        return <Icon className={`h-12 w-12 ${estadosConfig[orden.estado].color}`} />;
                                    })()}
                                </div>
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${estadosConfig[orden.estado].color}`}>Pedido {estadosConfig[orden.estado].label}</span>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{estadosConfig[orden.estado].desc}</h3>
                                    <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-widest">Orden #{orden.id.slice(-6)} • {formatearFecha(orden.created_at)}</p>
                                </div>
                            </div>

                            {/* Barra de Progreso Premium */}
                            {orden.estado !== ESTADOS_ORDEN.CANCELADA && (
                                <div className="space-y-4">
                                    <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${estadosConfig[orden.estado].progress}%` }}
                                            className={`h-full rounded-full ${estadosConfig[orden.estado].progress === 100 ? 'bg-green-500 shadow-green-200' : 'bg-orange-500 shadow-orange-200'} shadow-lg`}
                                        />
                                    </div>
                                    <div className="flex justify-between px-2">
                                        <div className="text-center">
                                            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${estadosConfig[orden.estado].progress >= 25 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cocina</span>
                                        </div>
                                        <div className="text-center">
                                            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${estadosConfig[orden.estado].progress >= 50 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Listo</span>
                                        </div>
                                        <div className="text-center">
                                            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${estadosConfig[orden.estado].progress >= 75 ? 'bg-orange-500' : 'bg-gray-200'}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Envío</span>
                                        </div>
                                        <div className="text-center">
                                            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${estadosConfig[orden.estado].progress >= 100 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fin</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info del Pedido Side-by-Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Productos */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <h4 className="text-lg font-black text-gray-900 tracking-tighter mb-6 flex items-center gap-3">
                                    <Package className="h-5 w-5 text-orange-500" /> Tu Selección
                                </h4>
                                <div className="space-y-4">
                                    {orden.productos.map((prod, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl group hover:bg-orange-50 transition-colors">
                                            <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center font-black text-orange-600 shadow-sm group-hover:scale-110 transition-transform">
                                                {prod.cantidad}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 text-sm leading-tight">{prod.nombre}</p>
                                                {prod.personalizaciones && prod.personalizaciones.length > 0 && (
                                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">
                                                        {prod.personalizaciones.join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Inversión Total</span>
                                    <span className="text-2xl font-black text-orange-600 tracking-tighter">${orden.total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Entrega Info */}
                            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
                                <h4 className="text-lg font-black text-white tracking-tighter mb-6 flex items-center gap-3 relative z-10">
                                    <MapPin className="h-5 w-5 text-orange-500" /> Detalles de Entrega
                                </h4>
                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Destino</p>
                                        <p className="font-bold text-gray-300 text-sm leading-relaxed">{orden.cliente_direccion}</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Tipo</p>
                                            <p className="font-black text-orange-500 uppercase text-[10px] tracking-widest bg-orange-500/10 px-3 py-1 rounded-lg">
                                                {orden.tipo_orden}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Contacto</p>
                                            <p className="font-bold text-gray-300 text-sm">{orden.cliente_telefono}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
                                            <Truck className="h-5 w-5 text-orange-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Entrega Express Garantizada</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Banner Trust */}
                        <div className="bg-white rounded-[3rem] p-8 border-2 border-dashed border-gray-100 text-center">
                            <Sparkles className="h-10 w-10 text-orange-200 mx-auto mb-4" />
                            <h4 className="text-lg font-black text-gray-900 tracking-tighter">¡Casi en tus manos!</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Nuestros chefs y repartidores están dando lo mejor de sí</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Box className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">¿Hambriento?</h3>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 max-w-[200px] mx-auto leading-relaxed">
                            {telefono ? "Parece que no hay órdenes activas con este número." : "Ingresa tu número arriba para ver el estado de tu pedido."}
                        </p>
                        {!telefono && (
                            <div className="mt-10 inline-flex items-center space-x-2 text-orange-500 font-black uppercase text-[10px] tracking-widest">
                                <span>Seguridad Kavvo</span>
                                <div className="w-1 h-1 bg-orange-500 rounded-full" />
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}