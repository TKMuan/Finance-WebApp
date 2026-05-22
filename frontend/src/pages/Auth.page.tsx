import { Box, Flex, Text, TextField, Button, Card } from '@radix-ui/themes'
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
            <Box className="min-w-screen min-h-screen flex items-center justify-center">
                <Text size="6" weight="bold">Loading...</Text>
            </Box>
        )
    }

    return (
        <Box className="min-w-screen min-h-screen flex items-center justify-center">
            <Card className="mx-4 my-8">
                <Flex direction="column" gap="4" p="5">
                    {
                        mode ? (
                            <Flex direction="column" gap="4">
                                <Text size="6" weight="bold">Login</Text>
                                <Text>Email</Text>
                                <TextField.Root placeholder="Enter your email" required={true} value={loginCredentials.email} onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})} />
                                {LoginError?.email && <Text className="text-red-500">{LoginError.email}</Text>}
                                <Text>Password</Text>
                                <TextField.Root placeholder="Enter your password" required={true} type="password" value={loginCredentials.password} onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})} />
                                {LoginError?.password && <Text className="text-red-500">{LoginError.password}</Text>}
                                {error && <Text className="text-red-500">{error}</Text>}
                                <Flex gap="2">
                                <Button onClick={() => setmode(false)}>Sign Up</Button>
                                <Button onClick={() => { void onSubmitLogin(loginCredentials) }}>Login</Button>
                                </Flex>
                            </Flex>
                        ) : (
                            <Flex direction="column" gap="4">
                                <Text size="6" weight="bold">Register</Text>
                                <Text>First Name</Text>
                                <TextField.Root 
                                    placeholder="Enter your first name" 
                                    value={newCredentials?.fname} 
                                    required={true} 
                                    onChange={(e) => setNewCredentials({...newCredentials, fname: e.target.value})} 
                                />
                                {RegError?.fname && <Text className="text-red-500">{RegError.fname}</Text>}
                                <Text>Last Name</Text>
                                <TextField.Root 
                                    placeholder="Enter your last name" 
                                    value={newCredentials?.lname} 
                                    onChange={(e) => setNewCredentials({...newCredentials, lname: e.target.value})} 
                                />
                                <Text>Email</Text>
                                <TextField.Root 
                                    placeholder="Enter your email" 
                                    value={newCredentials?.email} 
                                    required={true}
                                    onChange={(e) => setNewCredentials({...newCredentials, email: e.target.value})} 
                                />
                                {RegError?.email && <Text className="text-red-500">{RegError.email}</Text>}
                                <Text>Password</Text>
                                <TextField.Root 
                                    placeholder="Enter your password" 
                                    type="password" 
                                    required={true}
                                    value={newCredentials?.password} 
                                    onChange={(e) => setNewCredentials({...newCredentials, password: e.target.value})} 
                                />
                                {RegError?.password && <Text className="text-red-500">{RegError.password}</Text>}
                                <Flex gap="2">
                                    <Button onClick={() => setmode(true)}>Login</Button>
                                    <Button onClick={() => { void onSubmitRegister(newCredentials) }}>Register</Button>
                                </Flex>
                            </Flex>

                        )
                    } 

                </Flex>
            </Card>
        </Box>
    )
}