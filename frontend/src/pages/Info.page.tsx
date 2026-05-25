import { Blockquote, Button, SegmentedControl, Callout, Em, Flex, Strong, Text} from "@radix-ui/themes"
import { useState } from "react"
import { Info, Share } from "lucide-react"
import { useNavigate } from "react-router-dom"

 export const InfoPage = () => {
    const [mode, setMode] = useState<"android" | 'ios'>('android') 
    const navigate = useNavigate()
    return (
        <Flex className="w-full h-full" justify="center" direction="column" gap="4">
            <Flex className="w-full" justify="start" mx='4' mt="6" mb="4" direction={'column'}>
                <Text className="font-bold italic " size="6">About The App</Text>
                <Text></Text>
            </Flex>
            <Flex mx="2" direction={'column'} justify={'start'} align={'start'}>
                <Text className="font-bold">
                    Main Dashboard
                </Text>
                <Blockquote className="italic">
                    The main dashboard provides 4 main statistics: Your daily spending, monthly spending, yearly spending and net expenditure of each user method 
                </Blockquote>
            </Flex>
            <Flex mx="2" direction={'column'} justify={'start'} align={'start'}>
                <Text className="font-bold">
                    User Methods
                </Text>
                <Blockquote className="italic">
                    The user methods hold information about the method of payment. The user can make as many payment methods as required from the methods creation page and view all created methods on the manage methods page.
                <Callout.Root my="2">
                    <Callout.Icon>
                        <Info />
                    </Callout.Icon>
                    <Callout.Text>
                        User needs to create at least one method before transactions can be created
                    </Callout.Text>
                </Callout.Root>
                </Blockquote>
            </Flex>
            <Flex mx="2" direction={'column'} justify={'start'} align={'start'}>
                <Text className="font-bold">
                    User Groupings
                </Text>
                <Blockquote className="italic">
                    The user is able to created groups to sort transactions into. Created groups can be managed from the groupings page and transactions can be filtered based on their assigned groups. <Strong>Creation of Group is not necessary for creation of transaction</Strong> 
                </Blockquote>
            </Flex>
            <Flex mx="2" direction={'column'} justify={'start'} align={'start'}>
                <Text className="font-bold">
                    Transactions
                </Text>
                <Blockquote className="italic">
                    The user is able to created transactions record with some basic information such as <Em> transaction amount, transaction date, method of payment, type of transaction, group to categorize transaction</Em>. The transaction records can then be updated or filtered from the transactions page
                </Blockquote>
            </Flex>
            <Flex mx="2" direction={'column'} justify={'start'} align={'start'}>
                <Text className="font-bold">
                    Installation on mobile
                </Text>
                <Blockquote className="" mb="4">
                    <Flex direction="column" gap='4'>
                    <Text>For users that want to use the web app Go to a website with a web app that you want to install.from the homescreen follow the following steps: </Text>
                    <SegmentedControl.Root value={mode}>
                        <SegmentedControl.Item value="android" onClick={() => setMode('android')}>Android</SegmentedControl.Item>
                        <SegmentedControl.Item value="ios" onClick={() => setMode('ios')}>IOS</SegmentedControl.Item>
                    </SegmentedControl.Root>
                    {
                        mode === 'android' ?
                    <Flex className="w-full"  direction="column" align="start" justify="start">
                        <Text>1. Open chrome and go to the webpage</Text>
                        <Text>2. On the right of the address bar, tap More  and then Add to home screen and then Install.</Text>
                        <Text>3. Follow the on-screen instructions.</Text>
                    </Flex>
                    :
                    <Flex className="w-full"  direction="column" align="start" justify="start">
                        <Text>1. Open chrome and go to the webpage</Text>
                        <Text>2. On the right of the address bar, tap Share <Share/></Text>
                        <Text>3. Find and tap Add to Home Screen</Text>
                        <Text>4. Confirm or edit the website details and tap Add</Text>
                    </Flex>
                    }
                    </Flex>
                </Blockquote>
            </Flex>
            <Button variant="ghost" mb="6" onClick={() => navigate('/auth')}>
                Get Started
            </Button>
        </Flex>
    )
 }