import { useState } from "react";
import { AuthenticatedUser } from "@/types/auth";

export interface LayoutProps {
    token?: string;
    user?: AuthenticatedUser;
    fullLoading: boolean;
    cardState: CardStateProps;
    setToken: (value: string) => void;
    setUser: (user: AuthenticatedUser | undefined) => void;
    setFullLoading: (value: boolean) => void;
    login: (token: string, user?: AuthenticatedUser) => void;
    logout: () => void;
    setCardState: (value: any) => void;
}
interface CardStateProps {
    step: number;
    documentId: string;
    userDocumentId: string;
}

function readStoredUser(): AuthenticatedUser | undefined {
    if (typeof window === "undefined") return undefined;
    const raw = window.localStorage?.getItem("user");
    if (!raw) return undefined;
    try {
        return JSON.parse(raw) as AuthenticatedUser;
    } catch {
        return undefined;
    }
}

export const useLayoutState = (): LayoutProps => {
    const [fullLoading, setFullLoading] = useState(false);
    const [token, setToken] = useState<string | undefined>(
        typeof window !== "undefined"
            ? window.localStorage?.getItem("token") || undefined
            : undefined
    );
    const [user, setUserState] = useState<AuthenticatedUser | undefined>(readStoredUser());
    const [cardState, setCardState] = useState<CardStateProps>({
        step: 0,
        documentId: "",
        userDocumentId: "",
    });

    const setUser = (value: AuthenticatedUser | undefined) => {
        if (typeof window !== "undefined") {
            if (value) {
                window.localStorage?.setItem("user", JSON.stringify(value));
            } else {
                window.localStorage?.removeItem("user");
            }
        }
        setUserState(value);
    };

    const login = (token: string, user?: AuthenticatedUser) => {
        if (typeof window !== "undefined") {
            window.localStorage?.setItem("token", token);
        }
        setToken(token);
        if (user) {
            setUser(user);
        }
    };

    const logout = () => {
        if (typeof window !== "undefined") {
            window.localStorage?.removeItem("token");
            window.localStorage?.removeItem("user");
        }
        setToken(undefined);
        setUserState(undefined);
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
