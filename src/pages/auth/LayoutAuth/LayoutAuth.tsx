import FooterAuth from "@/components/FooterAuth/FooterAuth";
import HeaderAuth from "@/components/HeaderAuth/HeaderAuth";
import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import { AuthModalProvider } from "@/context/AuthModalContext";
const LoadingComponent = lazy(() => import("@/components/Loading/Loading"));

export default function LayoutSignIn() {
    return (
        <AuthModalProvider>
            <HeaderAuth />
            <div className="flex flex-col flex-1">
                <Suspense fallback={<LoadingComponent />}>
                    <Outlet />
                </Suspense>
            </div>
            <FooterAuth />
        </AuthModalProvider>
    )
}