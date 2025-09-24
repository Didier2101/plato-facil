"use client";

import FormAgregarProducto from "@/src/components/admin/productos/FormAgregarProducto";
import ProductosLista from "@/src/components/admin/productos/ProductosLista";
import { useState } from "react";
import { FaUtensils, FaPlus, FaList } from "react-icons/fa";

export default function ProductosPage() {
    const [activeTab, setActiveTab] = useState<"lista" | "crear">("lista");

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg">
                        <FaUtensils className="text-white text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Productos</h1>
                        <p className="text-gray-600">Administra tu menú de delivery</p>
                    </div>
                </div>
            </div>

            {/* Tabs estilo delivery */}
            <div className=" p-6">
                <div className="flex ">
                    <button
                        onClick={() => setActiveTab("lista")}
                        className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === "lista"
                            ? "bg-white text-orange-600 shadow-md transform scale-105"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        <FaList className="text-lg" />
                        <span>Lista</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("crear")}
                        className={`flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === "crear"
                            ? "bg-white text-orange-600 shadow-md transform scale-105"
                            : "text-gray-600 hover:text-gray-800"
                            }`}
                    >
                        <FaPlus className="text-lg" />
                        <span>Crear</span>
                    </button>
                </div>
            </div>


            {/* Contenido */}


            <div>
                {activeTab === "lista" && <ProductosLista />}
                {activeTab === "crear" && <FormAgregarProducto />}
            </div>


            {/* Floating Action Button para móvil */}
            <div className="lg:hidden fixed bottom-6 right-6">
                <button
                    onClick={() => setActiveTab("crear")}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
                >
                    <FaPlus className="text-xl" />
                </button>
            </div>
        </div>
    );
}