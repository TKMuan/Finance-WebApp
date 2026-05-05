import { Flex, Box, Text, TextField, Button, Card, Grid } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'
import { useAuth } from '../hooks'
import { useEffect, useState } from 'react'


const Header = () => {
  return (
    <Box className="bg-gradient-to-br from-black to-black w-full rounded-bl-md rounded-br-md" px="5" py="4" bottom="5"> 
        <Text className="text-white" size="6">Transactions</Text>
    </Box>
  )
}

export const TransactionPage = () => {
    const {user} = useAuth()
    const [transactions, setTransactions] = useState([])

    return (
        <Box className="w-full p-5">
            <Text className="pt-3">Welcome to your transactions page!</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                <Grid columns={{initial: '2', md: '6'}} gap='2'>
                    <Card>
                        <Text>Create Transaction</Text>
                    </Card>
                    <Card>
                        <Text>Modify Transaction</Text>
                    </Card>
                    <Card>
                        <Text>Delete Transaction</Text>
                    </Card>
                    <Card>
                        <Text>Transaction History</Text>
                    </Card>
                </Grid>
            </Card>
        </Box>
    )
}