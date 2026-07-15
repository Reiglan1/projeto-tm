import { Outlet, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
const HeaderApp = lazy(() => import("@/components/HeaderApp/HeaderApp"));
const FooterApp = lazy(() => import("@/components/FooterApp/FooterApp"));
const LoadingComponent = lazy(() => import("@/components/Loading/Loading"));

// Rotas de chat ocupam a tela inteira (estilo app), então o footer institucional
// não faz sentido ali — ele ficaria escondido embaixo de uma área com scroll próprio.
function isFullScreenRoute(pathname: string): boolean {
    return pathname === "/mensagens" || /^\/chamados\/[^/]+\/chat\/?$/.test(pathname);
}

export default function LayoutAFooterApp() {
    const location = useLocation();
    const hideFooter = isFullScreenRoute(location.pathname);

    return (
        <>
            <HeaderApp />
            <main className="flex flex-col flex-1">
                <Suspense fallback={<LoadingComponent />}>
                    <Outlet />
                </Suspense>
            </main>
            {!hideFooter && <FooterApp />}
        </>
    )
}