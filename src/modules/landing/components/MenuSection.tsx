// app/components/restaurant/MenuSection.tsx
import { Star, Clock } from 'lucide-react';

const featuredItems = [
    {
        id: 1,
        name: "Hamburguesa Kavvo Especial",
        description: "Carne 200g, queso, tocineta, lechuga, tomate y salsa especial",
        price: 18900,
        category: "Hamburguesas",
        imageColor: "bg-orange-50",
        time: "15-20 min"
    },
    {
        id: 2,
        name: "Pizza Familiar",
        description: "Mozzarella, pepperoni, champiñones, pimentón y salsa de tomate",
        price: 32900,
        category: "Pizzas",
        imageColor: "bg-gray-50",
        time: "25-30 min"
    },
    {
        id: 3,
        name: "Alitas BBQ",
        description: "12 alitas bañadas en salsa BBQ, papas fritas y dip de ajo",
        price: 24500,
        category: "Entradas",
        imageColor: "bg-orange-50",
        time: "20-25 min"
    },
    {
        id: 4,
        name: "Combo Familiar",
        description: "2 hamburguesas, papas grandes, 2 gaseosas y postre",
        price: 42900,
        category: "Combos",
        imageColor: "bg-gray-50",
        time: "20-30 min"
    }
];

const categories = [
    "Hamburguesas",
    "Pizzas",
    "Sandwiches",
    "Entradas",
    "Combos",
    "Bebidas",
    "Postres"
];

export default function MenuSection() {
    return (
        <section id="menu" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Nuestro Menú Destacado
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Los favoritos de nuestros clientes
                    </p>
                </div>

                {/* Categorías */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`px-5 py-2 rounded-lg font-medium transition-all text-sm ${index === 0
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Productos destacados */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                        >
                            {/* Imagen placeholder */}
                            <div className={`h-48 ${item.imageColor} relative`}>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                                        <Star className="h-4 w-4 text-orange-500 fill-current" />
                                        <span className="ml-1 text-sm font-bold text-gray-900">4.8</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                                    <div className="text-xl font-bold text-orange-600">
                                        ${item.price.toLocaleString()}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>{item.time}</span>
                                    </div>
                                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm">
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Ver menú completo */}
                <div className="text-center mt-16">
                    <button className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 rounded-lg text-lg font-semibold transition-all">
                        Ver Menú Completo →
                    </button>
                </div>
            </div>
        </section>
    );
}