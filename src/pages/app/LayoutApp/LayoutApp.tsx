import { Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
const HeaderApp = lazy(() => import("@/components/HeaderApp/HeaderApp"));
const FooterApp = lazy(() => import("@/components/FooterApp/FooterApp"));
const LoadingComponent = lazy(() => import("@/components/Loading/Loading"));

export default function LayoutAFooterApp() {
    return (
        <>
            <HeaderApp />
            <main className="flex flex-col flex-1">
                <Suspense fallback={<LoadingComponent />}>
                    <Outlet />
                </Suspense>
            </main>
            <FooterApp />
        </>
    )
}