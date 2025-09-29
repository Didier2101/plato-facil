"use client";

import { useEffect, useState } from "react";
import type { OrdenCompleta } from "@/src/types/orden";
import { useUserStore } from "@/src/store/useUserStore";
import { CreditCard, Truck } from "lucide-react";
import { obtenerOrdenesAction } from "@/src/actions/obtenerOrdenesAction";

import PanelCobro from "./PanelCobro";
import Loading from "../../ui/Loading";
import { calcularTiempoTranscurrido } from "@/src/utils/texto";
import OrdenCard from "../ordenes/OrdenCard";

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

export default function CajaLista() {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompleta | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("");
    const [propina, setPropina] = useState<number>(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    const { id: usuarioId } = useUserStore();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Cargar órdenes listas para cobrar - SOLO DOMICILIOS
    const cargarOrdenes = async () => {
        try {
            const result = await obtenerOrdenesAction();
            if (result.success && result.ordenes) {
                const ordenesParaCaja = result.ordenes
                    .filter(orden =>
                        orden.estado === "lista" &&
                        orden.tipo_orden === "establecimiento"
                    )
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                setOrdenes(ordenesParaCaja);
            }
        } catch (error) {
            console.error("Error cargando órdenes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarOrdenes();
        const interval = setInterval(cargarOrdenes, 30000);
        return () => clearInterval(interval);
    }, []);

    const seleccionarOrden = (orden: OrdenCompleta) => {
        setOrdenSeleccionada(orden);
        setMetodoPago("");
        setPropina(0);
        setPropinaPorcentaje(null);

        if (isMobile) {
            setShowModal(true);
        }
    };

    const resetearFormulario = () => {
        setOrdenSeleccionada(null);
        setMetodoPago("");
        setPropina(0);
        setPropinaPorcentaje(null);
        setShowModal(false);
    };

    const toggleExpanded = (ordenId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(ordenId)) {
            newExpanded.delete(ordenId);
        } else {
            newExpanded.add(ordenId);
        }
        setExpandedOrders(newExpanded);
    };

    const getTimeColor = (fecha: string) => {
        const diffMins = Math.floor(
            (new Date().getTime() - new Date(fecha).getTime()) / 60000
        );
        if (diffMins < 30) return "text-green-600 bg-green-50";
        if (diffMins < 60) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    // No necesitamos cambiarEstado en caja
    const cambiarEstado = () => {
        console.log("Cambiar estado no disponible en caja");
    };

    if (loading) {
        return (
            <Loading
                texto="Cargando órdenes..."
                tamaño="mediano"
                color="orange-500"
            />
        );
    }

    return (
        <div className="p-6">
            {/* Header móvil */}
            <div className="md:hidden mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-3 rounded-xl">
                        <Truck className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Caja - Domicilios</h1>
                        <p className="text-gray-600">
                            {ordenes.length} {ordenes.length === 1 ? 'domicilio' : 'domicilios'} para cobrar
                        </p>
                    </div>
                </div>
            </div>

            {/* Header desktop */}
            <div className="hidden md:block mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl">
                            <Truck className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Caja - Domicilios</h1>
                            <p className="text-gray-600">
                                {ordenes.length} {ordenes.length === 1 ? 'domicilio listo' : 'domicilios listos'} para cobrar
                            </p>
                        </div>
                    </div>

                    {/* Estadísticas de domicilios */}
                    {ordenes.length > 0 && (
                        <div className="flex gap-3">
                            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                                <p className="text-xs font-medium">Total domicilios</p>
                                <p className="font-bold">{ordenes.length}</p>
                            </div>
                            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                                <p className="text-xs font-medium">Monto total</p>
                                <p className="font-bold">
                                    ${ordenes.reduce((sum, orden) => sum + Number(orden.total_final || orden.total), 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Lista de órdenes */}
                <div className="lg:col-span-2 xl:col-span-1 space-y-4">
                    {ordenes.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                            <Truck className="text-gray-300 text-5xl mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                No hay domicilios listos
                            </h2>
                            <p className="text-gray-500">
                                Esperando domicilios desde cocina
                            </p>
                        </div>
                    ) : (
                        ordenes.map((orden) => (
                            <div
                                key={orden.id}
                                onClick={() => seleccionarOrden(orden)}
                                className={`cursor-pointer transition-all ${ordenSeleccionada?.id === orden.id
                                    ? 'ring-2 ring-orange-500 ring-offset-2'
                                    : ''
                                    }`}
                            >
                                <OrdenCard
                                    orden={orden}
                                    isExpanded={expandedOrders.has(orden.id)}
                                    toggleExpanded={toggleExpanded}
                                    tiempoTranscurrido={calcularTiempoTranscurrido(orden.created_at)}
                                    timeColor={getTimeColor(orden.created_at)}
                                    processingOrder={null} // No se procesa en caja
                                    cambiarEstado={cambiarEstado}
                                    mostrarPrecios={true} // SÍ mostrar precios
                                    mostrarPreciosSeparados={true} // SÍ mostrar desglose
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Panel de cobro desktop */}
                <div className="hidden lg:block lg:col-span-2 xl:col-span-3">
                    <div className="sticky top-6">
                        {ordenSeleccionada ? (
                            <PanelCobro
                                ordenSeleccionada={ordenSeleccionada}
                                usuarioId={usuarioId}
                                metodoPago={metodoPago}
                                setMetodoPago={setMetodoPago}
                                propina={propina}
                                setPropina={setPropina}
                                propinaPorcentaje={propinaPorcentaje}
                                setPropinaPorcentaje={setPropinaPorcentaje}
                                onSuccess={resetearFormulario}
                                onRecargarOrdenes={cargarOrdenes}
                                isMobile={false}
                            />
                        ) : (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                <CreditCard className="text-gray-300 text-5xl mx-auto mb-4" />
                                <p className="text-gray-500">Selecciona un domicilio para cobrar</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal móvil */}
            {showModal && ordenSeleccionada && isMobile && (
                <PanelCobro
                    ordenSeleccionada={ordenSeleccionada}
                    usuarioId={usuarioId}
                    metodoPago={metodoPago}
                    setMetodoPago={setMetodoPago}
                    propina={propina}
                    setPropina={setPropina}
                    propinaPorcentaje={propinaPorcentaje}
                    setPropinaPorcentaje={setPropinaPorcentaje}
                    onSuccess={resetearFormulario}
                    onRecargarOrdenes={cargarOrdenes}
                    isMobile={true}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}