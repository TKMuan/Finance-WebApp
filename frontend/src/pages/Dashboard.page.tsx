import { TextField, Button, Text, Grid, Flex, Box, Card, } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks'
import { useEffect } from 'react'

const Header = () => {
  return (
    <Box className="bg-gradient-to-br from-black to-black w-full " px="5" py="4" bottom="5">
      <Text className="text-white" size="6">Dashboard</Text>
    </Box>
  )
}

const Main = () => {
  const navigate = useNavigate()

  return (
    <Box className="w-full p-5">
      <Text>Welcome to your dashboard!</Text>
      <Grid className="" columns={{initial: '1', md: '6'}} gap='2'>
        <Card className="w-full min-h-[10rem] mt-4 mr-4">
          <Text>Account Summary</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Spending Analysis</Text>
        </Card>
        </Grid>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Recent Transactions </Text>
        </Card>
        <Grid m="4" gap="2" columns={{initial: '2', md: "4"}}>
          <Button onClick={() => navigate("/transactions")}>
            <Text>Manage Transactions</Text>
          </Button>
          <Button onClick={() => navigate("/groups")}>
            <Text>Manage Groups</Text>
          </Button>
          <Button onClick={() => navigate("/methods")}>
            <Text>Manage Methods</Text>
          </Button>
        </Grid>
    </Box>
  )
}

export function Dashboard() {
  const {user} = useAuth()

  useEffect(() => {
    console.log("user: ", user)
})
  return (
    <GeneralPage
      header={<Header />}
      main={<Main />}
    />
  )
}