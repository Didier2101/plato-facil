import DomiciliosLayout from "@/src/shared/layouts/DomiciliosLayoutClient";
import { obtenerConfiguracionRestaurante } from "@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const { configuracion } = await obtenerConfiguracionRestaurante();
    return <DomiciliosLayout config={configuracion}>{children}</DomiciliosLayout>;
}
