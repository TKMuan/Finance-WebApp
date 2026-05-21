import { Flex, Box, Text, TextField, Button, Card, Grid, Spinner } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'
import { useAuth, useGetGroups, useUpdateGroup, useDeleteGroup } from '../hooks'
import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { Search, ListFilter, Check, Pencil, Trash2, X } from 'lucide-react'
import type { UserGroupings } from '../types'
import { useQueryClient } from '@tanstack/react-query'

interface groupDisplayProp{
    record: UserGroupings
}
const GroupDisplayComponent = ({record}: groupDisplayProp) => {

    const { user } = useAuth()
    const [editEnabled, setEditEnabled] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const [newName, setNewName] = useState<string>("")
    const {isPending, mutate: mutateGroup} = useUpdateGroup()
    const {isPending: pendingDelete, mutate: deleteGroup} = useDeleteGroup()

    const handleConfirm = () => {
        const name = newName.trim()
        if (name){
            mutateGroup({"id": record.id, "name": name, "accountID": user?.id || ""})
            setNewName("")
        }
        setNewName("")
        setEditEnabled(false)
    }
    const handleDelete = () => {
        deleteGroup({"id": record.id, "accountID": user?.id || ""})
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
export const GroupingPage = () => {
    const {user, loading} = useAuth()
    const [currentPage, setCurrentPage] = useState<number>(0)
    const [pageSize, setPageSize] = useState<number>(5)
    const [searchGroup, setSearchGroup] = useState<string>("")
    const {data: groups, isPending, refetch} = useGetGroups(user?.id || "", currentPage, pageSize, searchGroup)

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    useEffect(() => {
        console.log("Groups: ", groups)
    }, [groups])
    if (loading || isPending){
    return <Spinner/>
    }

    return (
        <Box className="w-full p-5">
            <Text className="pt-3">Welcome to your grouping page!</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Card className="w-full min-h-[10rem] mt-4 mb-4">
                    <Text>Grouping List</Text>
                    <Flex align={'center'} gap='2' my='2'>
                        <TextField.Root className="w-full" value={searchGroup} onChange={(e) => setSearchGroup(e.target.value)}>
                            <TextField.Slot side="right">
                            </TextField.Slot>
                        </TextField.Root>
                        <Search onClick={() => refetch()}/> 
                    </Flex>
                    <Card className="size-full min-h-80">
                        <Flex direction='column' gap='2'>
                            {
                                groups ? groups.data.map((record) => (
                                    <Card id={record.id}>
                                        <GroupDisplayComponent record={record}/>
                                    </Card>
                                ))
                                :
                                <Text>No records</Text>
                            }
                        </Flex>
                    </Card>
                    <Flex gap='2' align={"center"} justify={'center'} my='2'>
                        <Button 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={currentPage <= 0}
                        >Prev Page
                        </Button>
                        <Text>{(groups?.page || 0) + 1}</Text>
                        <Button 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={groups?.data.length !== pageSize}
                        >Next Page 
                        </Button>
                    </Flex>

                </Card>
                <Flex justify="center" gap='2'>
                    <Button onClick={() => navigate("/dashboard")}>Home</Button>
                    <Button onClick={() => navigate("/groups/create")}>
                        Create Grouping
                    </Button>
                </Flex>
            </Card>
        </Box>
    )
}
