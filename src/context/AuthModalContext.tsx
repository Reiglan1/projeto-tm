import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole } from "@/types/auth";
import LoginModal from "@/components/AuthModals/LoginModal";
import RegisterModal from "@/components/AuthModals/RegisterModal";

type ModalMode = "login" | "register" | null;

interface AuthModalContextValue {
  openLogin: (role?: UserRole) => void;
  openRegister: (role?: UserRole) => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error(
      "useAuthModal deve ser usado dentro de um AuthModalProvider"
    );
  }
  return context;
}

interface AuthModalProviderProps {
  children: ReactNode;
}

export function AuthModalProvider({ children }: AuthModalProviderProps) {
  const [mode, setMode] = useState<ModalMode>(null);
  const [defaultRole, setDefaultRole] = useState<UserRole>("client");

  function openLogin(role: UserRole = "client") {
    setDefaultRole(role);
    setMode("login");
  }

  function openRegister(role: UserRole = "client") {
    setDefaultRole(role);
    setMode("register");
  }

  function close() {
    setMode(null);
  }

  return (
    <AuthModalContext.Provider value={{ openLogin, openRegister, close }}>
      {children}

      <LoginModal
        open={mode === "login"}
        defaultRole={defaultRole}
        onClose={close}
        onSwitchToRegister={() => setMode("register")}
      />
      <RegisterModal
        open={mode === "register"}
        defaultRole={defaultRole}
        onClose={close}
        onSwitchToLogin={() => setMode("login")}
      />
    </AuthModalContext.Provider>
  );
}