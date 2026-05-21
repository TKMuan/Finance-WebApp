import { Outlet, Navigate, useLocation} from "react-router-dom"
import { Spinner } from "@radix-ui/themes"

import { useAuth } from "../hooks"
export const ProtectedRoutes = () => {

    const location = useLocation()
    const { user, loading} = useAuth()
    
    const path = new URLSearchParams({"from": location.pathname})
    if (loading){
        return <Spinner/>
    }

    console.log("user at protected route: ", user)
    console.log("reached from: ", path)
    return (!loading && user?.id ? <Outlet/> : <Navigate to={`/auth?${path}`} replace={true}/>)
}
