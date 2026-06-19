import { useState } from "react";

export interface LayoutProps {
    token?: string;
    user?: any;
    fullLoading: boolean;
    cardState: CardStateProps;
    setToken: (value: string) => void;
    setUser: (user: any) => void;
    setFullLoading: (value: boolean) => void;
    login: (token: string) => void;
    logout: () => void;
    setCardState: (value: any) => void;
}
interface CardStateProps {
    step: number;
    documentId: string;
    userDocumentId: string;
}

export const useLayoutState = (): LayoutProps => {
    const [fullLoading, setFullLoading] = useState(false);
    const [token, setToken] = useState<string | undefined>(
        typeof window !== "undefined"
            ? window.localStorage?.getItem("token") || undefined
            : undefined
    );
    const [user, setUser] = useState();
    const [cardState, setCardState] = useState<CardStateProps>({
        step: 0,
        documentId: "",
        userDocumentId: "",
    });

    const login = (token: string) => {
        if (typeof window !== "undefined") {
            window.localStorage?.setItem("token", token);
        }
        setToken(token);
    };

    const logout = () => {
        if (typeof window !== "undefined") {
            window.localStorage?.removeItem("token");
        }
        setToken(undefined);
    };

    return {
        token,
        user,
        fullLoading,
        cardState,
        setToken,
        setUser,
        setFullLoading,
        login,
        logout,
        setCardState,
    };
};
