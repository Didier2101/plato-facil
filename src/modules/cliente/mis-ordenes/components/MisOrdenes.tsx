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
    Phone,
    AlertTriangle,
    ChevronRight,
    User,
} from "lucide-react";

// Tipos para el seguimiento
interface OrdenEstado {
    id: string;
    cliente_nombre: string;
    cliente_telefono?: string;
    cliente_direccion: string;
    total: number;
    estado: "orden_tomada" | "lista" | "en_camino" | "llegue_a_destino" | "entregada" | "cancelada";
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

// Configuración de estados
const estadosConfig = {
    orden_tomada: {
        label: "En preparación",
        icon: Clock,
        color: "text-orange-600 bg-orange-50 border-orange-200",
        iconColor: "text-orange-500",
        progressColor: "bg-orange-500",
    },
    lista: {
        label: "Esperando repartidor",
        icon: CheckCircle,
        color: "text-orange-600 bg-orange-50 border-orange-200",
        iconColor: "text-orange-500",
        progressColor: "bg-orange-500",
    },
    en_camino: {
        label: "El repartidor va en camino",
        icon: Package,
        color: "text-orange-600 bg-orange-50 border-orange-200",
        iconColor: "text-orange-500",
        progressColor: "bg-orange-500",
    },
    llegue_a_destino: {
        label: "El repartidor llegó a tu dirección",
        icon: MapPin,
        color: "text-orange-600 bg-orange-50 border-orange-200",
        iconColor: "text-orange-500",
        progressColor: "bg-orange-500",
    },
    entregada: {
        label: "Entregada",
        icon: CheckCircle,
        color: "text-orange-600 bg-orange-50 border-orange-200",
        iconColor: "text-orange-500",
        progressColor: "bg-orange-500",
    },
    cancelada: {
        label: "Cancelada",
        icon: XCircle,
        color: "text-orange-600 bg-orange-50 border-orange-200",
        iconColor: "text-orange-500",
        progressColor: "bg-orange-500",
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

    const mostrarNotificacion = (mensaje: string, color: string) => {
        console.log(`Notificación ${color}: ${mensaje}`);
    };

    const detenerActualizacionesEnTiempoReal = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        setActualizandoEnTiempoReal(false);
    }, []);

