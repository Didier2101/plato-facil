"use client";

import { useEffect, useState } from "react";
import type { OrdenCompleta } from "@/src/types/orden";
import { useUserStore } from "@/src/store/useUserStore";
import { CreditCard } from "lucide-react";
import { obtenerOrdenesListasAction } from "@/src/actions/obtenerOrdenesListasAction";
import CajaCard from "./CajaCard";
import PanelCobro from "./PanelCobro";
import Loading from "../../ui/Loading";

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

    const { id: usuarioId } = useUserStore();

    // Detectar si es móvil de manera reactiva
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Verificar al cargar
        checkMobile();

        // Escuchar cambios de tamaño
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const cargarOrdenes = async () => {
        try {
            const result = await obtenerOrdenesListasAction();
            if (result.success && result.ordenes) {
                setOrdenes(result.ordenes);
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
        // Resetear formulario al seleccionar nueva orden
        setMetodoPago("");
        setPropina(0);
        setPropinaPorcentaje(null);

        // En móviles mostramos el modal
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
            {/* Header - Solo en móvil */}
            <div className="md:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 p-3 rounded-xl">
                            <CreditCard className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
                            <p className="text-gray-600">
                                {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} lista{ordenes.length === 1 ? '' : 's'} para cobrar
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header - Solo en desktop */}
            <div className="hidden md:block mb-6">
                <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-3 rounded-xl">
                        <CreditCard className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
                        <p className="text-gray-600">
                            {ordenes.length} {ordenes.length === 1 ? 'orden' : 'órdenes'} lista{ordenes.length === 1 ? '' : 's'} para cobrar
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="mt-6 md:mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Lista de órdenes */}
                    <div className="lg:col-span-2 xl:col-span-1 space-y-4">
                        {ordenes.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                <CreditCard className="text-gray-300 text-5xl mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    No hay órdenes listas
                                </h2>
                                <p className="text-gray-500">
                                    Esperando órdenes desde cocina
                                </p>
                            </div>
                        ) : (
                            ordenes.map((orden) => (
                                <CajaCard
                                    key={orden.id}
                                    orden={orden}
                                    isSelected={ordenSeleccionada?.id === orden.id}
                                    onSelect={seleccionarOrden}
                                />
                            ))
                        )}
                    </div>

                    {/* Panel de cobro para desktop */}
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
                                    <p className="text-gray-500">Selecciona una orden para comenzar el cobro</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para móviles */}
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