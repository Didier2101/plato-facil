"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { CreditCard, Package, Truck, FileText, Printer, Receipt } from "lucide-react";
import type { OrdenCompleta } from "@/src/types/orden";

type MetodoPago = "efectivo" | "tarjeta" | "transferencia";
type TipoDocumento = "NIT" | "CC" | "CE" | "Pasaporte";
type TipoComprobante = "factura" | "recibo" | "ninguno";

interface DatosFacturacion {
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    razonSocial: string;
    email: string;
    telefono: string;
    direccion: string;
}

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
    const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>("ninguno");
    const [datosFacturacion, setDatosFacturacion] = useState<DatosFacturacion>({
        tipoDocumento: "CC",
        numeroDocumento: "",
        razonSocial: "",
        email: "",
        telefono: "",
        direccion: "",
    });

    const esOrdenEstablecimiento = ordenSeleccionada.tipo_orden === "establecimiento";
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

    const datosFacturacionCompletos = useMemo(() => {
        if (tipoComprobante !== "factura") return true;
        return (
            datosFacturacion.numeroDocumento.trim() !== "" &&
            datosFacturacion.razonSocial.trim() !== "" &&
            datosFacturacion.email.trim() !== ""
        );
    }, [tipoComprobante, datosFacturacion]);

    const confirmarCobro = useCallback(async () => {
        if (!usuarioId || !metodoPago) {
            alert("Completa método de pago");
            return;
        }

        if (esOrdenEstablecimiento && tipoComprobante === "factura" && !datosFacturacionCompletos) {
            alert("Completa los datos de facturación");
            return;
        }

        setProcesando(true);

        try {
            console.log("=== INICIANDO PROCESO DE COBRO ===");
            console.log("Orden ID:", ordenSeleccionada.id);
            console.log("Usuario ID:", usuarioId);
            console.log("Método de pago:", metodoPago);
            console.log("Propina:", propina);
            console.log("Tipo comprobante:", tipoComprobante);
            console.log("Datos facturación:", tipoComprobante === "factura" ? datosFacturacion : null);

            // Importar el action
            const { cobrarOrdenAction } = await import("@/src/actions/cobrarOrdenAction");

            // Llamar al action con los datos reales
            console.log("📞 Llamando a cobrarOrdenAction...");
            const resultado = await cobrarOrdenAction(
                ordenSeleccionada.id,
                usuarioId,
                metodoPago as "efectivo" | "tarjeta" | "transferencia",
                propina,
                tipoComprobante,
                tipoComprobante === "factura" ? datosFacturacion : undefined
            );

            console.log("📥 Respuesta de cobrarOrdenAction:", resultado);

            if (!resultado.success) {
                console.error("❌ ERROR EN COBRO:", resultado.error);
                alert(`❌ Error al cobrar:\n\n${resultado.error}\n\nRevisa la consola para más detalles.`);
                return;
            }

            console.log("✅ Cobro exitoso, procesando comprobante...");

            // Cobro exitoso - ahora ejecutar acciones según el tipo de comprobante
            if (resultado.tipoComprobante === 'recibo') {
                console.log("🖨️ Imprimiendo recibo...");
                const { imprimirReciboAction } = await import("@/src/actions/imprimirReciboAction");
                const resultadoImpresion = await imprimirReciboAction(resultado.ordenId);

                console.log("📥 Respuesta de imprimirReciboAction:", resultadoImpresion);

                if (!resultadoImpresion.success) {
                    console.error("⚠️ Error en impresión:", resultadoImpresion.error);
                    alert(`⚠️ Orden cobrada correctamente pero hubo un error al imprimir:\n\n${resultadoImpresion.error}\n\nLa orden ya está registrada como entregada.`);
                } else {
                    console.log("✅ Recibo impreso correctamente");
                    alert("✅ Orden cobrada y recibo impreso exitosamente");
                }

            } else if (resultado.tipoComprobante === 'factura' && resultado.facturaId) {
                console.log("📄 Generando factura electrónica...");
                console.log("Factura ID:", resultado.facturaId);

                const { generarFacturaElectronicaAction } = await import("@/src/actions/generarFacturaElectronicaAction");
                const resultadoFactura = await generarFacturaElectronicaAction(resultado.facturaId);

                console.log("📥 Respuesta de generarFacturaElectronicaAction:", resultadoFactura);

                if (!resultadoFactura.success) {
                    console.error("⚠️ Error en facturación:", resultadoFactura.error);
                    alert(`⚠️ Orden cobrada correctamente pero hubo un error al generar la factura:\n\n${resultadoFactura.error}\n\nLa orden ya está registrada como entregada.\nLa factura puede generarse después desde el panel de administración.`);
                } else {
                    console.log("✅ Factura generada correctamente");
                    console.log("Número factura:", resultadoFactura.numeroFactura);
                    console.log("CUFE:", resultadoFactura.cufe);
                    console.log("URL PDF:", resultadoFactura.facturaUrl);
                    alert(`✅ Orden cobrada y factura generada exitosamente\n\n📄 Número: ${resultadoFactura.numeroFactura}\n🔐 CUFE: ${resultadoFactura.cufe?.substring(0, 20)}...\n\nLa factura se ha enviado al correo electrónico.`);
                }

            } else {
                // Solo cobro, sin comprobante
                console.log("✅ Cobro simple completado (sin comprobante)");
                alert("✅ Orden cobrada exitosamente");
            }

            console.log("=== PROCESO DE COBRO COMPLETADO ===");

            // Limpiar estados y recargar
            onSuccess();
            onRecargarOrdenes();

        } catch (error) {
            console.error("💥 ERROR CRÍTICO:", error);
            console.error("Stack trace:", error instanceof Error ? error.stack : "No disponible");

            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            alert(`❌ Error crítico al procesar:\n\n${errorMsg}\n\nRevisa la consola del navegador (F12) para más detalles.`);
        } finally {
            setProcesando(false);
        }
    }, [
        usuarioId,
        metodoPago,
        esOrdenEstablecimiento,
        tipoComprobante,
        datosFacturacionCompletos,
        ordenSeleccionada,
        datosFacturacion,
        propina,
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

            {/* SECCIÓN CONDICIONAL: TIPO DE COMPROBANTE (solo establecimiento) */}
            {esOrdenEstablecimiento && (
                <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="text-purple-600" />
                        <h4 className="font-bold text-purple-900">Tipo de Comprobante</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: "ninguno", label: "Solo Pagar", icon: "💵" },
                            { value: "recibo", label: "Recibo Caja", icon: "🧾" },
                            { value: "factura", label: "Factura", icon: "📄" },
                        ].map((tipo) => (
                            <button
                                key={tipo.value}
                                type="button"
                                onClick={() => setTipoComprobante(tipo.value as TipoComprobante)}
                                className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg text-xs font-semibold transition-all border-2 ${tipoComprobante === tipo.value
                                    ? "bg-purple-500 text-white border-purple-600 shadow-md"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <span className="text-2xl">{tipo.icon}</span>
                                <span>{tipo.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Formulario de datos fiscales (solo si selecciona factura) */}
                    {tipoComprobante === "factura" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-white border-2 border-purple-300 rounded-lg p-4 space-y-3"
                        >
                            <h5 className="font-semibold text-purple-900 text-sm">Datos de Facturación</h5>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Tipo Doc *
                                    </label>
                                    <select
                                        value={datosFacturacion.tipoDocumento}
                                        onChange={(e) =>
                                            setDatosFacturacion({
                                                ...datosFacturacion,
                                                tipoDocumento: e.target.value as TipoDocumento,
                                            })
                                        }
                                        className="w-full border-2 border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                    >
                                        <option value="CC">Cédula</option>
                                        <option value="NIT">NIT</option>
                                        <option value="CE">Cédula Extranjería</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Número *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123456789"
                                        value={datosFacturacion.numeroDocumento}
                                        onChange={(e) =>
                                            setDatosFacturacion({
                                                ...datosFacturacion,
                                                numeroDocumento: e.target.value,
                                            })
                                        }
                                        className="w-full border-2 border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Razón Social / Nombre *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Juan Pérez o Empresa SAS"
                                    value={datosFacturacion.razonSocial}
                                    onChange={(e) =>
                                        setDatosFacturacion({
                                            ...datosFacturacion,
                                            razonSocial: e.target.value,
                                        })
                                    }
                                    className="w-full border-2 border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={datosFacturacion.email}
                                    onChange={(e) =>
                                        setDatosFacturacion({ ...datosFacturacion, email: e.target.value })
                                    }
                                    className="w-full border-2 border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        placeholder="3001234567"
                                        value={datosFacturacion.telefono}
                                        onChange={(e) =>
                                            setDatosFacturacion({ ...datosFacturacion, telefono: e.target.value })
                                        }
                                        className="w-full border-2 border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Calle 123 #45-67"
                                        value={datosFacturacion.direccion}
                                        onChange={(e) =>
                                            setDatosFacturacion({ ...datosFacturacion, direccion: e.target.value })
                                        }
                                        className="w-full border-2 border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Info según tipo seleccionado */}
                    <div className="text-xs bg-white border border-purple-200 rounded-lg p-3">
                        {tipoComprobante === "ninguno" && (
                            <p className="text-gray-600">
                                ⚡ Solo se registrará el pago. No se imprimirá ni emitirá documento.
                            </p>
                        )}
                        {tipoComprobante === "recibo" && (
                            <div className="flex items-start gap-2 text-gray-700">
                                <Printer className="text-purple-600 mt-0.5" size={16} />
                                <div>
                                    <p className="font-semibold">Se imprimirá recibo térmico</p>
                                    <p className="text-gray-500">La caja registradora se abrirá automáticamente</p>
                                </div>
                            </div>
                        )}
                        {tipoComprobante === "factura" && (
                            <div className="flex items-start gap-2 text-gray-700">
                                <Receipt className="text-purple-600 mt-0.5" size={16} />
                                <div>
                                    <p className="font-semibold">Se emitirá factura electrónica vía Factus</p>
                                    <p className="text-gray-500">
                                        Se enviará al correo y podrá imprimirse opcionalmente
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                disabled={!metodoPago || procesando || (tipoComprobante === "factura" && !datosFacturacionCompletos)}
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