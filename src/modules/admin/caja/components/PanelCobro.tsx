"use client";

import { useState, useCallback, useEffect } from "react";
import {
    CreditCard,
    Package,
    Truck,
    FileText,
    Printer,
    ChevronRight,
    Banknote,
    Building2,
    Sparkles,
    CheckCircle2,
    X
} from "lucide-react";
import { motion } from "framer-motion";
import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";
import { toast } from "@/src/shared/services/toast.service";
import GeneradorRecibo from "./GeneradorRecibo";
import { obtenerConfiguracionRestaurante, type ConfiguracionRestaurante } from "@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions";
import { formatearPrecioCOP } from "@/src/shared/utils/precio";

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
    onClose,
}: Props) {
    const [procesando, setProcesando] = useState(false);
    const [propinaInput, setPropinaInput] = useState<string>("");
    const [generarRecibo, setGenerarRecibo] = useState(false);
    const [config, setConfig] = useState<ConfiguracionRestaurante | null>(null);

    // Cargar configuración para el recibo
    useEffect(() => {
        const cargarConfigs = async () => {
            const res = await obtenerConfiguracionRestaurante();
            if (res.success && res.configuracion) {
                setConfig(res.configuracion);
            }
        };
        cargarConfigs();
    }, []);

    const subtotalProductos = Number(ordenSeleccionada.subtotal_productos || 0);
    const costoDomicilio = Number(ordenSeleccionada.costo_domicilio || 0);
    const totalOrden = subtotalProductos + costoDomicilio;
    const totalConPropina = totalOrden + propina;

    const aplicarPropina = useCallback(
        (opcion: number) => {
            setPropinaPorcentaje(opcion);
            const calc = Math.round((opcion / 100) * subtotalProductos);
            setPropina(calc);
            setPropinaInput("");
        },
        [subtotalProductos, setPropina, setPropinaPorcentaje]
    );

    const handlePorcentajePropina = useCallback(
        (p: number) => {
            if (p === 0) {
                setPropina(0);
                setPropinaPorcentaje(null);
                setPropinaInput("");
            } else {
                aplicarPropina(p);
            }
        },
        [aplicarPropina, setPropina, setPropinaPorcentaje]
    );

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

    const confirmarCobro = useCallback(async () => {
        if (!usuarioId || !metodoPago) {
            toast.warning("Datos faltantes", { description: "Selecciona un método de pago" });
            return;
        }

        setProcesando(true);

        try {
            const { cobrarOrdenAction } = await import("@/src/modules/admin/caja/actions/cobrarOrdenAction");

            const resultado = await cobrarOrdenAction(
                ordenSeleccionada.id,
                usuarioId,
                metodoPago as "efectivo" | "tarjeta" | "transferencia",
                propina,
                generarRecibo ? "recibo" : "ninguno"
            );

            if (!resultado.success) {
                toast.error("Error al cobrar", { description: resultado.error || "Inténtalo de nuevo" });
                return;
            }

            if (generarRecibo) {
                toast.success("Orden cobrada. Generando recibo...");
                setTimeout(() => {
                    window.print();
                }, 500);
            } else {
                toast.success("Orden cobrada exitosamente");
            }

            onSuccess();
            onRecargarOrdenes();

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            toast.error("Error crítico", { description: errorMsg });
        } finally {
            setProcesando(false);
        }
    }, [
        usuarioId,
        metodoPago,
        ordenSeleccionada,
        propina,
        generarRecibo,
        onSuccess,
        onRecargarOrdenes,
    ]);

    return (
        <div className="space-y-10 pb-10">
            {onClose && (
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Panel de Cobro</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Finalizar Orden</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 hover:rotate-90 transition-all duration-300"
                    >
                        <X size={24} />
                    </button>
                </div>
            )}
            {/* Totales Section */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Resumen de Cuenta</p>
                <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-8 space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Package size={16} />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Productos</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 tracking-tighter">{formatearPrecioCOP(subtotalProductos)}</span>
                    </div>

                    {costoDomicilio > 0 && (
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Truck size={16} />
                                </div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Domicilio</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{formatearPrecioCOP(costoDomicilio)}</span>
                        </div>
                    )}

                    {propina > 0 && (
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                                    <CreditCard size={16} />
                                </div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Propina</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 tracking-tighter">{formatearPrecioCOP(propina)}</span>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-200">
                        <div className="bg-slate-900 rounded-3xl p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <Banknote size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a Pagar</p>
                                    <p className="text-white text-xs font-black uppercase tracking-[0.2em]">{metodoPago || 'PENDIENTE'}</p>
                                </div>
                            </div>
                            <span className="text-3xl font-black text-white tracking-tighter">{formatearPrecioCOP(totalConPropina)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN: GENERAR RECIBO PDF */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Comprobante</p>
                <div className={`p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${generarRecibo ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-100'}`}>
                    <button
                        type="button"
                        onClick={() => setGenerarRecibo(!generarRecibo)}
                        className="flex items-center justify-between w-full group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl transition-all duration-300 flex items-center justify-center ${generarRecibo ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-400'}`}>
                                <FileText size={20} />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recibo de Venta</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generar comprobante PDF</p>
                            </div>
                        </div>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${generarRecibo ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-200'}`}>
                            {generarRecibo ? <CheckCircle2 size={18} /> : <div className="h-4 w-4 rounded-full border-2 border-slate-200" />}
                        </div>
                    </button>

                    {generarRecibo && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-orange-200/50"
                        >
                            <div className="flex items-start gap-2 bg-white/50 p-4 rounded-2xl text-[10px] font-black text-orange-600 uppercase tracking-widest leading-relaxed">
                                <Printer size={14} className="shrink-0 mt-0.5" />
                                <p>Se activará el diálogo de impresión para enviar a la termica o guardar PDF.</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <GeneradorRecibo orden={ordenSeleccionada} config={config} />

            {/* Tip Selection Section */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Atención & Propina</p>
                <div className="grid grid-cols-4 gap-3">
                    {[0, 10, 15, 20].map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => handlePorcentajePropina(p)}
                            className={`py-4 rounded-[1.5rem] text-[10px] font-black transition-all duration-300 border-2 uppercase tracking-widest ${propinaPorcentaje === p || (p === 0 && propina === 0 && propinaPorcentaje === null)
                                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                                : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600"
                                }`}
                        >
                            {p === 0 ? "Sin" : `${p}%`}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 mt-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 font-black text-xs">
                            $
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Monto manual..."
                            value={propinaInput}
                            onChange={handlePropinaInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") aplicarPropinaDesdeInput();
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-10 pr-6 text-sm font-black text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={aplicarPropinaDesdeInput}
                        disabled={!propinaInput}
                        className={`px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${propinaInput
                            ? "bg-slate-900 text-white shadow-lg hover:bg-slate-800"
                            : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            }`}
                    >
                        Fijar
                    </button>
                </div>
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Método de Liquidación</p>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { value: "efectivo", label: "Efectivo", icon: Banknote },
                        { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
                        { value: "transferencia", label: "Transfer", icon: Building2 },
                    ].map((metodo) => (
                        <button
                            key={metodo.value}
                            type="button"
                            onClick={() => setMetodoPago(metodo.value as MetodoPago)}
                            className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-[2rem] transition-all duration-300 border-2 overflow-hidden relative group ${metodoPago === metodo.value
                                ? "bg-orange-500 border-orange-500 shadow-xl shadow-orange-200"
                                : "bg-white border-slate-100 hover:border-slate-300"
                                }`}
                        >
                            <metodo.icon className={`h-6 w-6 transition-colors duration-300 ${metodoPago === metodo.value ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
                            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${metodoPago === metodo.value ? "text-white" : "text-slate-500"}`}>
                                {metodo.label}
                            </span>
                            {metodoPago === metodo.value && (
                                <motion.div
                                    layoutId="activeMetodo"
                                    className="absolute inset-0 bg-white/10"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Action Section */}
            <div className="pt-6">
                <button
                    type="button"
                    onClick={confirmarCobro}
                    disabled={!metodoPago || procesando}
                    className="w-full relative group overflow-hidden"
                >
                    <div className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 group-hover:scale-110 ${(!metodoPago || procesando) ? 'opacity-50' : 'opacity-100'}`} />
                    <div className="relative flex items-center justify-center gap-4 py-6 px-8 rounded-3xl text-white shadow-2xl shadow-orange-200">
                        {procesando ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">Liquidando...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-6 w-6" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">CONFIRMAR LIQUIDACIÓN — {formatearPrecioCOP(totalConPropina)}</span>
                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