    // Usar useCallback para memoizar la función y evitar dependencias cíclicas
    const buscarOrden = useCallback(async (silencioso = false) => {
        const telefonoABuscar = telefono.trim() || cliente?.telefono;

        if (!telefonoABuscar) {
            setError("Ingresa tu número de teléfono");
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
                    const estadoCambio = orden && orden.estado !== result.orden.estado;
                    setOrden(result.orden);

                    // Actualizar store con información completa
                    if (cliente) {
                        setCliente({
                            ...cliente,
                            telefono: telefonoABuscar,
                            nombre: result.orden.cliente_nombre,
                            direccion: result.orden.cliente_direccion,
                        });
                    }

                    if (estadoCambio && !silencioso) {
                        mostrarNotificacion(
                            `¡Estado actualizado: ${estadosConfig[
                                result.orden.estado as keyof typeof estadosConfig
                            ].label}!`,
                            "orange"
                        );
                    }
                }
            } else {
                if (isComponentMounted.current) {
                    setError(result.error || "No se encontró ninguna orden con ese teléfono");
                    setOrden(null);
                }
            }
        } catch (err) {
            console.error("Error buscando orden:", err);
            if (isComponentMounted.current) {
                setError("Error al buscar la orden. Intenta de nuevo.");
                setOrden(null);
            }
        } finally {
            if (!silencioso && isComponentMounted.current) {
                setLoading(false);
            }
        }
    }, [telefono, cliente, orden, setCliente]);

    const iniciarActualizacionesEnTiempoReal = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }

        setActualizandoEnTiempoReal(true);

        pollingInterval.current = setInterval(() => {
            buscarOrden(true);
        }, 10000);
    }, [buscarOrden]);

    // Efecto para iniciar polling cuando se encuentra una orden activa
    useEffect(() => {
        if (orden && orden.estado !== "entregada" && orden.estado !== "cancelada" && !actualizandoEnTiempoReal) {
            iniciarActualizacionesEnTiempoReal();
        }
    }, [orden, actualizandoEnTiempoReal, iniciarActualizacionesEnTiempoReal]);

    // Efecto para detener polling cuando la orden está completa
    useEffect(() => {
        if (orden && (orden.estado === "entregada" || orden.estado === "cancelada" || orden.estado === "llegue_a_destino")) {
            detenerActualizacionesEnTiempoReal();
        }
    }, [orden, detenerActualizacionesEnTiempoReal]);

    // Carga inicial automática
    useEffect(() => {
        isComponentMounted.current = true;

        // Si hay un cliente con teléfono y no se ha realizado carga inicial
        if (cliente?.telefono && !cargaInicialRealizada.current) {
            setTelefono(cliente.telefono);
            cargaInicialRealizada.current = true;

            // Buscar orden automáticamente
            setTimeout(() => {
                buscarOrden(false);
            }, 500);
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
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const obtenerTiempoEstimado = (estado: string, tipo: string) => {
        if (estado === "entregada" || estado === "cancelada") return null;

        const tiempos = {
            orden_tomada: tipo === "domicilio" ? "25-35 min" : "15-20 min",
            lista: tipo === "domicilio" ? "Esperando repartidor" : "Lista para recoger",
            en_camino: "El repartidor está en camino",
            llegue_a_destino: "El repartidor ha llegado",
        };

        return tiempos[estado as keyof typeof tiempos] || null;
    };

    const formatearTelefono = (telefono: string) => {
        return telefono.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    };

    const getProgressBarColor = () => {
        return "bg-orange-500";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-32">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl">
                        <Package className="text-2xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Seguimiento de Pedido
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {cliente?.nombre ? `¡Hola ${cliente.nombre}!` : "Rastrea tu orden en tiempo real"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Card búsqueda */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            <Phone size={16} className="inline mr-2 text-orange-500" />
                            Tu número de teléfono
                        </label>
                        {cliente?.telefono && (
                            <button
                                onClick={limpiarTelefono}
                                className="text-xs text-orange-600 hover:text-orange-800 underline"
                            >
                                Cambiar teléfono
                            </button>
                        )}
                    </div>

                    <div className="relative mb-3">
                        <input
                            type="tel"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="Ej: 300 123 4567"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-base bg-gray-50"
                            disabled={actualizandoEnTiempoReal}
                            onKeyPress={(e) => e.key === "Enter" && buscarOrden()}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Search size={20} className="text-gray-400" />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-3">
                            <p className="text-orange-700 text-sm flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {error}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => buscarOrden()}
                        disabled={loading || !telefono.trim()}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Search size={20} />
                        )}
                        {loading ? "Buscando..." : "Buscar mi pedido"}
                    </button>

                    <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-orange-800 text-sm font-medium mb-1">
                            {cliente?.telefono ? "✅ Teléfono recordado" : "💡 ¿Primera vez?"}
                        </p>
                        <p className="text-orange-700 text-xs">
                            {cliente?.telefono
                                ? `Usaremos ${formatearTelefono(cliente.telefono)} para buscar tus pedidos`
                                : "Usa el mismo teléfono que registraste al hacer tu pedido"
                            }
                        </p>
                    </div>
                </div>

                {/* Estado de la orden */}
                {orden && (
                    <>
                        {/* Card resumen */}
                        <div className="bg-white rounded-2xl p-6 shadow-md ">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Orden #</span>
                                    <h2 className="text-lg font-bold text-gray-600">
                                        {orden.id.slice(-6)}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-600">
                                        ${orden.total.toLocaleString("es-CO")}
                                    </div>
                                    <div className="text-xs text-gray-500 capitalize">
                                        {orden.tipo_orden === "domicilio" ? "🚚 Domicilio" : "🏪 Para recoger"}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <User size={16} className="text-gray-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {cliente?.nombre || orden.cliente_nombre}
                                    </p>
                                    {(cliente?.telefono || orden.cliente_telefono) && (
                                        <p className="text-xs text-gray-600">
                                            {formatearTelefono(cliente?.telefono || orden.cliente_telefono || "")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card estado con progreso visual */}
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-full ${estadosConfig[orden.estado].color}`}>
                                    {(() => {
                                        const Icon = estadosConfig[orden.estado].icon;
                                        return <Icon size={24} className={estadosConfig[orden.estado].iconColor} />;
                                    })()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {estadosConfig[orden.estado].label}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {obtenerTiempoEstimado(orden.estado, orden.tipo_orden) || "Proceso completado"}
                                    </p>
                                </div>
                                {actualizandoEnTiempoReal && (
                                    <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full"></div>
                                )}
                            </div>

                            {/* Barra de progreso */}
                            {(orden.estado === "lista" || orden.estado === "en_camino" || orden.estado === "llegue_a_destino" || orden.estado === "entregada") && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>Inicio</span>
                                        <span>Entrega</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${orden.estado === "lista" ? "w-1/4" :
                                                orden.estado === "en_camino" ? "w-1/2" :
                                                    orden.estado === "llegue_a_destino" ? "w-3/4" :
                                                        "w-full"
                                                } ${getProgressBarColor()}`}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Card dirección */}
                        {orden.tipo_orden === "domicilio" && (
                            <div className="bg-white rounded-2xl p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <MapPin size={20} className="text-orange-500" />
                                    <h4 className="font-bold text-gray-800">Dirección de entrega</h4>
                                </div>
                                <p className="text-gray-700">{cliente?.direccion || orden.cliente_direccion}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                    <Phone size={14} />
                                    <span>
                                        {formatearTelefono(cliente?.telefono || orden.cliente_telefono || "Sin teléfono")}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Card productos */}
                        <div className="bg-white rounded-2xl p-6 shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <Package size={20} className="text-orange-500" />
                                <h4 className="font-bold text-gray-800">Tu Pedido</h4>
                            </div>
                            <div className="space-y-3">
                                {orden.productos.map((producto, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <span className="text-orange-600 font-bold text-sm">
                                                {producto.cantidad}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{producto.nombre}</p>
                                            {producto.personalizaciones && producto.personalizaciones.length > 0 && (
                                                <p className="text-xs text-orange-600 mt-1">
                                                    {producto.personalizaciones.join(", ")}
                                                </p>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400" />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Total</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        ${orden.total.toLocaleString("es-CO")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tiempo y actualización */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Pedido realizado</p>
                                    <p className="font-medium text-gray-800">{formatearFecha(orden.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Última actualización</p>
                                    <p className="font-medium text-gray-800">{formatearFecha(orden.updated_at)}</p>
                                </div>
                            </div>

                            {actualizandoEnTiempoReal && (
                                <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                    <p className="text-orange-700 text-xs text-center">🔄 Actualizando en tiempo real</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Estado vacío - Sin orden */}
                {!orden && !loading && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                            <Package size={32} className="text-orange-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {cliente?.telefono ? "Busca tu pedido" : "Ingresa tu teléfono"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {cliente?.telefono
                                ? `Usaremos tu teléfono guardado (${formatearTelefono(cliente.telefono)})`
                                : "Ingresa tu número de teléfono para ver el estado de tu pedido"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}