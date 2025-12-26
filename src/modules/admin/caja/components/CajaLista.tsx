"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";
import {
    CreditCard,
    Search,
    X,
    Banknote,
    Sparkles,
    LayoutGrid,
    SearchX,
    Clock,
    Hash,
    ChevronRight,
    MapPin,
    Wallet
} from "lucide-react";
import { obtenerOrdenesAction } from "@/src/modules/admin/ordenes/actions/obtenerOrdenesAction";
import { capitalizarSoloPrimera } from "@/src/shared/utils/texto";
import { MetodoPago } from "../types/cobro";
import Loading from "@/src/shared/components/ui/Loading";
import PanelCobro from "./PanelCobro";
import { esEnEstablecimiento } from "@/src/shared/constants/orden";
import PageHeader from "@/src/shared/components/PageHeader";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatearPrecioCOP } from "@/src/shared/utils/precio";


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
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"todos" | "mesa" | "domicilio" | "para_llevar">("todos");

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

    // Filtrar órdenes
    useEffect(() => {
        const filtered = ordenes.filter(orden => {
            const matchesSearch = orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === "todos" || orden.tipo_orden === filterType;
            return matchesSearch && matchesFilter;
        });
        setOrdenesFiltradas(filtered);
    }, [searchTerm, ordenes, filterType]);

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

    const getTimeColor = (fecha: string) => {
        const diffMins = Math.floor((new Date().getTime() - new Date(fecha).getTime()) / 60000);
        if (diffMins < 30) return "text-green-500 bg-green-500/10";
        if (diffMins < 60) return "text-orange-500 bg-orange-500/10";
        return "text-red-500 bg-red-500/10";
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
            <div className="h-screen w-full flex items-center justify-center">
                <Loading
                    texto="Sincronizando caja..."
                    tamaño="mediano"
                    color="orange-500"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <PageHeader
                title="Gestión de Caja"
                description={`${ordenes.length} transacciones por liquidar`}
                icon={Banknote}
                iconBgColor="bg-slate-900"
                iconColor="text-white"
            />

            <div className="p-6 md:p-8 space-y-8">
                {/* Search & Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por cliente o # ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl p-2 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 overflow-x-auto no-scrollbar">
                        {[
                            { id: "todos", label: "Global", icon: LayoutGrid },
                            { id: "mesa", label: "Salón", icon: CreditCard },
                            { id: "domicilio", label: "Envío", icon: MapPin },
                            { id: "para_llevar", label: "Retiro", icon: Wallet },
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id as "todos" | "mesa" | "domicilio" | "para_llevar")}
                                className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] whitespace-nowrap transition-all duration-300 group ${filterType === type.id
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <type.icon className={`h-4 w-4 ${filterType === type.id ? "text-orange-500" : "group-hover:text-orange-500"}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Content */}
                {ordenesFiltradas.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/50"
                    >
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-slate-50/50">
                            <SearchX className="h-10 w-10 text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                            {searchTerm ? "Sin Coincidencias" : "Todo Liquidado"}
                        </h2>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto">
                            {searchTerm ? "No encontramos órdenes para este criterio" : "Las órdenes aparecerán aquí cuando estén listas en cocina"}
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {ordenesFiltradas.map((orden, index) => (
                                <motion.div
                                    key={orden.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={(e) => handleCardClick(e, orden)}
                                    className="group relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 p-6 cursor-pointer hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-[1.02] transition-all duration-500 overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="bg-slate-100 h-10 w-10 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                            <Hash className="h-5 w-5" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Liquidar</p>
                                            <p className="text-2xl font-black text-orange-500 tracking-tighter">
                                                {formatearPrecioCOP(orden.total_final ?? orden.total)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase truncate mb-1">
                                                {capitalizarSoloPrimera(orden.cliente_nombre)}
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-xl ${getTimeColor(orden.created_at)} backdrop-blur-md`}>
                                                    <Clock className="h-3 w-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        {format(new Date(orden.created_at), "hh:mm a", { locale: es })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Sparkles className="h-3 w-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        #{orden.id.slice(-6)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                {orden.tipo_orden === "domicilio" ? <MapPin className="h-3.5 w-3.5" /> : <Wallet className="h-3.5 w-3.5" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{orden.tipo_orden?.replace("_", " ")}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-900 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                Proceder <ChevronRight className="h-4 w-4 text-orange-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorator */}
                                    <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal de Cobro */}
            <AnimatePresence>
                {showModal && ordenSeleccionada && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                        />

                        <motion.div
                            className="fixed top-0 right-0 h-full z-50 bg-white/95 backdrop-blur-xl shadow-2xl w-full md:w-4/5 lg:w-1/2 overflow-hidden border-l border-white/20"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <div className="h-full flex flex-col">
                                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Finalizar Cobro</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orden #{ordenSeleccionada.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}