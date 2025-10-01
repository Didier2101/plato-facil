"use client";

import { useEffect, useState } from "react";
import type { OrdenCompleta } from "@/src/types/orden";
import { CreditCard, Truck } from "lucide-react";
import { obtenerOrdenesAction } from "@/src/actions/obtenerOrdenesAction";

import PanelCobro from "./PanelCobro";
import Loading from "../../ui/Loading";
import { calcularTiempoTranscurrido } from "@/src/utils/texto";
import OrdenCard from "../ordenes/OrdenCard";

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

interface CajaListaProps {
    usuarioId: string;
}

export default function CajaLista({ usuarioId }: CajaListaProps) {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompleta | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("");
    const [propina, setPropina] = useState<number>(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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
            // Ignorar errores durante logout/unmount
            if (error instanceof Error && error.message.includes('unexpected response')) {
                return;
            }
            console.error("Error cargando órdenes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const cargarOrdenesSeguro = async () => {
            if (mounted) {
                await cargarOrdenes();
            }
        };

        cargarOrdenesSeguro();
        const interval = setInterval(cargarOrdenesSeguro, 30000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    const seleccionarOrden = (orden: OrdenCompleta) => {
        setOrdenSeleccionada(orden);
        setMetodoPago("");
        setPropina(0);
        setPropinaPorcentaje(null);
        setShowModal(true);
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

    const cambiarEstado = () => {
        console.log("Cambiar estado no disponible en caja");
    };

    const handleCardClick = (e: React.MouseEvent, orden: OrdenCompleta) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('[role="button"]')) {
            return;
        }
        seleccionarOrden(orden);
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
            {/* Header móvil y tablet */}
            <div className="lg:hidden mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-3 rounded-xl">
                        <Truck className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
                        <p className="text-gray-600">
                            {ordenes.length} {ordenes.length === 1 ? 'orden' : 'ordenes'} para cobrar
                        </p>
                    </div>
                </div>
            </div>

            {/* Header desktop */}
            <div className="hidden lg:block mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl">
                            <Truck className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
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
                                onClick={(e) => handleCardClick(e, orden)}
                                className='cursor-pointer'
                            >
                                <OrdenCard
                                    orden={orden}
                                    isExpanded={expandedOrders.has(orden.id)}
                                    toggleExpanded={toggleExpanded}
                                    tiempoTranscurrido={calcularTiempoTranscurrido(orden.created_at)}
                                    timeColor={getTimeColor(orden.created_at)}
                                    processingOrder={null}
                                    cambiarEstado={cambiarEstado}
                                    mostrarPrecios={true}
                                    mostrarPreciosSeparados={true}
                                    modoSeleccion={true}
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

            {/* Modal móvil y tablet */}
            {showModal && ordenSeleccionada && (
                <>
                    {/* Overlay */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/20 bg-opacity-50 z-40"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Panel Modal */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden">
                        {/* Handle para cerrar */}
                        <div
                            className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
                            onClick={() => setShowModal(false)}
                        />

                        {/* Header */}
                        <div className="px-6 border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-bold text-gray-800">
                                Cobrar Orden #{ordenSeleccionada.id.slice(-6)}
                            </h3>
                        </div>

                        {/* Contenido scrolleable */}
                        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                                onClose={() => setShowModal(false)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}