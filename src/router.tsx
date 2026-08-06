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
const HomeAuthPage = lazy(() => import("@/pages/auth/Home/HomeAuth"));

const HomePage = lazy(() => import("@/pages/app/Home/Home"));
const LayoutAuth = lazy(() => import("@/pages/auth/LayoutAuth/LayoutAuth"));
const LayoutApp = lazy(() => import("@/pages/app/LayoutApp/LayoutApp"));

const LoadingComponent = lazy(() => import("@/components/Loading/Loading"));

function ProtectedLoader() {
  const { token } = useLayout();

  if (token) {
    return <Outlet />;
  }

  // Sem token, volta para a página inicial pública
  return <Navigate to={ROUTES.HOME_AUTH} replace={true} />;
}

function AuthLoader() {
  const { token } = useLayout();

  // Se não tem token, permite acesso às páginas de auth
  if (!token) {
    return <Outlet />;
  }

  // Se tem token, redireciona para a página inicial
  return <Navigate to={ROUTES.HOME} replace={true} />;
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
        Component: ProtectedLoader,
        errorElement: <ErrorElement />,
        children: [
          {
            Component: LayoutApp,
            errorElement: <ErrorElement />,
            children: [
              {
                path: ROUTES.HOME,
                Component: HomePage,
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
        Component: AuthLoader,
        errorElement: <ErrorElement />,
        children: [
          {
            Component: LayoutAuth,
            errorElement: <ErrorElement />,
            children: [
              {
                path: ROUTES.HOME_AUTH,
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
