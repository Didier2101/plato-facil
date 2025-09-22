"use client";

interface LoadingProps {
    texto?: string;
    tamaño?: "pequeño" | "mediano" | "grande";
    tipo?: "spinner" | "puntos" | "esqueleto";
}

export default function Loading({
    texto = "Cargando...",
    tamaño = "mediano",
    tipo = "spinner"
}: LoadingProps) {
    const tamaños = {
        pequeño: "h-6 w-6",
        mediano: "h-12 w-12",
        grande: "h-16 w-16"
    };

    const textos = {
        pequeño: "text-sm",
        mediano: "text-base",
        grande: "text-lg"
    };

    if (tipo === "esqueleto") {
        return (
            <div className="animate-pulse space-y-4">
                <div className="bg-gray-200 rounded-lg h-8"></div>
                <div className="bg-gray-200 rounded-lg h-4"></div>
                <div className="bg-gray-200 rounded-lg h-4 w-3/4"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            {tipo === "spinner" ? (
                <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${tamaños[tamaño]}`}></div>
            ) : (
                <div className="flex space-x-2">
                    <div className="animate-bounce h-3 w-3 bg-blue-600 rounded-full"></div>
                    <div className="animate-bounce h-3 w-3 bg-blue-600 rounded-full" style={{ animationDelay: "0.1s" }}></div>
                    <div className="animate-bounce h-3 w-3 bg-blue-600 rounded-full" style={{ animationDelay: "0.2s" }}></div>
                </div>
            )}
            <p className={`text-gray-600 ${textos[tamaño]}`}>{texto}</p>
        </div>
    );
}