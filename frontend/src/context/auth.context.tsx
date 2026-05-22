import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { Flex, Spinner } from "@radix-ui/themes";
import { useActiveSession, useLoginMutation, useRegisterMutation } from '../hooks';
import type { LoginCredentials, User } from "../types";

const AUTH_USER_STORAGE_KEY = "finance-webapp.auth-user";

type AuthContextType = {
  user: User | null;
  loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
    register: (email: string, password: string, fname: string, lname: string) => Promise<boolean>;
  error: string | null;
};

type Prop = {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType>({} as  AuthContextType);

type AuthPayload<T> = {
    code: number;
    message: string;
    data?: T;
};

const isUser = (value: unknown): value is User => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return 'id' in value && 'fname' in value && 'email' in value;
};

const unwrapUser = (response: unknown): User | null => {
    if (!response || typeof response !== 'object') {
        return null;
    }

    if (isUser(response)) {
        return response;
    }

    const outerData = (response as { data?: unknown }).data;
    if (isUser(outerData)) {
        return outerData;
    }

    return null;
};

const unwrapAuthPayload = (response: unknown): AuthPayload<User> | null => {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const direct = response as Partial<AuthPayload<User>> & { data?: unknown };
    if (typeof direct.code === 'number') {
        return {
            code: direct.code,
            message: typeof direct.message === 'string' ? direct.message : '',
            data: isUser(direct.data) ? direct.data : undefined,
        };
    }

    const nested = direct.data as Partial<AuthPayload<User>> | undefined;
    if (nested && typeof nested.code === 'number') {
        return {
            code: nested.code,
            message: typeof nested.message === 'string' ? nested.message : '',
            data: isUser(nested.data) ? nested.data : undefined,
        };
    }

    return null;
};

const readStoredUser = (): User | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    const storedValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!storedValue) {
        return null;
    }

    try {
        const parsedValue = JSON.parse(storedValue) as unknown;
        return unwrapUser(parsedValue);
    } catch {
        window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        return null;
    }
};

const persistUser = (nextUser: User | null) => {
    if (typeof window === 'undefined') {
        return;
    }

    if (nextUser) {
        window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
        return;
    }

    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export const AuthProvider = ({ children }: Prop) => {
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(() => readStoredUser());

    const { data: checkData, isPending: checkingActive } = useActiveSession();
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const isBusy = checkingActive || loginMutation.isPending || registerMutation.isPending;

    /*
    const checkActive = useCallback( async () => {
        setIsReady(false)
        const dest = searchParams.get("dest");
        const data = await checkActiveSessionApi()
        console.log("Active session check response:", data);
        if (data.code === 201)
        {
            setUser(data.data)
            return true
        }
        navagate("/auth") 
        setUser(null)
        return false
    }, [location])
    */

    useEffect(() => {
        if (checkingActive) {
            return;
        }
        const activeUser = unwrapUser(checkData);
        if (activeUser) {
            setUser(activeUser);
            persistUser(activeUser);
        }
    }, [checkingActive, checkData]);


    const loginUser = useCallback(async (email: string, password: string) => {
        setError(null);

        try {
            const response = await loginMutation.mutateAsync({ email, password } as LoginCredentials);
            const authResult = unwrapAuthPayload(response);

            if (authResult && authResult.data && authResult.code >= 200 && authResult.code < 300) {
                setUser(authResult.data);
                persistUser(authResult.data);
                return true;
            }

            setUser(null);
            persistUser(null);
            setError(authResult?.message || 'Login failed');
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            return false;
        }
    }, [loginMutation])

    const logoutUser = useCallback(() => {
        setUser(null)
        persistUser(null)
        setError(null)
    }, [])

    const registerUser = useCallback(async (email: string, password: string, fname: string, lname: string) => {
        setError(null);

        try {
            const response = await registerMutation.mutateAsync({ email, password, fname, lname, mname: '' });
            const authResult = unwrapAuthPayload(response);

            if (authResult && authResult.data && authResult.code >= 200 && authResult.code < 300) {
                setUser(authResult.data);
                persistUser(authResult.data);
                return true;
            }

            setUser(null);
            persistUser(null);
            setError(authResult?.message || 'Registration failed');
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            return false;
        }

    }, [registerMutation])



    const contextValue = useMemo(() => ({
        user,
        loading: isBusy,
        login: loginUser,
        logout: logoutUser,
        register: registerUser,
        error
    }), [user, isBusy, loginUser, logoutUser, registerUser, error]);

    if (isBusy){
        return <Flex className="w-full h-full" align="center" justify={"center"}><Spinner></Spinner></Flex>
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

