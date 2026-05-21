import React, { createContext, useCallback, useEffect, useContext, useState } from "react";
import { checkActiveSessionApi, loginApi, logoutApi, registerApi } from "../api";
import { useLocation, useNavigate, useSearchParams} from "react-router-dom";
import { Flex, Text, Spinner } from "@radix-ui/themes";
import type { LoginCredentials, User } from "../types";
import { useQueryClient, useQuery } from "@tanstack/react-query";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string, fname: string, lname: string) => void;
  error: string | null;
};

type Prop = {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType>({} as  AuthContextType);

export const AuthProvider = ({ children }: Prop) => {
    const queryClient = useQueryClient()
    const location = useLocation();
    const [searchParams] = useSearchParams();  

    const navagate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isReady, setIsReady] = useState(false);  
    const [checkingActive, setCheckingActive] = useState(false)


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


    const checkActive = useCallback(async () => {
        if (checkingActive){
            return
        }
        setCheckingActive(true)

        if (user !== null){
            setCheckingActive(false)
            setIsReady(true);
            return
        }
        const activeStatus = await checkActiveSessionApi();
        if (activeStatus.code == 201) {
            setUser(activeStatus.data)
            console.log("Updating user")
        }
        console.log("activeStatus: ", activeStatus)
        setCheckingActive(false)
        setIsReady(true)
    }, [])

    useEffect(() => {
        checkActive();
    }, [navagate])

    useEffect(() => {
        console.log("updated user: ", user)
    }, [user])

    const loginUser = useCallback(async (email: string, password: string) => {
        setIsReady(false)
        setError("")
        const result = await loginApi(email, password);
        if (result.code == 202)
        {
            setUser(result.data)
        }
        else
        {
            setError(result.message)
        }
        setIsReady(true)
    }, [])

    const logoutUser = () => {

    }
    const registerUser = () => {

    }


    if (!isReady || checkingActive){
        return <Flex className="w-full h-full" align="center" justify={"center"}><Spinner></Spinner></Flex>
    }
    return (
        <AuthContext.Provider value={{
            user: user,
            loading: !isReady,
            login: loginUser,
            logout: logoutUser,
            register: registerUser,
            error: error
        }
        }>
            {isReady? children: <Text>Loading</Text>}</AuthContext.Provider>
    )
    return React.createElement(
        AuthContext.Provider,
        { value: { user, loading: !isReady, login: loginUser, logout: logoutUser, register: registerUser, error: error} },
        children
    );
}

