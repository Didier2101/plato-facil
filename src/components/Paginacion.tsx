"use client";

interface Props {
    pagina: number;
    setPagina: (n: number) => void;
    totalPaginas: number;
    itemsPorPagina: number;
    setItemsPorPagina: (n: number) => void;
}

export default function Paginacion({
    pagina,
    setPagina,
    totalPaginas,
    itemsPorPagina,
    setItemsPorPagina,
}: Props) {
    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow ">
            {/* Items por página */}
            <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Mostrar:</label>
                <select
                    value={itemsPorPagina}
                    onChange={(e) => {
                        setItemsPorPagina(Number(e.target.value));
                        setPagina(1); // reset al cambiar
                    }}
                    className="rounded px-2 py-1 text-sm"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                </select>
            </div>

            {/* Navegación */}
            <div className="flex items-center space-x-2">
                <button
                    disabled={pagina === 1}
                    onClick={() => setPagina(pagina - 1)}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                >
                    ◀
                </button>
                <span className="text-sm">
                    Página {pagina} de {totalPaginas}
                </span>
                <button
                    disabled={pagina === totalPaginas}
                    onClick={() => setPagina(pagina + 1)}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
