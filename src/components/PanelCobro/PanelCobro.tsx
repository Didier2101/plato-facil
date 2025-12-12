"use client";


import { Truck, User, Phone } from 'lucide-react';
// Hooks personalizados
import { usePropinaLogic } from './hooks/usePropinaLogic';
import { useFacturacionLogic } from './hooks/useFacturacionLogic';
import { useCobroProcess } from './hooks/useCobroProcess';

// Componentes
import { ResumenTotales } from './components/ResumenTotales';
import { SelectorComprobante } from './components/SelectorComprobante';
import { SelectorPropina } from './components/SelectorPropina';
import { SelectorMetodoPago } from './components/SelectorMetodoPago';
import { BotonConfirmarCobro } from './components/BotonConfirmarCobro';

// Types y Utils
import { PropsPanelCobro } from './types/cobro';
import { calcularTotales } from './utils/calculosCobro';
import { validarCobroCompleto } from './utils/validacionesCobro';

/**
 * Componente principal para el proceso de cobro de órdenes
 * Coordina todos los subcomponentes y hooks para manejar el flujo completo de cobro
 * Incluye selección de método de pago, propina, comprobantes y confirmación
 */
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
}: PropsPanelCobro) {
  // Determinar si es orden de establecimiento para mostrar opciones de comprobante
  const esOrdenEstablecimiento = ordenSeleccionada.tipo_orden === "establecimiento";

  // Calcular todos los totales necesarios
  const { totalConPropina } = calcularTotales(ordenSeleccionada, propina);

  // Inicializar hooks personalizados
  const propinaLogic = usePropinaLogic({
    subtotalProductos: Number(ordenSeleccionada.subtotal_productos || 0),
    propina,
    setPropina,
    propinaPorcentaje,
    setPropinaPorcentaje,
  });

  const facturacionLogic = useFacturacionLogic();

  const cobroProcess = useCobroProcess({
    usuarioId,
    metodoPago,
    esOrdenEstablecimiento,
    tipoComprobante: facturacionLogic.tipoComprobante,
    datosFacturacionCompletos: facturacionLogic.datosFacturacionCompletos,
    ordenSeleccionada,
    datosFacturacion: facturacionLogic.datosFacturacion,
    propina,
    onSuccess,
    onRecargarOrdenes,
  });

  // Validar si el botón de cobro debe estar habilitado
  const cobroHabilitado = validarCobroCompleto(
    metodoPago,
    facturacionLogic.tipoComprobante,
    facturacionLogic.datosFacturacionCompletos
  );

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        <div className=" space-y-6">
          {/* Información del cliente */}
          <div

          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-1.5 rounded-lg">
                <User className="h-4 w-4 text-gray-600" />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-gray-900 text-md uppercase">
                  {ordenSeleccionada.cliente_nombre}
                </h3>
                {ordenSeleccionada.cliente_telefono && (
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      {ordenSeleccionada.cliente_telefono}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de totales */}
          <div

          >
            <ResumenTotales
              orden={ordenSeleccionada}
              propina={propina}
            />
          </div>

          {/* Selector de comprobante (solo para establecimiento) */}
          {esOrdenEstablecimiento && (
            <div

            >
              <SelectorComprobante
                tipoComprobante={facturacionLogic.tipoComprobante}
                datosFacturacion={facturacionLogic.datosFacturacion}
                onTipoComprobanteChange={facturacionLogic.setTipoComprobante}
                onDatosFacturacionChange={facturacionLogic.setDatosFacturacion}
                datosFacturacionCompletos={facturacionLogic.datosFacturacionCompletos}
              />
            </div>
          )}


          <SelectorPropina propinaLogic={propinaLogic} />


          {/* Selector de método de pago */}

          <SelectorMetodoPago
            metodoPago={metodoPago}
            onMetodoPagoChange={setMetodoPago}
          />


          {/* Información adicional para órdenes de domicilio */}
          {!esOrdenEstablecimiento && (
            <div

              className="p-4 bg-gray-50 border border-gray-300 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 p-2 rounded-lg">
                  <Truck className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    Orden de Domicilio
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Se marcará como entregada automáticamente después del cobro.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer fijo con botón de cobro */}
      <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-white">
        <div

        >
          <BotonConfirmarCobro
            cobroProcess={cobroProcess}
            totalConPropina={totalConPropina}
            disabled={!cobroHabilitado}
          />
        </div>
      </div>
    </div>
  );
}