import React, { createContext, useCallback, useEffect, useContext, useState } from "react";
import { checkActiveSessionApi, loginApi, logoutApi, registerApi } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string, fname: string, lname: string) => void;
  active: () => Promise<boolean>;
  error: string | null;
};


type Prop = {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType>({} as  AuthContextType);

export const AuthProvider = ({ children }: Prop) => {
    const navagate = useNavigate();
    const [searchParams] = useSearchParams();  
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isReady, setIsReady] = useState(false);  

    const checkActive = useCallback( async () => {
        setIsReady(false)
        const data = await checkActiveSessionApi()
        console.log("Active session check response:", data);
        if (data.code === 201)
        {
            setUser(data.data)
            setIsReady(true)
            return true
        }
        
        navagate("/auth")
        setUser(null)
        return false
    }, [])

    useEffect(() => {
        console.log("Checking active session...");
        const checkSession = async () => {
            await checkActive();
        }
        checkSession();
        console.log("Active session check complete.");
        setIsReady(true);
    }, [])

    const loginUser = useCallback(async (email: string, password: string) => {
        setError(null);
        setIsReady(false);
        const data = await loginApi(email, password);
        console.log("Login response:", data);
        if (data.code === 202){
            setUser(data.data.user);
            const dest = searchParams.get("dest") || "/dashboard";
            navagate(dest);
        }
        else {
            setUser(null);
            setError(data.message || "Login failed");
        }
        setIsReady(true);
    }, [])

    const registerUser = useCallback(async (email: string, password: string, fname: string, lname: string) => {
        setError(null);
        const data = await registerApi(email, password, fname, lname);
        console.log("Registration response:", data);
        return data;
    }, [])

    const logoutUser = useCallback(async () => {
        const data = await logoutApi();
        console.log("Logout response:", data);
        setUser(null);
        setError(null);
    }, [])

    return React.createElement(
        AuthContext.Provider,
        { value: { user, loading: !isReady, login: loginUser, logout: logoutUser, register: registerUser, active: checkActive, error: error} },
        isReady ? children : null
    );
}

