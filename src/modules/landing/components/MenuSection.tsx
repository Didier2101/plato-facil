"use client";
import { useState, useMemo } from 'react';
import { Star, ShoppingBag, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { ProductoFrontend, CategoriaFrontend } from '../../admin/productos/types/producto';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import Link from 'next/link';

interface MenuSectionProps {
    initialProducts: ProductoFrontend[];
    initialCategories: CategoriaFrontend[];
}

export default function MenuSection({ initialProducts, initialCategories }: MenuSectionProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Categorías con opción "Todas"
    const categories = useMemo(() => [
        { id: "all", nombre: "Todos" },
        ...initialCategories
    ], [initialCategories]);

    // Filtrado de productos
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(product => {
            const matchesCategory = selectedCategory === "all" || product.categoria_id === selectedCategory;
            const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch && product.activo;
        });
    }, [initialProducts, selectedCategory, searchQuery]);

    return (
        <section id="menu" className="py-24 bg-gray-50/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-50/30 rounded-full blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center space-x-2 bg-orange-100/50 px-4 py-2 rounded-2xl mb-4"
                        >
                            <ShoppingBag className="h-4 w-4 text-orange-600" />
                            <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Nuestro Menú</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
                            Explora nuestras <span className="text-orange-500">Delicias</span>
                        </h2>
                        <p className="text-lg text-gray-600 font-medium">
                            Preparados al momento con los ingredientes más frescos.
                        </p>
                    </div>

                    {/* Buscador minimalista */}
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar en el menú..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-transparent focus:border-orange-500/20 py-4 pl-12 pr-6 rounded-[2rem] shadow-xl shadow-gray-200/50 outline-none transition-all font-bold text-gray-900"
                        />
                    </div>
                </div>

                {/* Categorías (Filtros de App) */}
                <div className="flex overflow-x-auto pb-8 mb-8 no-scrollbar scroll-smooth">
                    <div className="flex space-x-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`whitespace-nowrap px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-300 shadow-lg ${selectedCategory === category.id
                                    ? 'bg-orange-500 text-white shadow-orange-200 ring-4 ring-orange-50'
                                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 shadow-gray-100'
                                    }`}
                            >
                                {category.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Productos Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-orange-200 transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Imagen con Aspect Ratio de App */}
                                <div className="h-56 relative overflow-hidden bg-gray-100">
                                    {item.imagen_url ? (
                                        <Image
                                            src={item.imagen_url}
                                            alt={item.nombre}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                            <ShoppingBag className="h-12 w-12 text-orange-200" />
                                        </div>
                                    )}

                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
                                            {item.categoria}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <div className="flex items-center bg-gray-900/80 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg border border-white/20">
                                            <Star className="h-3 w-3 text-orange-500 fill-current" />
                                            <span className="ml-1.5 text-[10px] font-black text-white">4.8</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">
                                        {item.nombre}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed h-[40px]">
                                        {item.descripcion || "Disfruta de nuestra preparación artesanal con ingredientes premium."}
                                    </p>

                                    <div className="mt-auto flex items-center justify-between gap-4">
                                        <div className="text-2xl font-black text-gray-900 tracking-tighter">
                                            ${item.precio?.toLocaleString()}
                                            <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-widest leading-none mt-1">Precio Final</span>
                                        </div>
                                        <Link
                                            href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                                            className="bg-gray-900 hover:bg-orange-500 text-white p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-orange-200 group/btn"
                                        >
                                            <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-gray-900">No encontramos productos</h3>
                        <p className="text-gray-500 font-medium">Intenta con otra categoría o término de búsqueda.</p>
                    </div>
                )}

                {/* CTA Ver menú completo (Redirige a la página de pedidos) */}
                <div className="text-center mt-20">
                    <Link
                        href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                        className="inline-flex items-center space-x-3 bg-white border-4 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-5 rounded-[2.5rem] text-xl font-black transition-all duration-300 shadow-2xl shadow-gray-200"
                    >
                        <span>Hacer un Pedido Ahora</span>
                        <ChevronRight className="h-6 w-6" />
                    </Link>
                </div>
            </div>
        </section>
    );
}