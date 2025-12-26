// app/components/RestaurantLandingPage.tsx

import Header from "./Header";
import HeroSection from "./HeroSection";
import MenuSection from "./MenuSection";
import LocationSection from "./LocationSection";
import InfoSection from "./InfoSection";
import Footer from "./Footer";
import { obtenerConfiguracionRestaurante } from "../../../modules/dueno/configuraciones/actions/configuracionRestauranteActions";
import { obtenerProductosAction } from "../../admin/productos/actions/obtenerProductosAction";
import { obtenerCategoriasAction } from "../../admin/productos/actions/obtenerCategoriasAction";


export default async function RestaurantLandingPage() {
    const [
        { configuracion },
        { productos },
        { categorias }
    ] = await Promise.all([
        obtenerConfiguracionRestaurante(),
        obtenerProductosAction(),
        obtenerCategoriasAction({ soloActivas: true })
    ]);

    return (
        <div className="min-h-screen bg-white">
            <Header config={configuracion} />
            <HeroSection config={configuracion} />
            <MenuSection
                initialProducts={productos || []}
                initialCategories={categorias || []}
            />
            <LocationSection config={configuracion} />
            <InfoSection config={configuracion} />
            <Footer config={configuracion} />
        </div>
    );
}