import { Spinner, Flex, Box, Text, TextField, Button, Card, DropdownMenu } from '@radix-ui/themes'
import { useAuth, useGetMethods, useGetGroups, useCreateTransaction } from '../hooks'
import { DateSelection } from '../components'
import { useEffect, useState } from 'react'
import type { CreateTransactionInput, UserGroupings } from '../types'
import './transactions.create.css'
import { useNavigate } from 'react-router-dom'

export const TransactionCreate = () => {
    const {user, loading} = useAuth()

    const [selectedDate, setSelectedDate] = useState(new Date())

    const {data: userMethodData, isPending: gettingMethods} = useGetMethods(user?.id || "")
    const {data: userGroupData, isPending: gettingGroups} = useGetGroups(user?.id || "")
    const {mutate: createTransaction, isPending: creatingTransaction} = useCreateTransaction()
    const navigate = useNavigate()

    const [FormData, setFormData] = useState<CreateTransactionInput>({
        amount: 0,
        description: "",
        method: {id: "", name: ""},
        transaction_time: selectedDate,
        accountID: user?.id || "",
        groups: [],
        tType: true
    })

    useEffect(() => {
        setFormData(prev => ({...prev, transaction_time: selectedDate}))
    }, [selectedDate])

    const addGroup = (record: Omit<UserGroupings, 'accountID'>) => {
        const exist = FormData.groups.some(user => user.id === record.id) 

        if (!exist){
            setFormData((prev) => ({...prev, groups: [...prev.groups, record]}))
        }
    }
    const removeGroup = (id: string) => {
        setFormData((prev) => (
            {...prev, groups: prev.groups.filter(user => user.id !== id)}
        ))
    }
    const onSubmit = () => {
         console.log("Creating transaction with data: ", FormData)
         createTransaction(FormData)
    }

    if (loading || gettingGroups || gettingMethods || creatingTransaction) {
        return <Spinner/>
    }
    return (
        <Box className="w-full p-5">
            <Text>New Transaction</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Flex gap='2' direction='column'>
                    <TextField.Root placeholder="Amount" type="number" required={true} 
                        value={FormData.amount} 
                        onChange={(e) => setFormData({...FormData, amount: parseFloat(e.target.value)})}/>
                    <TextField.Root placeholder="Description" 
                        value={FormData.description} 
                        onChange={(e) => setFormData({...FormData, description: e.target.value})}/>
                    
                    <Flex gap="2" justify="start">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button>
                                {FormData.method.id ? FormData.method.name: "Select Method"}
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            { userMethodData?.data.map((record) => (
                                <DropdownMenu.Item id={record.id} onClick={() => setFormData(prev => ({...prev, method: record}))}>
                                        {record.name}
                                </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button>
                                {FormData.tType ? "Debit": "Credit"}
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            <DropdownMenu.Item onClick={() => setFormData((prev) => ({...prev, tType: true}))}>
                                Debit
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onClick={() => setFormData((prev) => ({...prev, tType: false}))}>
                                Credit
                            </DropdownMenu.Item>
                            
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    </Flex>
                    
                    <DateSelection 
                        value={selectedDate} 
                        onChange={setSelectedDate}/>
                    


                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <Button variant='outline'>
                                Add Group
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            { userGroupData?.data.map((record) => (
                                <DropdownMenu.Item id={record.id} onClick={() => addGroup(record)}>
                                        {record.name}
                                </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>

                    <Card>
                        <Flex gap="2" className='min-h-4'>
                            {
                                FormData.groups.map((record) => (
                                    <Card id={record.id} onClick={() => removeGroup(record.id)}>
                                        {record.name}
                                    </Card>
                                ))
                            } 
                        </Flex>
                    </Card>
                    
                    <Button onClick={onSubmit} variant='outline'>
                        Create Transaction
                    </Button>
                </Flex>
                <Flex justify="center" gap='2' mt='2'>
                    <Button onClick={() => navigate('/transactions')}>
                        Back
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>
                        Home
                    </Button>
                </Flex>
            </Card>
        </Box>
    )
}