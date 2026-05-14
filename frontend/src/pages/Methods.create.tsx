import { Flex, Box, Text, TextField, Button, Card, Grid, DropdownMenu } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import type { CreateMethodInput } from '../types'
import { useEffect, useState, useMemo} from 'react'
import { MethodHooks, useCreateMethod } from '../hooks/method.hooks'
import { ChevronLeft, MoveLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const MethodCreate = () => {

    const navigate = useNavigate()

    const {user} = useAuth()
    const [error, setError] = useState<string | null>(null)

    const {mutate: createMethod, isPending} = useCreateMethod()

    const [method, setMethod] = useState<CreateMethodInput>({
        name: "",
        accountID: user?.id || ""
    })

    const updateUser = () => {
        setMethod((prev) => ({...prev, accountID: user?.id || ""}))
    }

    useEffect(() => updateUser, [user])

    const onSubmit = () => {
        setError(null)
        const data = {"name": method.name.trim(), "accountID": method.accountID}
        if (!data.name) 
        {
            setError("Name cannot be empty")
            return
        }
        console.log("Creating method with data: ", data)
        createMethod(data);
    }

    if (isPending){
        return (
            <Box className="w-full p-5">
                <Text>Loading...</Text>
            </Box>
        )
    }
    return (
        <Box className="w-full p-5">
            <Text>New Method</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Flex gap='2' direction='column'>
                <ChevronLeft
                onClick={() => navigate("/methods")}/>
                <TextField.Root placeholder="Name" value={method.name} onChange={(e) => setMethod({...method, name: e.target.value})}/>
                {error && <Text color="red">{error}</Text>}
                <Button onClick={() => onSubmit()}>Create Method</Button>
                </Flex>
            </Card>
        </Box>
    )
}