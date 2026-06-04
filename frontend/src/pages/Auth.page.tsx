import { Link, Flex, Text, Button, Card } from '@radix-ui/themes'
import { useState } from 'react'
import type { CreateUserInput, LoginCredentials } from '../types'
import { useAuth } from '../hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface RegisterError{
    fname: string,
    email: string,
    password: string
}

type LoginError = Omit<RegisterError, 'fname'>


export const AuthPage = () => {

    const { login, register, error, loading} = useAuth()

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [RegError, setRegError] = useState<RegisterError >({email: "", password: "", fname: ""} as RegisterError)
    const [LoginError, setLoginError] = useState<LoginError >({email: "", password: ""} as LoginError)

    const [mode, setmode] = useState<boolean>(true)

    const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({email: "", password: ""})

    const [newCredentials, setNewCredentials] = useState<CreateUserInput>({email: "", password: "", fname: "", lname: "", mname: ""})

    const onSubmitLogin = async (credentials: LoginCredentials) => {
        const email = credentials.email.trim()
        const password = credentials.password
        const nextErrors: LoginError = { email: "", password: "" }

        if (!email){
            nextErrors.email = "Email is required"
        }
        if (!password){
            nextErrors.password = "Password is required"
        }

        setLoginError(nextErrors)

        if (nextErrors.email || nextErrors.password){
            return
        }

        const success = await login(email, password)
        if (success){
            navigate(searchParams.get('from')||"/dashboard", {"replace": true})
        }
    }

    const onSubmitRegister = async (credentials: CreateUserInput) => {
        const email = credentials.email.trim()
        const fname = credentials.fname.trim()
        const lname = credentials.lname.trim()
        const password = credentials.password
        const nextErrors: RegisterError = { fname: "", email: "", password: "" }

        if (!fname){
            nextErrors.fname = "First name is required"
        }
        if (!email){
            nextErrors.email = "Email is required"
        }
        if (!password){
            nextErrors.password = "Password is required"
        }

        setRegError(nextErrors)

        if (nextErrors.email || nextErrors.password || nextErrors.fname){
            return
        }

        const success = await register(email, password, fname, lname)
        if (success){
            navigate(searchParams.get('from')||"/dashboard", {"replace": true})
        }
    }

    if (loading){
        return (
            <div className="app-auth-shell">
                <p className="app-title">Loading...</p>
            </div>
        )
    }

    return (
        <div className="app-page app-auth-shell">
            <Card className="app-auth-card">
                <Flex direction="column" gap="4" p="5" className="app-form-stack">
                    {
                        mode ? (
                            <Flex direction="column" gap="4" className="app-form-stack">
                                <Text size="6" weight="bold" className="app-title">Login</Text>
                                <Text className="app-form-label">Email</Text>
                                <input className="app-input app-input--form" placeholder="Enter your email" required value={loginCredentials.email} onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})} />
                                {LoginError?.email && <Text className="app-form-error">{LoginError.email}</Text>}
                                <Text className="app-form-label">Password</Text>
                                <input className="app-input app-input--form" placeholder="Enter your password" required type="password" value={loginCredentials.password} onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})} />
                                {LoginError?.password && <Text className="app-form-error">{LoginError.password}</Text>}
                                {error && <Text className="app-form-error">{error}</Text>}
                                <Flex gap="2" justify="between" align="center" className="app-split-actions">
                                    <Button className="app-button app-button--primary" onClick={() => { void onSubmitLogin(loginCredentials) }}>Login</Button>
                                    <Link className="app-link-button" onClick={() => setmode(false)}>Create Account?</Link>
                                </Flex>
                            </Flex>
                        ) : (
                            <Flex direction="column" gap="4" className="app-form-stack">
                                <Text size="6" weight="bold" className="app-title">Register</Text>
                                <Text className="app-form-label">First Name</Text>
                                <input className="app-input app-input--form"
                                    placeholder="Enter your first name" 
                                    value={newCredentials?.fname} 
                                    required={true} 
                                    onChange={(e) => setNewCredentials({...newCredentials, fname: e.target.value})} 
                                />
                                {RegError?.fname && <Text className="app-form-error">{RegError.fname}</Text>}
                                <Text className="app-form-label">Last Name</Text>
                                <input className="app-input app-input--form"
                                    placeholder="Enter your last name" 
                                    value={newCredentials?.lname} 
                                    onChange={(e) => setNewCredentials({...newCredentials, lname: e.target.value})} 
                                />
                                <Text className="app-form-label">Email</Text>
                                <input className="app-input app-input--form"
                                    placeholder="Enter your email" 
                                    value={newCredentials?.email} 
                                    required={true}
                                    type='email'
                                    onChange={(e) => setNewCredentials({...newCredentials, email: e.target.value})} 
                                />
                                {RegError?.email && <Text className="app-form-error">{RegError.email}</Text>}
                                <Text className="app-form-label">Password</Text>
                                <input className="app-input app-input--form"
                                    placeholder="Enter your password" 
                                    type="password" 
                                    required={true}
                                    value={newCredentials?.password} 
                                    onChange={(e) => setNewCredentials({...newCredentials, password: e.target.value})} 
                                />
                                {RegError?.password && <Text className="app-form-error">{RegError.password}</Text>}
                                <Flex gap="2" justify="between" align='center' className="app-split-actions">
                                    <Button className="app-button app-button--primary" onClick={() => { void onSubmitRegister(newCredentials) }}>Register</Button>
                                    <Link className="app-link-button" onClick={() => setmode(true)}>Already Registered?</Link>
                                </Flex>
                            </Flex>

                        )
                    } 

                </Flex>
            </Card>
        </div>
    )
}