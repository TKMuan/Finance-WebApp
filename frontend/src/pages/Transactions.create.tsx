import { Flex, Box, Text, TextField, Button, Card, Grid, DropdownMenu } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'
import { useAuth } from '../hooks'
import { DateSelection } from '../components'
import { useEffect, useState, useMemo} from 'react'
import './transactions.create.css'


const Header = () => {
  return (
    <Box className="bg-gradient-to-br from-black to-black w-full rounded-bl-md rounded-br-md" px="5" py="4" bottom="5"> 
        <Text className="text-white" size="6">Transactions</Text>
    </Box>
  )
} 

export const TransactionCreate = () => {
    const {user} = useAuth()
    const [transactions, setTransactions] = useState([])
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        return {year: d.getFullYear(), month: d.getMonth(), day: d.getDate()}
    })

    return (
        <Box className="w-full p-5">
            <Text>New Transaction</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Flex gap='2' direction='column'>
                <TextField.Root placeholder="Amount" required={true} />
                <TextField.Root placeholder="Description"/>
                <TextField.Root placeholder="Category"/>
                <TextField.Root placeholder="Method"/>
                <DateSelection value={selectedDate} onChange={setSelectedDate}/>
                <Button>Create Transaction</Button>
                </Flex>
            </Card>
        </Box>
    )
}