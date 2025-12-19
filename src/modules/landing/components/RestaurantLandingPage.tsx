// app/components/RestaurantLandingPage.tsx

import Header from "./Header";
import HeroSection from "./HeroSection";
import MenuSection from "./MenuSection";
import LocationSection from "./LocationSection";
import InfoSection from "./InfoSection";
import Footer from "./Footer";


export default function RestaurantLandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />
            <HeroSection />
            <MenuSection />
            <LocationSection />
            <InfoSection />
            <Footer />
        </div>
    );
}