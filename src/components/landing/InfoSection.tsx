// app/components/restaurant/InfoSection.tsx
import { APP_ROUTES } from '@/src/constants/app-routes';
import { CreditCard, Shield, Truck, Clock, CheckCircle } from 'lucide-react';

const services = [
    {
        icon: <Truck className="h-8 w-8" />,
        title: "Delivery Rápido",
        description: "Entregas en menos de 30 minutos en nuestra zona de cobertura"
    },
    {
        icon: <CreditCard className="h-8 w-8" />,
        title: "Múltiples Pagos",
        description: "Aceptamos efectivo, tarjetas débito/crédito y transferencias"
    },
    {
        icon: <Shield className="h-8 w-8" />,
        title: "Comida Segura",
        description: "Todos nuestros ingredientes son frescos y de la más alta calidad"
    },
    {
        icon: <Clock className="h-8 w-8" />,
        title: "24/7 Pedidos Online",
        description: "Ordena desde nuestra página web a cualquier hora"
    }
];

const steps = [
    "Elige tus platillos favoritos",
    "Personaliza tu pedido",
    "Espera la preparación",
    "Recibe y disfruta"
];

export default function InfoSection() {
    return (
        <section id="contacto" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        ¿Cómo funciona?
                    </h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                        Sigue estos simples pasos para disfrutar de nuestra comida
                    </p>
                </div>

                {/* Pasos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center h-full">
                                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                                    {index + 1}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{step}</h3>
                                <div className="flex items-center justify-center text-orange-500">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Servicios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors"
                        >
                            <div className="text-orange-500 mb-4">
                                {service.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                            <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                    ))}
                </div>

                {/* CTA Final */}
                <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-sm">
                    <div className="text-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                            ¿Qué estás esperando para ordenar?
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Únete a miles de clientes satisfechos que disfrutan de nuestra comida
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <a
                                href={APP_ROUTES.PUBLIC.DOMICILIO.PEDIDOS}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                            >
                                🚚 Pedir a Domicilio
                            </a>
                            <a
                                href={APP_ROUTES.PUBLIC.ESTABLECIMIENTO}
                                className="bg-white text-gray-800 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-bold transition-all border-2 border-gray-300 hover:border-gray-400"
                            >
                                🏪 Pedir en Local
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}