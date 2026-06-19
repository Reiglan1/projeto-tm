import { createContext, useContext, ReactNode } from "react";
import { useLayoutState, LayoutProps } from "./UseLayout";

const LayoutContext = createContext<LayoutProps | null>(null);

export const useLayout = (): LayoutProps => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout deve ser usado dentro de um LayoutProvider");
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const layoutState = useLayoutState();

  return (
    <LayoutContext.Provider value={layoutState}>
      {children}
    </LayoutContext.Provider>
  );
};
