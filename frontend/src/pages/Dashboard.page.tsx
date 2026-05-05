import { TextField,Text, Grid, Flex, Box, Card, } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'
import { useAuth } from '../hooks'
import { useEffect } from 'react'

const Header = () => {
  return (
    <Box className="bg-gradient-to-br from-black to-black w-full rounded-bl-md rounded-br-md" px="5" py="4" bottom="5">
      <Text className="text-white" size="6">Dashboard</Text>
    </Box>
  )
}

const Main = () => {
  return (
    <Box className="w-full p-5">
      <Text>Welcome to your dashboard!</Text>
      <Grid className="" columns={{initial: '2', md: '6'}} gap='2'>
        <Card className="w-full min-h-[10rem] mt-4 mr-4">
          <Text>Account Summary</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Spending Analysis</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Budget Overview</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4 mr-4">
          <Text>Account Summary</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Spending Analysis</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Budget Overview</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4 mr-4">
          <Text>Account Summary</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Spending Analysis</Text>
        </Card>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Budget Overview</Text>
        </Card>
        </Grid>
        <Card className="w-full min-h-[10rem] mt-4">
          <Text>Recent Transactions </Text>
        </Card>
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