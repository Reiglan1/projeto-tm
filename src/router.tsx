import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Suspense } from "react";

import { LayoutProvider, useLayout } from "@/context/LayoutProvider";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorElement from "@/components/ErrorBoundary/ErrorElement";
import { lazy } from "react";
import { ROUTES } from "./constants/Constants";
// const LoginPage = lazy(() => import("@/pages/auth/Login/Login"));
const HomeAuthPage = lazy(() => import("@/pages/auth/Home/Home"));
const ProfilePage = lazy(() => import("@/pages/app/Profile/Profile"));
const VerificationPage = lazy(() => import("@/pages/app/Verification/Verification"));
const OpenServiceOrderPage = lazy(() => import("@/pages/app/OpenServiceOrder/OpenServiceOrder"));
const MyServiceOrdersPage = lazy(() => import("@/pages/app/MyServiceOrders/MyServiceOrders"));
const WalletPage = lazy(() => import("@/pages/app/Wallet/Wallet"));
const HomePage = lazy(() => import("@/pages/app/Home/Home"));
const LayoutAuth = lazy(() => import("@/pages/auth/LayoutAuth/LayoutAuth"));
const LayoutApp = lazy(() => import("@/pages/app/LayoutApp/LayoutApp"));

const LoadingComponent = lazy(() => import("@/components/Loading/Loading"));

function ProtectedLoader() {
  const { token } = useLayout();

  if (token) {
    return <Outlet />;
  }

  const currentUrl = typeof window !== "undefined" ? window.location : null;
  if (!currentUrl) {
    return <Navigate to={ROUTES.LOGIN} replace={true} />;
  }

  const currentPath = currentUrl.pathname;
  const redirectParam =
    currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";

  return <Navigate to={`${ROUTES.LOGIN}${redirectParam}`} replace={true} />;
}

function AuthLoader() {
  const { token } = useLayout();

  // Se não tem token, permite acesso às páginas de auth
  if (!token) {
    return <Outlet />;
  }

  // Se tem token, redireciona para a página inicial
  return <Navigate to="/" replace={true} />;
}

const AppLayout = () => (
  <LayoutProvider>
    <Suspense fallback={<LoadingComponent />}>
      <Outlet />
    </Suspense>
  </LayoutProvider>
);

const RouterConfig = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    errorElement: <ErrorElement />,
    children: [
      /*
       * Páginas logadas
       */
      {
        path: "/",
        Component: ProtectedLoader,
        errorElement: <ErrorElement />,
        children: [
          {
            path: "/",
            Component: LayoutApp,
            errorElement: <ErrorElement />,
            children: [
              {
                path: ROUTES.HOME,
                Component: HomePage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.PROFILE,
                Component: ProfilePage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.VERIFICATION,
                Component: VerificationPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.OPEN_SERVICE_ORDER,
                Component: OpenServiceOrderPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.MY_SERVICE_ORDERS,
                Component: MyServiceOrdersPage,
                errorElement: <ErrorElement />,
              },
               {
                path: ROUTES.WALLET,
                Component: WalletPage,
                errorElement: <ErrorElement />,
              },
            ],
          },
        ],
      },
      /*
       * Páginas que não estão logadas
       */
      {
        path: "/",
        Component: AuthLoader,
        errorElement: <ErrorElement />,
        children: [
          {
            Component: LayoutAuth,
            errorElement: <ErrorElement />,
            children: [
              {
                path: ROUTES.LOGIN,
                Component: HomeAuthPage,
                errorElement: <ErrorElement />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default function Router() {
  return (
    <ErrorBoundary>
      <RouterProvider
        router={RouterConfig}
        fallbackElement={<LoadingComponent />}
      />
    </ErrorBoundary>
  );
}
