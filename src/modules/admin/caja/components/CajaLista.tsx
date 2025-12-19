"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";
import { CreditCard, Search, User, X } from "lucide-react";
import { obtenerOrdenesAction } from "@/src/modules/admin/ordenes/actions/obtenerOrdenesAction";


import { calcularTiempoTranscurrido } from "@/src/shared/utils/texto";
import { MetodoPago } from "../types/cobro";
import Loading from "@/src/shared/components/ui/Loading";
import OrdenCard from "../../ordenes/components/OrdenCard";
import PanelCobro from "./PanelCobro";
import { esEnEstablecimiento } from "@/src/shared/constants/orden";


interface CajaListaProps {
    usuarioId: string;
}

export default function CajaLista({ usuarioId }: CajaListaProps) {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [ordenesFiltradas, setOrdenesFiltradas] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompleta | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("");
    const [propina, setPropina] = useState<number>(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    // Cargar órdenes listas para cobrar - SOLO ESTABLECIMIENTO
    const cargarOrdenes = async () => {
        try {
            const result = await obtenerOrdenesAction();
            if (result.success && result.ordenes) {
                const ordenesParaCaja = result.ordenes
                    .filter(orden =>
                        orden.estado === "lista" &&
                        orden.tipo_orden &&
                        esEnEstablecimiento(orden.tipo_orden)
                    )
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                setOrdenes(ordenesParaCaja);
                setOrdenesFiltradas(ordenesParaCaja);
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

    // Filtrar órdenes por nombre del cliente
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setOrdenesFiltradas(ordenes);
        } else {
            const filtered = ordenes.filter(orden =>
                orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setOrdenesFiltradas(filtered);
        }
    }, [searchTerm, ordenes]);

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

    // Animaciones
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const modalVariants = {
        hidden: {
            x: "100%",
            transition: { type: "tween" as const, duration: 0.3, ease: "easeInOut" as const }
        },
        visible: {
            x: 0,
            transition: { type: "tween" as const, duration: 0.3, ease: "easeOut" as const }
        },
        exit: {
            x: "100%",
            transition: { type: "tween" as const, duration: 0.2, ease: "easeIn" as const }
        }
    };

    const cardHoverVariants = {
        hover: { scale: 1.02 },
        tap: { scale: 0.99 }
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
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl shadow-sm">
                            <CreditCard className="text-white text-xl md:text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Caja</h1>
                            <p className="text-gray-600 text-sm md:text-base">
                                {ordenesFiltradas.length} {ordenesFiltradas.length === 1 ? 'orden lista' : 'órdenes listas'} para cobrar
                            </p>
                        </div>
                    </div>

                    <div className="relative flex-1 md:flex-none md:w-80">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre del cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm md:text-base placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex gap-3">
                        <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs font-medium text-gray-600">Total órdenes</p>
                            <p className="font-bold text-gray-900">{ordenes.length}</p>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs font-medium text-gray-600">Monto total</p>
                            <p className="font-bold text-gray-900">
                                ${ordenes.reduce((sum, orden) => sum + Number(orden.total_final || orden.total), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {ordenesFiltradas.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="text-gray-400 text-2xl" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes listas'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? 'No hay órdenes que coincidan con la búsqueda' : 'Esperando órdenes desde cocina'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {ordenesFiltradas.map((orden) => (
                            <motion.div
                                key={orden.id}
                                onClick={(e) => handleCardClick(e, orden)}
                                className='cursor-pointer'
                                whileHover="hover"
                                whileTap="tap"
                                variants={cardHoverVariants}
                                transition={{ type: "tween", duration: 0.2 }}
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
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showModal && ordenSeleccionada && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() => setShowModal(false)}
                        />

                        <motion.div
                            className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl w-full md:w-4/5 lg:w-1/2"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Cobrar Orden</h3>
                                </div>
                                <motion.button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "tween", duration: 0.1 }}
                                >
                                    <X className="text-gray-400 h-6 w-6" />
                                </motion.button>
                            </div>

                            <div className="p-4 lg:p-6 overflow-y-auto h-[calc(100vh-80px)]">
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}