import { Spinner, Flex, Box, Text, TextField, Button, Card } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import { DateSelection } from '../components'
import { useEffect, useState } from 'react'
import type { CreateTransactionInput } from '../types'
import './transactions.create.css'

export const TransactionCreate = () => {
    const {user, loading} = useAuth()

    const [selectedDate, setSelectedDate] = useState(new Date())

    const [FormData, setFormData] = useState<CreateTransactionInput>({
        amount: 0,
        description: "",
        category: "",
        method: "",
        date: selectedDate,
        accountID: user?.id || "",
        groups: [],
        type: false
    })

    useEffect(() => {
        setFormData(prev => ({...prev, date: selectedDate}))
    }, [selectedDate])

    const onSubmit = () => {
         console.log("Creating transaction with data: ", FormData)
    }

    if (loading) {
        return <Spinner/>
    }
    return (
        <Box className="w-full p-5">
            <Text>New Transaction</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Flex gap='2' direction='column'>
                <TextField.Root placeholder="Amount" type="number" required={true} 
                    value={FormData.amount.toString()} 
                    onChange={(e) => setFormData({...FormData, amount: parseFloat(e.target.value) || 0})}/>
                <TextField.Root placeholder="Description" 
                    value={FormData.description} 
                    onChange={(e) => setFormData({...FormData, description: e.target.value})}/>
                <TextField.Root placeholder="Category" 
                    value={FormData.category} 
                    onChange={(e) => setFormData({...FormData, category: e.target.value})}/>
                <TextField.Root placeholder="Method" 
                    value={FormData.method} 
                    onChange={(e) => setFormData({...FormData, method: e.target.value})}/>
                <DateSelection 
                    value={selectedDate} 
                    onChange={setSelectedDate}/>
                <Button onClick={onSubmit}>Create Transaction</Button>
                </Flex>
            </Card>
        </Box>
    )
}