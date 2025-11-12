import { TextField,Text, Flex, Box, } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'

const Header = () => {
  return (
    <Box className="bg-gradient-to-br from-black to-black w-full rounded-bl-md rounded-br-md" px="5" py="4" bottom="5">
      <Text className="text-white" size="6">Dashboard</Text>
    </Box>
  )
}
export function Dashboard() {
  return (
    <GeneralPage
      header={<Header />}
    />
  )
}