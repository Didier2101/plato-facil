"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { cobrarOrdenAction } from "@/src/actions/cobrarOrdenAction";
import { registrarPropinaAction } from "@/src/actions/registrarPropinaAction";
import type { OrdenCompleta } from "@/src/types/orden";
import Swal from "sweetalert2";
import { formatearPrecioCOP } from "@/src/utils/precio";
import { CreditCard } from "lucide-react";
import { capitalizarSoloPrimera } from "@/src/utils/texto";

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";

type Props = {
    ordenSeleccionada: OrdenCompleta;
    usuarioId: string | null;
    metodoPago: MetodoPago | "";
    setMetodoPago: (metodo: MetodoPago | "") => void;
    propina: number;
    setPropina: (propina: number) => void;
    propinaPorcentaje: number | null;
    setPropinaPorcentaje: (porcentaje: number | null) => void;
    onSuccess: () => void;
    onRecargarOrdenes: () => void;
    isMobile?: boolean;
    onClose?: () => void;
};

export default function PanelCobro({
    ordenSeleccionada,
    usuarioId,
    metodoPago,
    setMetodoPago,
    propina,
    setPropina,
    propinaPorcentaje,
    setPropinaPorcentaje,
    onSuccess,
    onRecargarOrdenes,
    isMobile = false,
    onClose,
}: Props) {
    const [procesando, setProcesando] = useState(false);
    const [propinaInput, setPropinaInput] = useState<string>("");

    const totalConPropina = Number(ordenSeleccionada.total) + propina;

    // Memoizar las funciones que se usan en el JSX
    const aplicarPropina = useCallback((opcion: number) => {
        setPropinaPorcentaje(opcion);
        const total = Number(ordenSeleccionada.total) || 0;
        const calc = Math.round((opcion / 100) * total);
        setPropina(calc);
        setPropinaInput("");
    }, [ordenSeleccionada.total, setPropina, setPropinaPorcentaje]);

    const confirmarCobro = useCallback(async () => {
        if (!usuarioId || !metodoPago) {
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

            if (propina > 0 && result.pagoId) {
                const propinaResult = await registrarPropinaAction(
                    result.pagoId,
                    propina,
                    propinaPorcentaje
                );
                if (!propinaResult.success) {
                    console.error("Error registrando propina:", propinaResult.error);
                }
            }

            Swal.fire({
                icon: "success",
                title: "¡Orden cobrada exitosamente!",
                html: `
          <div class="text-left space-y-2">
            <p><strong>Orden:</strong> #${ordenSeleccionada.id.slice(-6)}</p>
            <p><strong>Cliente:</strong> ${ordenSeleccionada.cliente_nombre}</p>
            <p><strong>Total:</strong> ${formatearPrecioCOP(totalFinal)}</p>
            ${propina > 0 ? `<p><strong>Propina:</strong> ${formatearPrecioCOP(propina)}</p>` : ""}
          </div>
        `,
                confirmButtonText: "Continuar",
                confirmButtonColor: "#f97316",
            });

            onSuccess();
            onRecargarOrdenes();
            setPropinaInput("");
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
    }, [usuarioId, metodoPago, ordenSeleccionada, propina, propinaPorcentaje, onSuccess, onRecargarOrdenes]);

    const handlePropinaInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || /^\d+$/.test(value)) {
            setPropinaInput(value);
        }
    }, []);

    const aplicarPropinaDesdeInput = useCallback(() => {
        if (!propinaInput || propinaInput === "0") {
            setPropina(0);
            setPropinaPorcentaje(null);
            return;
        }

        const numero = parseInt(propinaInput, 10);
        if (!isNaN(numero) && numero >= 0) {
            setPropina(numero);
            setPropinaPorcentaje(null);
        }

        setPropinaInput("");
    }, [propinaInput, setPropina, setPropinaPorcentaje]);

    const handlePorcentajePropina = useCallback((p: number) => {
        if (p === 0) {
            setPropina(0);
            setPropinaPorcentaje(null);
            setPropinaInput("");
        } else {
            aplicarPropina(p);
        }
    }, [aplicarPropina, setPropina, setPropinaPorcentaje]);

    // Memoizar el contenido del panel con todas las dependencias necesarias
    const panelContent = useMemo(() => {
        return (
            <div className="space-y-6">
                {/* Info cliente */}
                <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="font-semibold text-gray-800">
                        {capitalizarSoloPrimera(ordenSeleccionada.cliente_nombre)}
                    </p>
                    {ordenSeleccionada.cliente_telefono && (
                        <p className="text-sm text-gray-600">{ordenSeleccionada.cliente_telefono}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        {ordenSeleccionada.tipo_orden === "domicilio" ? "Domicilio" : "En establecimiento"}
                    </p>
                </div>

                {/* Productos */}
                <div className="max-h-64 overflow-y-auto pr-2">
                    <h4 className="font-semibold text-gray-900 text-lg mb-2 flex items-center gap-2">
                        <CreditCard className="text-orange-500" />
                        Productos a cobrar
                    </h4>
                    <div className="space-y-2">
                        {ordenSeleccionada.orden_detalles?.map((detalle) => (
                            <div key={detalle.id} className="border-b border-gray-200 pb-2 last:border-none">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <span className="font-semibold text-gray-900">{detalle.producto_nombre}</span>
                                        <p className="text-xs text-gray-500">
                                            {detalle.cantidad} x {formatearPrecioCOP(detalle.precio_unitario)}
                                        </p>
                                    </div>
                                    <span className="font-bold text-gray-800">{formatearPrecioCOP(detalle.subtotal)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totales */}
                <div className="space-y-2 bg-orange-50 p-4 rounded-2xl border border-orange-200">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal</span>
                        <span>{formatearPrecioCOP(Number(ordenSeleccionada.total))}</span>
                    </div>

                    {propina > 0 && (
                        <div className="flex justify-between text-gray-600 text-sm">
                            <span>Propina {propinaPorcentaje ? `(${propinaPorcentaje}%)` : "(personalizada)"}</span>
                            <span>{formatearPrecioCOP(propina)}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-orange-300 pt-2">
                        <span>Total a cobrar</span>
                        <span>{formatearPrecioCOP(totalConPropina)}</span>
                    </div>
                </div>

                {/* Propina + Métodos de pago */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Propina */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Propina (opcional)</label>

                        {/* Botones de porcentaje */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {[0, 10, 15, 20].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`px-2 py-2 rounded-lg text-xs font-medium transition border-2 ${propinaPorcentaje === p || (p === 0 && propina === 0 && propinaPorcentaje === null)
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                        }`}
                                    onClick={() => handlePorcentajePropina(p)}
                                >
                                    {p === 0 ? "Sin" : `${p}%`}
                                </button>
                            ))}
                        </div>

                        {/* Input personalizado */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Ej: 3000"
                                className="flex-1 border-2 border-gray-300 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
                                value={propinaInput}
                                onChange={handlePropinaInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        aplicarPropinaDesdeInput();
                                    }
                                }}
                            />

                            <button
                                type="button"
                                onClick={aplicarPropinaDesdeInput}
                                disabled={!propinaInput}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${propinaInput ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Agregar
                            </button>
                        </div>

                        {/* Indicador de propina actual */}
                        {propina > 0 && (
                            <div className="mt-2 text-xs text-gray-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                ✓ Propina agregada: {formatearPrecioCOP(propina)}
                            </div>
                        )}
                    </div>

                    {/* Métodos de pago */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                                { value: "efectivo", label: "Efectivo", icon: "💵" },
                                { value: "tarjeta", label: "Tarjeta", icon: "💳" },
                                { value: "transferencia", label: "Transferencia", icon: "🏦" },
                            ].map((metodo) => (
                                <button
                                    key={metodo.value}
                                    type="button"
                                    onClick={() => setMetodoPago(metodo.value as MetodoPago)}
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${metodoPago === metodo.value ? "bg-orange-500 text-white border-orange-500 shadow-md transform scale-[0.98]" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                                        }`}
                                >
                                    <span>{metodo.icon}</span>
                                    <span>{metodo.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botón Confirmar */}
                <button
                    type="button"
                    onClick={confirmarCobro}
                    disabled={!metodoPago || procesando}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[0.99] disabled:transform-none"
                >
                    {procesando ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                            <span>Procesando...</span>
                        </>
                    ) : (
                        <>
                            <CreditCard size={24} />
                            <span>CONFIRMAR COBRO</span>
                        </>
                    )}
                </button>
            </div>
        );
    }, [
        ordenSeleccionada,
        propina,
        propinaPorcentaje,
        propinaInput,
        metodoPago,
        procesando,
        totalConPropina,
        handlePorcentajePropina,
        handlePropinaInputChange,
        aplicarPropinaDesdeInput,
        confirmarCobro,
        setMetodoPago
    ]);

    // Renderizado móvil
    if (isMobile) {
        return (
            <>
                {/* Overlay */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black z-40" onClick={onClose} />

                {/* Modal */}
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-hidden"
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(event, info) => {
                        if (info.offset.y > 100) {
                            onClose?.();
                        }
                    }}
                >
                    <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4 cursor-pointer hover:bg-gray-400 transition-colors" onClick={onClose} />

                    <div className="px-6 border-b border-gray-200 pb-4">
                        <h3 className="text-xl font-bold text-gray-800">Cobrar Orden #{ordenSeleccionada.id.slice(-6)}</h3>
                    </div>

                    <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">{panelContent}</div>
                </motion.div>
            </>
        );
    }

    // Renderizado desktop
    return (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
                <h3 className="text-xl font-bold text-gray-800">Cobrar Orden #{ordenSeleccionada.id.slice(-6)}</h3>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">{panelContent}</div>
        </motion.div>
    );
}