import { Link, RadioCards, Callout, Spinner, Flex, Box, Text, TextField, Button, Card, DropdownMenu } from '@radix-ui/themes'
import { useAuth, useGetMethods, useGetGroups, useCreateTransaction } from '../hooks'
import { DateSelection } from '../components'
import { useEffect, useState } from 'react'
import type { CreateTransactionInput, UserGroupings } from '../types'
import './transactions.create.css'
import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'

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
        type: true
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
                <Flex gap='4' direction='column'>
                    <Text>Amount</Text>
                    <TextField.Root placeholder="Amount" type="number" required={true} 
                        value={FormData.amount} 
                        onChange={(e) => setFormData({...FormData, amount: parseFloat(e.target.value)})}/>
                    <Text>Description</Text>
                    <TextField.Root placeholder="Description" 
                        value={FormData.description} 
                        onChange={(e) => setFormData({...FormData, description: e.target.value})}/>
                    
                    <Flex gap="2" justify="start">
                    <Box maxWidth="600px">
                        <Text mt="2" mb='4'>Type of Transaction</Text>
                        <RadioCards.Root mt="2" defaultValue="1" columns={{ initial: "1", sm: "3" }}>
                            <RadioCards.Item value="1" onClick={() => setFormData((prev) => ({...prev, type: false}))}>
                                <Flex direction="column" width="100%">
                                    <Text>Credit</Text>
                                </Flex>
                            </RadioCards.Item>
                            <RadioCards.Item value="2" onClick={() => setFormData((prev) => ({...prev, type: true}))}>
                                <Flex direction="column" width="100%">
                                    <Text>Debit</Text>
                                </Flex>
                            </RadioCards.Item>
                        </RadioCards.Root>
                    </Box>

                    </Flex>
                    <Text>Transaction Method</Text>
                    {
                        userMethodData?.data.length ? 
                        
                        <Box maxWidth="600px">
                            <RadioCards.Root defaultValue="0" columns={{ initial: "1", sm: "3" }}>
                                {
                                    userMethodData.data.map((data, index) => (
                                    <RadioCards.Item id={data.id}value={`${index}`} onClick={() => setFormData((prev) => ({...prev, method: data}))}>
                                        <Flex direction="column" width="100%">
                                            <Text>{data.name}</Text>
                                        </Flex>
                                    </RadioCards.Item>

                                    )

                                    )
                                }
                            </RadioCards.Root>
                        </Box>

                        : 

                        <Callout.Root>
                            <Flex align="center" gap="4">
                            <Callout.Icon>
                                <Info color="red"/>
                            </Callout.Icon>
                            <Callout.Text color="tomato">
                                You need to create a method of payment to be able to create a transaction
                            </Callout.Text>
                            </Flex>
                            <Flex justify="center">
                                <Callout.Text>
                                    <Link onClick={() => navigate('/methods/create')}>Go to Create Method Page?</Link>
                                </Callout.Text>
                            </Flex>
                       </Callout.Root>
                    }
                    
                    <Text>Transaction Date</Text>
                    <DateSelection 
                        value={selectedDate} 
                        onChange={setSelectedDate}/>
                    

                    <Text>Transaction Groups</Text>
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

                    
                    <Button onClick={onSubmit}  disabled={userMethodData?.data.length ? false : true} variant='outline'>
                        Create Transaction
                    </Button>
                </Flex>
                <Flex justify="center" gap='2' mt='6'>
                    <Button variant='outline' radius='full' onClick={() => navigate('/transactions')}>
                        Back
                    </Button>
                    <Button variant='outline' radius='full' onClick={() => navigate('/dashboard')}>
                        Home
                    </Button>
                </Flex>
            </Card>
        </Box>
    )
}