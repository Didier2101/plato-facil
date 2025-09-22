"use client";

import { useEffect, useState } from "react";
import { cobrarOrdenAction } from "@/src/actions/cobrarOrdenAction";
import { registrarPropinaAction } from "@/src/actions/registrarPropinaAction";
import type { OrdenCompleta } from "@/src/types/orden";
import { useUserStore } from "@/src/store/useUserStore";
import Swal from "sweetalert2";
import { formatearPrecioCOP } from "@/src/utils/precio";
import { X, CheckCircle, CreditCard } from "lucide-react";
import { obtenerOrdenesListasAction } from "@/src/actions/obtenerOrdenesListasAction";

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

export default function CajaLista() {
    const [ordenes, setOrdenes] = useState<OrdenCompleta[]>([]);
    const [loading, setLoading] = useState(true);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompleta | null>(null);
    const [metodoPago, setMetodoPago] = useState<MetodoPago | "">("");
    const [propina, setPropina] = useState<number>(0);
    const [propinaPorcentaje, setPropinaPorcentaje] = useState<number | null>(null);
    const [efectivoRecibido, setEfectivoRecibido] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const { id: usuarioId } = useUserStore();

    const cargarOrdenes = async () => {
        try {
            const result = await obtenerOrdenesListasAction();
            if (result.success && result.ordenes) {
                // Solo órdenes en estado "lista" (preparadas, listas para cobro)
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
        setEfectivoRecibido(null);

        // En móviles mostramos el modal
        if (window.innerWidth < 768) {
            setShowModal(true);
        }
    };

    const aplicarPropina = (opcion: number) => {
        if (!ordenSeleccionada) return;
        setPropinaPorcentaje(opcion);
        setPropina((opcion / 100) * Number(ordenSeleccionada.total));
    };

    const confirmarCobro = async () => {
        if (!ordenSeleccionada || !usuarioId || !metodoPago) {
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "Completa todos los campos requeridos",
                timer: 2500,
                showConfirmButton: false,
            });
            return;
        }

        const totalFinal = Number(ordenSeleccionada.total) + propina;

        // Validar efectivo
        if (metodoPago === "efectivo") {
            if (!efectivoRecibido || efectivoRecibido < totalFinal) {
                Swal.fire({
                    toast: true,
                    icon: "error",
                    position: "top-end",
                    title: "Monto recibido insuficiente",
                    timer: 2500,
                    showConfirmButton: false,
                });
                return;
            }
        }

        setProcesando(true);

        try {
            const result = await cobrarOrdenAction(
                ordenSeleccionada.id,
                usuarioId,
                metodoPago
            );

            if (!result.success) {
                Swal.fire({
                    toast: true,
                    icon: "error",
                    position: "top-end",
                    title: result.error || "Error al procesar el cobro",
                    timer: 2500,
                    showConfirmButton: false,
                });
                return;
            }

            // Registrar propina si existe
            if (propina > 0 && result.pagoId) {
                const propinaResult = await registrarPropinaAction(result.pagoId, propina, propinaPorcentaje);
                if (!propinaResult.success) {
                    console.error("Error registrando propina:", propinaResult.error);
                }
            }

            const cambio = metodoPago === "efectivo" && efectivoRecibido
                ? efectivoRecibido - totalFinal
                : 0;

            // Mostrar confirmación con detalles
            Swal.fire({
                icon: "success",
                title: "¡Orden cobrada exitosamente!",
                html: `
                    <div class="text-left space-y-2">
                        <p><strong>Orden:</strong> #${ordenSeleccionada.id.slice(-6)}</p>
                        <p><strong>Cliente:</strong> ${ordenSeleccionada.cliente_nombre}</p>
                        <p><strong>Total:</strong> ${formatearPrecioCOP(totalFinal)}</p>
                        ${propina > 0 ? `<p><strong>Propina:</strong> ${formatearPrecioCOP(propina)}</p>` : ''}
                        ${cambio > 0 ? `<p><strong>Cambio:</strong> ${formatearPrecioCOP(cambio)}</p>` : ''}
                    </div>
                `,
                confirmButtonText: "Continuar",
                confirmButtonColor: "#10b981"
            });

            // Reset del formulario
            setOrdenSeleccionada(null);
            setMetodoPago("");
            setPropina(0);
            setPropinaPorcentaje(null);
            setEfectivoRecibido(null);
            setShowModal(false);

            // Recargar órdenes
            cargarOrdenes();

        } catch (error) {
            console.error("Error procesando cobro:", error);
            Swal.fire({
                toast: true,
                icon: "error",
                position: "top-end",
                title: "Error interno al procesar el cobro",
                timer: 2500,
                showConfirmButton: false,
            });
        } finally {
            setProcesando(false);
        }
    };

    const totalConPropina = ordenSeleccionada
        ? Number(ordenSeleccionada.total) + propina
        : 0;

    const cambio = metodoPago === "efectivo" && efectivoRecibido
        ? efectivoRecibido - totalConPropina
        : 0;

    // Componente del panel de cobro
    const PanelCobro = () => (
        <div className="flex flex-col h-full justify-between bg-white rounded-3xl p-6 shadow-xl">
            {/* Header */}
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                Cobrar Orden #{ordenSeleccionada?.id.slice(-6)}
            </h3>

            {/* Info del cliente */}
            <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                <p className="font-semibold text-gray-800">{ordenSeleccionada?.cliente_nombre}</p>
                {ordenSeleccionada?.cliente_telefono && (
                    <p className="text-sm text-gray-600">{ordenSeleccionada.cliente_telefono}</p>
                )}
                <p className="text-xs text-gray-500">
                    {ordenSeleccionada?.tipo_orden === 'domicilio' ? 'Domicilio' : 'En establecimiento'}
                </p>
            </div>

            {/* Lista de productos */}
            <div className="mb-4 max-h-48 overflow-y-auto">
                <h4 className="font-medium text-gray-700 mb-2">Productos:</h4>
                <ul className="divide-y divide-gray-200">
                    {ordenSeleccionada?.orden_detalles?.map((detalle) => (
                        <li key={detalle.id} className="flex justify-between py-2 items-center">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-700">{detalle.producto_nombre}</span>
                                {/* Mostrar personalizaciones */}
                                {detalle.orden_personalizaciones && detalle.orden_personalizaciones.filter(p => !p.incluido).length > 0 && (
                                    <span className="text-xs text-red-600">
                                        Sin: {detalle.orden_personalizaciones.filter(p => !p.incluido).map(p => p.ingrediente_nombre).join(", ")}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {detalle.cantidad} x {formatearPrecioCOP(detalle.precio_unitario)}
                                </span>
                            </div>
                            <span className="font-semibold text-gray-800">
                                {formatearPrecioCOP(detalle.subtotal)}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Totales */}
            <div className="space-y-2 mb-4 bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span>{formatearPrecioCOP(Number(ordenSeleccionada?.total || 0))}</span>
                </div>
                {propina > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Propina ({propinaPorcentaje ? `${propinaPorcentaje}%` : 'Personalizada'})</span>
                        <span>{formatearPrecioCOP(propina)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-yellow-300 pt-2">
                    <span>Total a cobrar</span>
                    <span>{formatearPrecioCOP(totalConPropina)}</span>
                </div>
            </div>

            {/* Método de pago */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago *</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { value: "efectivo", label: "Efectivo", icon: "💵" },
                        { value: "tarjeta", label: "Tarjeta", icon: "💳" },
                        { value: "transferencia", label: "Transferencia", icon: "🏦" }
                    ].map((metodo) => (
                        <button
                            key={metodo.value}
                            onClick={() => setMetodoPago(metodo.value as MetodoPago)}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition border-2 ${metodoPago === metodo.value
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                        >
                            <span>{metodo.icon}</span>
                            {metodo.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campo efectivo */}
            {metodoPago === "efectivo" && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Efectivo recibido *
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                            type="number"
                            min={0}
                            step={1000}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-green-400"
                            value={efectivoRecibido ?? ""}
                            onChange={(e) => setEfectivoRecibido(Number(e.target.value) || null)}
                            placeholder="0"
                        />
                    </div>
                    {efectivoRecibido && (
                        <p className={`mt-1 text-sm font-medium ${cambio < 0 ? "text-red-600" : "text-green-600"
                            }`}>
                            {cambio < 0 ? `❌ Faltan ${formatearPrecioCOP(Math.abs(cambio))}` : `Cambio: ${formatearPrecioCOP(cambio)}`}
                        </p>
                    )}
                </div>
            )}

            {/* Propina */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Propina (opcional)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {[0, 10, 15, 20].map((p) => (
                        <button
                            key={p}
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition border-2 ${propinaPorcentaje === p || (p === 0 && propina === 0)
                                ? "bg-yellow-400 text-white border-yellow-400"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                            onClick={() => (p === 0 ? (setPropina(0), setPropinaPorcentaje(null)) : aplicarPropina(p))}
                        >
                            {p === 0 ? "Sin" : `${p}%`}
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    min={0}
                    step={500}
                    placeholder="Propina personalizada"
                    className="w-full border-2 border-gray-300 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    value={propinaPorcentaje === null && propina > 0 ? propina : ""}
                    onChange={(e) => {
                        const valor = Number(e.target.value) || 0;
                        setPropina(valor);
                        setPropinaPorcentaje(null);
                    }}
                />
            </div>

            {/* Confirmar cobro */}
            <button
                onClick={confirmarCobro}
                disabled={!metodoPago || (metodoPago === "efectivo" && (!efectivoRecibido || efectivoRecibido < totalConPropina)) || procesando}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
                {procesando ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                        <CreditCard size={20} />
                        CONFIRMAR COBRO
                    </>
                )}
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-4 bg-green-100 rounded-xl shadow-md">
                            <CreditCard className="text-green-600" size={32} />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-gray-800">Caja - Cobrar Órdenes</h1>
                            <p className="text-gray-600">Órdenes listas para entregar y cobrar</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl">
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-700 font-medium">
                            {ordenes.length} órdenes listas
                        </span>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Lista de órdenes */}
                <div className="lg:col-span-2 xl:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-96 bg-white rounded-3xl shadow-md">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : ordenes.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-md p-12 text-center border border-gray-100">
                            <CheckCircle className="mx-auto text-gray-300" size={64} />
                            <h3 className="text-xl font-medium text-gray-600 mt-4">No hay órdenes listas</h3>
                            <p className="text-gray-500 mt-2">Esperando órdenes desde cocina</p>
                        </div>
                    ) : (
                        ordenes.map((orden) => (
                            <div
                                key={orden.id}
                                onClick={() => seleccionarOrden(orden)}
                                className={`cursor-pointer bg-white rounded-2xl p-5 shadow-sm border-2 transition hover:shadow-md ${ordenSeleccionada?.id === orden.id
                                    ? "border-green-500 bg-green-50 shadow-md"
                                    : "border-gray-200 hover:border-green-400"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                            #{orden.id.slice(-6)}
                                        </span>
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            LISTA
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(orden.created_at).toLocaleTimeString('es-CO', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                <h4 className="font-semibold text-gray-800 text-lg mb-2">{orden.cliente_nombre}</h4>

                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600">
                                        {orden.orden_detalles?.length} producto{(orden.orden_detalles?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-gray-600">
                                        {orden.tipo_orden === 'domicilio' ? '🏠 Domicilio' : '🏪 Local'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-sm">Total a cobrar:</span>
                                    <span className="font-bold text-green-600 text-xl">
                                        {formatearPrecioCOP(Number(orden.total))}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Panel de cobro para desktop */}
                <div className="hidden lg:block lg:col-span-1 xl:col-span-2">
                    <div className="sticky top-6">
                        {ordenSeleccionada ? (
                            <PanelCobro />
                        ) : (
                            <div className="bg-white rounded-3xl shadow-md p-8 text-center border border-gray-200">
                                <CreditCard className="mx-auto text-gray-300 mb-4" size={48} />
                                <p className="text-gray-500">Selecciona una orden para comenzar el cobro</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para móviles */}
            {showModal && ordenSeleccionada && (
                <div className="fixed inset-0 bg-black/25 z-50 flex items-end justify-center lg:hidden">
                    <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
                            <h3 className="text-lg font-semibold text-gray-800">Cobrar Orden</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <PanelCobro />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}