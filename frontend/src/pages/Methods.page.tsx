import { Flex, Box, Text, TextField, Button, Card } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import { useState } from 'react'
import { useGetMethods, useUpdateMethod, useDeleteMethod} from '../hooks/method.hooks'
import { X, Pencil, Trash2, CirclePlus, Check} from 'lucide-react'
import type { UserMethods } from '../types'
import { useNavigate } from 'react-router-dom'
import "./methods.page.css"

interface methodDisplayProp {
    record: UserMethods,
}

const MethodDisplayComponent = ({record}: methodDisplayProp) => {

    const { user } = useAuth()
    const [editEnabled, setEditEnabled] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const [newName, setNewName] = useState<string>("")
    const {isPending, mutate: mutateMethod} = useUpdateMethod()
    const {isPending: pendingDelete, mutate: deleteMethod} = useDeleteMethod()

    const handleConfirm = () => {
        const name = newName.trim()
        if (name){
            mutateMethod({"id": record.id, "name": name, "accountID": user?.id || ""})
            setNewName("")
        }
        setNewName("")
        setEditEnabled(false)
    }
    const handleDelete = () => {
        deleteMethod({"id": record.id, "accountID": user?.id || ""})
        setConfirmDelete(false)
    }
    if (isPending){
        return <Text>Updating...</Text>
    }
    if (pendingDelete){
        return <Text>Deleting...</Text>
    }
    return (
        <Flex direction="column">
            <Flex direction="row" justify="between" align="center" className="justify-between">
                <Text>
                    {record.name}
                </Text>
                <Flex direction="row" gap='2'>
                    {
                        editEnabled ? 
                        <Check onClick={() => handleConfirm()}/> :

                        confirmDelete ? 
                        <Flex align="center">
                            <X onClick={() => setConfirmDelete(false)}/>
                            <Button className="method_delete_button" onClick={() => handleDelete()}>Delete</Button>
                        </Flex> : 

                        <Flex>
                        <Pencil onClick={() => setEditEnabled(true)}/>
                        <Trash2 onClick={() => setConfirmDelete(true)}/>                                
                        </Flex>
                        
                    }
                </Flex>
            </Flex>
            { editEnabled && 
                <Flex>
                    <TextField.Root className="w-full mt-4" value={newName} onChange={(e) => {setNewName(e.target.value)}}>

                    </TextField.Root>
                </Flex>
            }
        </Flex>
    )

}
export const MethodsPage = () => {

    const {user} = useAuth()

    const {data: userMethods, isPending} = useGetMethods(user?.id || "")

    const navigate = useNavigate();

    return (
        <Box className="w-full p-5">
            <Text className="pt-3">Welcome to your methods page!</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Card className="w-full min-h-[10rem] mt-4 mb-4">
                    <Flex className="w-full flex-grow mb-4" align={"center"} justify="between">
                        <Text className="pl-2">User Method List</Text>
                        <CirclePlus className="mr-4"
                        onClick={() => navigate("/methods/create")}/>
                    </Flex>
                    { isPending ? <Box>Loading</Box>: 
                        <Flex direction="column" maxHeight="100vh" className="mt-2" wrap="wrap" gap="2">
                        {
                            userMethods?.data.map((record, index) => (
                                <Card key={index}>
                                    <MethodDisplayComponent record={record}/>
                                </Card>
                            ) 
                            )                         
                        }
                        </Flex>
                    }
                </Card>
                <Flex justify="center">
                    <Button
                    onClick={() => navigate("/dashboard")}>
                        Home
                    </Button>

                </Flex>
            </Card>
        </Box>
    )
}
