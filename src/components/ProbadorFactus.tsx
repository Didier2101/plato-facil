// ==========================================
// 3. COMPONENT: src/components/ProbadorFactus.tsx
// ==========================================
"use client";

import { useState } from "react";
import type { RespuestaPrueba } from "@/src/types/factus";

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export function ProbadorFactus() {
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState<RespuestaPrueba | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const agregarLog = (mensaje: string, type: LogEntry['type'] = 'info') => {
        const timestamp = new Date().toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        setLogs(prev => [...prev, { timestamp, message: mensaje, type }]);
    };

    const limpiarLogs = () => {
        setLogs([]);
        setResultado(null);
    };

    const probarConexion = async () => {
        setProcesando(true);
        limpiarLogs();

        try {
            agregarLog("🔌 Iniciando conexión con Factus API Sandbox", 'info');
            agregarLog("🔐 Paso 1: Autenticando con OAuth2...", 'info');

            const { probarConexionFactusAction } = await import("@/src/actions/probarConexionFactusAction");

            agregarLog("🏙️ Paso 2: Obteniendo municipio de Bogotá...", 'info');
            agregarLog("💰 Paso 3: Creando factura con propina...", 'info');

            const resultado = await probarConexionFactusAction();

            if (resultado.success) {
                agregarLog("✅ ¡Factura creada exitosamente!", 'success');
                if (resultado.facturaData?.data?.bill) {
                    const bill = resultado.facturaData.data.bill;
                    agregarLog(`📄 Número: ${bill.number}`, 'success');

                    const total = typeof bill.total === 'string' ? parseFloat(bill.total) : bill.total;
                    agregarLog(`💰 Total: $${total.toLocaleString()}`, 'success');

                    if (bill.surcharge_amount) {
                        const propina = typeof bill.surcharge_amount === 'string'
                            ? parseFloat(bill.surcharge_amount)
                            : bill.surcharge_amount;
                        agregarLog(`🎁 Propina: $${propina.toLocaleString()}`, 'success');
                    }

                    agregarLog(`📊 Estado: ${bill.status === 1 ? 'Validada' : 'Pendiente'}`, 'success');
                }
            } else {
                agregarLog("❌ Error al crear la factura", 'error');
                agregarLog(`⚠️ ${resultado.error}`, 'error');
            }

            setResultado(resultado);
        } catch (error) {
            agregarLog("💥 Error crítico en la conexión", 'error');
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            agregarLog(errorMessage, 'error');

            setResultado({
                success: false,
                error: errorMessage
            });
        } finally {
            setProcesando(false);
            agregarLog("🏁 Proceso finalizado", 'info');
        }
    };

    const getLogColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            default: return 'text-green-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            💰 Probador Factura Electrónica
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Factus API - Ambiente Sandbox
                        </p>
                    </div>
                    <div className="text-right text-sm">
                        <p className="text-blue-100">🌐 api-sandbox.factus.com.co</p>
                        <p className="text-blue-100">📧 sandbox@factus.com.co</p>
                    </div>
                </div>
            </div>

            {/* Caso de prueba */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-5">
                <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    🎯 Caso de Prueba
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border border-purple-100">
                        <p className="font-semibold text-purple-700 mb-1">Producto</p>
                        <p className="text-gray-600">2 unidades × $25,000</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                        <p className="font-semibold text-purple-700 mb-1">Subtotal</p>
                        <p className="text-gray-600">$50,000</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                        <p className="font-semibold text-purple-700 mb-1">IVA (19%)</p>
                        <p className="text-gray-600">$9,500</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-100">
                        <p className="font-semibold text-purple-700 mb-1">Propina (10%)</p>
                        <p className="text-green-600 font-semibold">$5,000</p>
                    </div>
                </div>
                <div className="mt-3 bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded border-2 border-purple-300">
                    <p className="font-bold text-purple-800 text-center">
                        Total Esperado: $64,500
                    </p>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <button
                    onClick={probarConexion}
                    disabled={procesando}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-lg disabled:from-gray-400 disabled:to-gray-500 font-semibold transition-all shadow-md hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed"
                >
                    {procesando ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="inline-block animate-spin">⚙️</span>
                            Procesando...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            🚀 Crear Factura con Propina
                        </span>
                    )}
                </button>
                {logs.length > 0 && (
                    <button
                        onClick={limpiarLogs}
                        disabled={procesando}
                        className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        🗑️ Limpiar
                    </button>
                )}
            </div>

            {/* Logs en tiempo real */}
            {logs.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-green-400 font-mono font-semibold">
                            📊 Logs del Proceso
                        </h3>
                        <span className="text-gray-500 text-xs">
                            {logs.length} eventos
                        </span>
                    </div>
                    <div className="space-y-1 font-mono text-xs overflow-auto max-h-64">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className={`${getLogColor(log.type)} hover:bg-gray-800 px-2 py-1 rounded`}
                            >
                                [{log.timestamp}] {log.message}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resultado */}
            {resultado && (
                <div className={`rounded-xl p-6 border-2 shadow-lg ${resultado.success
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                    }`}>
                    <div className="flex items-start gap-4">
                        <span className="text-5xl">
                            {resultado.success ? "✅" : "❌"}
                        </span>
                        <div className="flex-1">
                            <h3 className="font-bold text-2xl mb-3">
                                {resultado.success ? "¡Factura Creada!" : "Error en la Creación"}
                            </h3>

                            {resultado.success && resultado.facturaData?.data?.bill ? (
                                <div className="space-y-4">
                                    <p className="text-gray-700 text-lg">
                                        {resultado.message}
                                    </p>

                                    <div className="bg-white rounded-lg p-5 border-2 border-green-200 shadow">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-green-50 p-3 rounded">
                                                <p className="text-sm font-semibold text-gray-600 mb-1">
                                                    📄 Número de Factura
                                                </p>
                                                <p className="text-xl font-bold text-gray-800">
                                                    {resultado.facturaData.data.bill.number}
                                                </p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded">
                                                <p className="text-sm font-semibold text-gray-600 mb-1">
                                                    💰 Total
                                                </p>
                                                <p className="text-xl font-bold text-blue-600">
                                                    ${typeof resultado.facturaData.data.bill.total === 'string'
                                                        ? parseFloat(resultado.facturaData.data.bill.total).toLocaleString()
                                                        : resultado.facturaData.data.bill.total.toLocaleString()}
                                                </p>
                                            </div>
                                            {resultado.facturaData.data.bill.surcharge_amount && (
                                                <div className="bg-purple-50 p-3 rounded">
                                                    <p className="text-sm font-semibold text-gray-600 mb-1">
                                                        🎁 Propina
                                                    </p>
                                                    <p className="text-xl font-bold text-purple-600">
                                                        ${typeof resultado.facturaData.data.bill.surcharge_amount === 'string'
                                                            ? parseFloat(resultado.facturaData.data.bill.surcharge_amount).toLocaleString()
                                                            : resultado.facturaData.data.bill.surcharge_amount.toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="bg-yellow-50 p-3 rounded">
                                                <p className="text-sm font-semibold text-gray-600 mb-1">
                                                    📊 Estado
                                                </p>
                                                <p className="text-lg font-semibold text-yellow-700">
                                                    {resultado.facturaData.data.bill.status === 1 ? 'Validada ✓' : 'Pendiente'}
                                                </p>
                                            </div>
                                        </div>

                                        {resultado.facturaData.data.bill.cufe && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                                    🔐 CUFE (Código Único de Factura Electrónica)
                                                </p>
                                                <div className="bg-gray-50 p-3 rounded font-mono text-xs break-all text-gray-700">
                                                    {resultado.facturaData.data.bill.cufe}
                                                </div>
                                            </div>
                                        )}

                                        {resultado.facturaData.data.bill.qr && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                                    📱 Enlace QR DIAN
                                                </p>
                                                <a
                                                    href={resultado.facturaData.data.bill.qr}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-xs break-all underline"
                                                >
                                                    {resultado.facturaData.data.bill.qr}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-gray-700 text-lg">
                                        {resultado.error}
                                    </p>
                                    {resultado.detalles && (
                                        <div className="bg-white p-4 rounded border-2 border-red-200">
                                            <p className="font-semibold text-red-700 mb-2">
                                                Detalles del error:
                                            </p>
                                            <pre className="text-xs overflow-auto text-gray-700 whitespace-pre-wrap max-h-64">
                                                {resultado.detalles}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Nota importante */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="font-semibold text-yellow-800 mb-1">
                            Logs Detallados en Terminal
                        </p>
                        <p className="text-yellow-700 text-sm">
                            Para ver información completa del proceso, revisa la terminal donde ejecutas{' '}
                            <code className="bg-yellow-100 px-2 py-0.5 rounded font-mono">
                                npm run dev
                            </code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}