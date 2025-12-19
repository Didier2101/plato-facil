"use client";

import React from "react";
import type { OrdenCompleta } from "@/src/modules/admin/ordenes/types/orden";
import type { ConfiguracionRestaurante } from "@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions";

interface Props {
    orden: OrdenCompleta;
    config: ConfiguracionRestaurante | null;
}

export default function GeneradorRecibo({ orden, config }: Props) {
    const formatearPrecio = (valor: number) => {
        return `$${valor.toLocaleString("es-CO")}`;
    };

    const subtotal = Number(orden.subtotal_productos || 0);
    const domicilio = Number(orden.costo_domicilio || 0);
    const total = subtotal + domicilio;

    return (
        <div id="recibo-pdf" className="hidden print:block p-8 bg-white text-black font-mono text-sm max-w-[80mm] mx-auto border border-gray-100">
            <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-4">
                <h1 className="text-xl font-bold uppercase">{config?.nombre_restaurante || "KAVVO"}</h1>
                <p>{config?.direccion_completa}</p>
                <p>Tel: {config?.telefono}</p>
                <p className="mt-2 text-xs">{new Date(orden.created_at).toLocaleString('es-CO')}</p>
            </div>

            <div className="mb-4">
                <p className="font-bold">ORDEN #{orden.id.slice(-6).toUpperCase()}</p>
                <p>Cliente: {orden.cliente_nombre}</p>
                <p>Tipo: {orden.tipo_orden.toUpperCase()}</p>
            </div>

            <table className="w-full mb-4 border-b border-dashed border-gray-300 pb-4">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-1">Cant</th>
                        <th className="text-left py-1">Producto</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orden.orden_detalles?.map((detalle, index) => (
                        <tr key={index} className="align-top">
                            <td className="py-1">{detalle.cantidad}</td>
                            <td className="py-1">
                                <div>{detalle.producto_nombre}</div>
                                {detalle.orden_personalizaciones?.filter(p => !p.incluido).map((p, i) => (
                                    <div key={i} className="text-xs text-gray-600 ml-1">- Sin {p.ingrediente_nombre}</div>
                                ))}
                                {detalle.notas_personalizacion && (
                                    <div className="text-xs italic text-gray-500 ml-1">Nota: {detalle.notas_personalizacion}</div>
                                )}
                            </td>
                            <td className="text-right py-1">{formatearPrecio(detalle.subtotal)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="space-y-1 mb-6">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatearPrecio(subtotal)}</span>
                </div>
                {domicilio > 0 && (
                    <div className="flex justify-between">
                        <span>Domicilio:</span>
                        <span>{formatearPrecio(domicilio)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-900 mt-2">
                    <span>TOTAL:</span>
                    <span>{formatearPrecio(orden.total_final || total)}</span>
                </div>
            </div>

            <div className="text-center text-xs mt-8 border-t border-dashed border-gray-300 pt-4">
                <p>¡Gracias por su compra!</p>
                <p>Software de Gestión Kavvo</p>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #recibo-pdf, #recibo-pdf * {
            visibility: visible;
          }
          #recibo-pdf {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
        }
      `}</style>
        </div>
    );
}
