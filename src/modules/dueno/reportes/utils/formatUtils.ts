// src/modules/dueno/reportes/utils/formatUtils.ts
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
};

export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-CO').format(num);
};

export const getEstadoColor = (estado: string): string => {
    const colores: Record<string, string> = {
        entregada: "text-green-500 bg-green-500/10 border-green-500/20",
        cancelada: "text-red-500 bg-red-500/10 border-red-500/20",
        lista: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        orden_tomada: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
        en_camino: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        llegue_a_destino: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    };
    return colores[estado] || "text-slate-500 bg-slate-500/10 border-slate-500/20";
};

export const formatDate = (fecha: string): string => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });
};