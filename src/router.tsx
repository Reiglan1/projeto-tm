import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { Suspense, useEffect } from "react";

import { LayoutProvider, useLayout } from "@/context/LayoutProvider";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ErrorElement from "@/components/ErrorBoundary/ErrorElement";
import { lazy } from "react";
import { ROUTES } from "./constants/Constants";
// const LoginPage = lazy(() => import("@/pages/auth/Login/Login"));
const HomeAuthPage = lazy(() => import("@/pages/auth/Home/Home"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/Home/sections/ResetPassword"));
const ProfilePage = lazy(() => import("@/pages/app/Profile/Profile"));
const VerificationPage = lazy(() => import("@/pages/app/Verification/Verification"));
const OpenServiceOrderPage = lazy(() => import("@/pages/app/OpenServiceOrder/OpenServiceOrder"));
const WorkerProfilePage = lazy(() => import("@/pages/app/WorkerProfile/WorkerProfile"));
const ClientProfilePage = lazy(() => import("@/pages/app/ClientProfile/ClientProfile"));
const MyServiceOrdersPage = lazy(() => import("@/pages/app/MyServiceOrders/MyServiceOrders"));
const ChatPage = lazy(() => import("@/pages/app/Chat/Chat"));
const PaymentPage = lazy(() => import("@/pages/app/Home/sections/Payment"));
const CategoriesPage = lazy(() => import("@/pages/app/Home/sections/Categories"));
const ProfessionalWalletPage = lazy(() => import("@/pages/app/Wallet/Wallet"));
const ClientWalletPage = lazy(() => import("@/pages/app/ClientWallet/ClientWallet"));
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

// Escuta o evento disparado pelo interceptor do axios (services/api.ts)
// quando qualquer request volta com 401. Como o axios não tem acesso ao
// contexto do React, essa é a ponte: desloga e manda pro login com um aviso.
function SessionWatcher() {
  const { logout } = useLayout();
  const navigate = useNavigate();

  useEffect(() => {
    function handleSessionExpired() {
      logout();
      navigate(`${ROUTES.LOGIN}?sessionExpired=1`, { replace: true });
    }

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [logout, navigate]);

  return null;
}

const AppLayout = () => (
  <LayoutProvider>
    <SessionWatcher />
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
                path: ROUTES.WORKER_PROFILE,
                Component: WorkerProfilePage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.CLIENT_PROFILE,
                Component: ClientProfilePage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.MY_SERVICE_ORDERS,
                Component: MyServiceOrdersPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.CHAT,
                Component: ChatPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.MESSAGES,
                Component: ChatPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.PROFESSIONAL_WALLET,
                Component: ProfessionalWalletPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.CLIENT_WALLET,
                Component: ClientWalletPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.CATEGORIES,
                Component: CategoriesPage,
                errorElement: <ErrorElement />,
              },
              {
                path: ROUTES.PAYMENT,
                Component: PaymentPage,
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
              {
                path: ROUTES.RESET_PASSWORD,
                Component: ResetPasswordPage,
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