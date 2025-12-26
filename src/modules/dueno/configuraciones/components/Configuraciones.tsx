// src/modules/dueno/configuraciones/components/Configuraciones.tsx
'use client';

import { Settings, Save, Loader2, Sparkles, MapPin, Info, Truck } from 'lucide-react';
import Loading from '@/src/shared/components/ui/Loading';
import { ErrorState } from '@/src/shared/components';
import { useConfiguracion } from '../hooks/useConfiguracion';
import { useConfiguracionMutaciones } from '../hooks/useConfiguracionMutaciones';
import type { ConfiguracionRestaurante } from '../actions/configuracionRestauranteActions';
import EstadoServicios from './EstadoServicios';
import InformacionBasica from './InformacionBasica';
import ConfiguracionDomicilios from './ConfiguracionDomicilios';
import LocationPicker from './LocationPicker';

export default function Configuraciones() {
    const { configuracion, loading, error, setConfiguracion } = useConfiguracion();
    const { guardarConfiguracion, saving } = useConfiguracionMutaciones();

    const handleToggle = (tipo: 'domicilio' | 'establecimiento', activo: boolean) => {
        if (!configuracion) return;

        setConfiguracion({
            ...configuracion,
            [tipo === 'domicilio' ? 'domicilio_activo' : 'establecimiento_activo']: activo
        });
    };

    const handleConfigChange = (updatedConfig: ConfiguracionRestaurante) => {
        setConfiguracion(updatedConfig);
    };

    const handleLocationChange = (lat: number, lng: number) => {
        if (!configuracion) return;

        setConfiguracion({
            ...configuracion,
            latitud: lat,
            longitud: lng
        });
    };

    const handleSubmit = async () => {
        if (!configuracion) return;
        await guardarConfiguracion(configuracion);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loading
                    texto="Sincronizando ajustes..."
                    subtexto="Preparando panel de control"
                    tamaño="grande"
                />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                message={error}
                title="Error de Configuración"
                retryText="Reintentar Carga"
                onRetry={() => window.location.reload()}
            />
        );
    }

    if (!configuracion) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Premium Header */}
            <header className="bg-white border-b border-slate-100 pt-12 pb-8 px-8 md:px-12 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                            <Settings className="h-8 w-8 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                                Sistema <span className="text-orange-500 opacity-50">/</span> Ajustes
                            </h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                                Configuración Maestra del Establecimiento
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="bg-slate-900 hover:bg-orange-500 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:shadow-orange-200 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{saving ? 'Guardando...' : 'Aplicar Cambios'}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 md:px-12 py-12 space-y-16">
                {/* Global Status Section */}
                <EstadoServicios
                    domicilioActivo={configuracion.domicilio_activo}
                    establecimientoActivo={configuracion.establecimiento_activo}
                    onToggle={handleToggle}
                />

                {/* Main Configuration Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                    {/* Left Column: Basic Info & Location */}
                    <div className="space-y-16">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                                    <Info className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Información Pública</h2>
                            </div>
                            <InformacionBasica
                                configuracion={configuracion}
                                onConfigChange={handleConfigChange}
                            />
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Geolocalización</h2>
                            </div>
                            <div className="premium-card p-4 overflow-hidden">
                                <LocationPicker
                                    currentLat={configuracion.latitud}
                                    currentLng={configuracion.longitud}
                                    onLocationChange={handleLocationChange}
                                    address={configuracion.direccion_completa}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Delivery Rules */}
                    <div className="space-y-16">
                        <section className="space-y-8 h-full flex flex-col">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Logística de Entrega</h2>
                            </div>
                            <div className="flex-1">
                                <ConfiguracionDomicilios
                                    configuracion={configuracion}
                                    onConfigChange={handleConfigChange}
                                />
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
                    <div className="flex items-center gap-4">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Panel de Configuración de Alta Precisión</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Última actualización: {new Date().toLocaleDateString()}</span>
                </div>
            </main>
        </div>
    );
}