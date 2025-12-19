"use client";

import { useState, useCallback } from "react";
import { CreditCard, Package, Truck, FileText, Printer, CheckSquare, Square } from "lucide-react";
import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";
import { toast } from "@/src/shared/services/toast.service";
import GeneradorRecibo from "./GeneradorRecibo";
import { obtenerConfiguracionRestaurante, type ConfiguracionRestaurante } from "@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions";
import { useEffect } from "react";


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

    const formatearPrecioCOP = (valor: number) => {
        return `$${valor.toLocaleString("es-CO")}`;
    };

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
            console.log("=== INICIANDO PROCESO DE COBRO ===");
            console.log("Orden ID:", ordenSeleccionada.id);
            console.log("Usuario ID:", usuarioId);
            console.log("Método de pago:", metodoPago);
            console.log("Propina:", propina);
            console.log("Generar recibo PDF:", generarRecibo);

            // Importar el action
            const { cobrarOrdenAction } = await import("@/src/modules/admin/caja/actions/cobrarOrdenAction");

            // Llamar al action con los datos reales
            console.log("📞 Llamando a cobrarOrdenAction...");
            const resultado = await cobrarOrdenAction(
                ordenSeleccionada.id,
                usuarioId,
                metodoPago as "efectivo" | "tarjeta" | "transferencia",
                propina,
                generarRecibo ? "recibo" : "ninguno"
            );

            console.log("📥 Respuesta de cobrarOrdenAction:", resultado);

            if (!resultado.success) {
                console.error("❌ ERROR EN COBRO:", resultado.error);
                toast.error("Error al cobrar", { description: resultado.error || "Inténtalo de nuevo" });
                return;
            }


            console.log("✅ Cobro exitoso, procesando comprobante...");

            if (generarRecibo) {
                toast.success("Orden cobrada. Generando recibo...");
                // Pequeño delay para asegurar que el componente esté renderizado
                setTimeout(() => {
                    window.print();
                }, 500);
            } else {
                toast.success("Orden cobrada exitosamente");
            }


            console.log("=== PROCESO DE COBRO COMPLETADO ===");

            // Limpiar estados y recargar
            onSuccess();
            onRecargarOrdenes();

        } catch (error) {
            console.error("💥 ERROR CRÍTICO:", error);
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
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                <h3 className="text-xl font-bold text-gray-800">
                    Cobrar Orden #{ordenSeleccionada.id.slice(-6)}
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                    Tipo: {ordenSeleccionada.tipo_orden}
                </p>
            </div>

            {/* Info Cliente */}
            <div className="p-4 bg-orange-50 rounded-xl">
                <p className="font-semibold text-gray-800">{ordenSeleccionada.cliente_nombre}</p>
                {ordenSeleccionada.cliente_telefono && (
                    <p className="text-sm text-gray-600">{ordenSeleccionada.cliente_telefono}</p>
                )}
            </div>

            {/* Totales */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-blue-600" />
                        <span className="font-medium text-blue-800">Productos</span>
                    </div>
                    <span className="font-bold text-blue-800">{formatearPrecioCOP(subtotalProductos)}</span>
                </div>

                {costoDomicilio > 0 && (
                    <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                            <Truck size={16} className="text-yellow-600" />
                            <span className="font-medium text-yellow-800">Domicilio</span>
                        </div>
                        <span className="font-bold text-yellow-800">{formatearPrecioCOP(costoDomicilio)}</span>
                    </div>
                )}

                {propina > 0 && (
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-green-600" />
                            <span className="font-medium text-green-800">Propina</span>
                        </div>
                        <span className="font-bold text-green-800">{formatearPrecioCOP(propina)}</span>
                    </div>
                )}

                <div className="flex justify-between font-bold text-lg text-gray-800 bg-orange-100 p-3 rounded-lg border-2 border-orange-300">
                    <span>TOTAL A COBRAR</span>
                    <span>{formatearPrecioCOP(totalConPropina)}</span>
                </div>
            </div>

            {/* SECCIÓN: GENERAR RECIBO PDF */}
            <div className="border-2 border-blue-100 bg-blue-50 rounded-xl p-4 space-y-3">
                <button
                    type="button"
                    onClick={() => setGenerarRecibo(!generarRecibo)}
                    className="flex items-center justify-between w-full group"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${generarRecibo ? 'bg-blue-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                            <FileText size={20} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-800">Recibo de pago</h4>
                            <p className="text-xs text-gray-500">Generar PDF para el cliente</p>
                        </div>
                    </div>
                    <div>
                        {generarRecibo ? (
                            <CheckSquare className="text-blue-500" size={24} />
                        ) : (
                            <Square className="text-gray-300" size={24} />
                        )}
                    </div>
                </button>

                {generarRecibo && (
                    <div className="text-xs bg-white border border-blue-200 rounded-lg p-3 text-blue-700 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-start gap-2">
                            <Printer size={14} className="mt-0.5" />
                            <p>Se abrirá el diálogo de impresión para guardar como PDF o imprimir.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenedor invisible para el recibo (solo se ve al imprimir) */}
            <GeneradorRecibo orden={ordenSeleccionada} config={config} />

            {/* Propina */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propina (opcional)
                </label>

                <div className="grid grid-cols-4 gap-2 mb-3">
                    {[0, 10, 15, 20].map((p) => (
                        <button
                            key={p}
                            type="button"
                            className={`px-2 py-2 rounded-lg text-xs font-medium transition border-2 ${propinaPorcentaje === p ||
                                (p === 0 && propina === 0 && propinaPorcentaje === null)
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                            onClick={() => handlePorcentajePropina(p)}
                        >
                            {p === 0 ? "Sin" : `${p}%`}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 3000"
                        className="flex-1 border-2 border-gray-300 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
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
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${propinaInput
                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Agregar
                    </button>
                </div>
            </div>

            {/* Métodos de pago */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago *</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: "efectivo", label: "Efectivo", icon: "💵" },
                        { value: "tarjeta", label: "Tarjeta", icon: "💳" },
                        { value: "transferencia", label: "Transferencia", icon: "🏦" },
                    ].map((metodo) => (
                        <button
                            key={metodo.value}
                            type="button"
                            onClick={() => setMetodoPago(metodo.value as MetodoPago)}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${metodoPago === metodo.value
                                ? "bg-orange-500 text-white border-orange-500 shadow-md"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                }`}
                        >
                            <span>{metodo.icon}</span>
                            <span>{metodo.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Botón Confirmar */}
            <button
                type="button"
                onClick={confirmarCobro}
                disabled={!metodoPago || procesando}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
                {procesando ? (
                    <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        <span>Procesando...</span>
                    </>
                ) : (
                    <>
                        <CreditCard size={24} />
                        <span>CONFIRMAR COBRO - {formatearPrecioCOP(totalConPropina)}</span>
                    </>
                )}
            </button>
        </div>
    );
}
