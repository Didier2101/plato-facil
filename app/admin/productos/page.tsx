"use client";

import FormAgregarProducto from "@/src/components/admin/productos/FormAgregarProducto";
import ProductosLista from "@/src/components/admin/productos/ProductosLista";
import { useState } from "react";

export default function ProductosPage() {
    const [activeTab, setActiveTab] = useState<"lista" | "crear">("lista");

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">Gestión de Productos</h2>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("lista")}
                    className={`px-4 py-2 -mb-px border-b-2 font-medium ${activeTab === "lista"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Lista de Productos
                </button>
                <button
                    onClick={() => setActiveTab("crear")}
                    className={`px-4 py-2 -mb-px border-b-2 font-medium ${activeTab === "crear"
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Crear Producto
                </button>
            </div>

            {/* Contenido */}
            <div>
                {activeTab === "lista" && <ProductosLista />}
                {activeTab === "crear" && <FormAgregarProducto />}
            </div>
        </div>
    );
}
