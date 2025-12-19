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
        entregada: "bg-green-100 text-green-800 border-green-200",
        cancelada: "bg-red-100 text-red-800 border-red-200",
        lista: "bg-blue-100 text-blue-800 border-blue-200",
        orden_tomada: "bg-yellow-100 text-yellow-800 border-yellow-200",
        en_camino: "bg-orange-100 text-orange-800 border-orange-200",
        llegue_a_destino: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colores[estado] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const formatDate = (fecha: string): string => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    });
};