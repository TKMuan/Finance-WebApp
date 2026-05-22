import { Flex, Button, Text, Grid, Box, Card, Badge, Spinner } from '@radix-ui/themes'
import { GeneralPage } from '../components/GeneralPage'
import { useNavigate } from 'react-router-dom'
import { useAuth, useGetTransactionDashboard, useGetTransactions } from '../hooks'
import { useEffect, useState } from 'react'
import type { Transaction, TransactionDashboard } from '../types'

interface TransactionDisplayProp {
    record: Transaction,
}
const TransactionDisplayComponent = ({record}: TransactionDisplayProp) => {

    return (
        <Flex direction="column">
            <Flex direction="row" justify="between" align="center" className="justify-between">
                <Flex className="" gap='2' maxWidth={{"sm": "50", "md":"100"}} direction="column">
                    <Text truncate className='max-w-50 md:max-w-150' >
                        {record.description}
                    </Text>
                    <Flex gap='2'>
                        <Badge color={record.type ? "red" : "green"}>
                            <Text truncate>
                                {record.amount}
                            </Text>
                        </Badge>
                        <Badge>
                            <Text truncate>
                                {record.methodName}
                            </Text>
                        </Badge>
                        <Badge>
                            <Text truncate>
                                {record.transaction_time.getDate()}-{record.transaction_time.getMonth() + 1}-{record.transaction_time.getFullYear()}
                            </Text>
                        </Badge>
                    </Flex>
                    <Flex gap='2'>
                        {
                            record.groups?.map((groupRecord) => (
                                <Badge key={groupRecord.id} id={groupRecord.id}>
                                    {groupRecord.name}
                                </Badge>
                            ))
                        }
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    )

}

export function Dashboard() {
  const {user, loading} = useAuth()
  const navigate = useNavigate()
  const {data: recentTransaction, isPending: gettingTransactions} = useGetTransactions(user?.id || "", 0, 10,{
        "from_amount":  null,
        "to_amount":  null,
        "desc": null,
        "tType": null,
        "method": null,
        "from_date": null,
        "to_date": null,
        "group": null,
        "page": 0,
        "limit": 10
  }) 
  const {data: dashboardStats, isPending: gettingDashStat} = useGetTransactionDashboard(user?.id || "")

  useEffect(() => {
    console.log("user: ", user)
    console.log("dash: ", dashboardStats)
  }, [user])
  if (loading || gettingTransactions || gettingDashStat){
    return <Spinner></Spinner>
  }
  return (
    <Flex direction={'column'}>
        <Box className="bg-gradient-to-br from-black to-black w-full " px="5" py="4" bottom="5">
          <Text className="text-white" size="6">Dashboard</Text>
        </Box>
      <Box className="w-full p-5">
        <Text>Welcome to your dashboard!</Text>
        <Grid className="" columns={{initial: '1', md: '6'}} gap='2'>
          <Card className="w-full min-h-[10rem] mt-4">
            <Text>Spending Analysis</Text>
            <Flex gap="2" className='pt-4' justify={"center"}>
              <Card className="">
                <Text>
                  Day Spending
                </Text>
                <Flex gap="2" mt='2' direction="column">
                  {
                    dashboardStats.data.day.map((record: TransactionDashboard) => (
                      <Badge>
                        <Flex gap='2'>
                        <Text>{record.name}</Text>
                        <Text>{record.sum}</Text>
                        </Flex>
                      </Badge>
                    ))
                  }
                </Flex>
              </Card>
              <Card>
                <Text>
                  Month Spending
                </Text>
                <Flex gap="2" mt='2' direction="column">
                  {
                    dashboardStats.data.month.map((record: TransactionDashboard) => (
                      <Badge>
                        <Flex gap='2'>
                        <Text>{record.name}</Text>
                        <Text>{record.sum}</Text>
                        </Flex>
                      </Badge>
                    ))
                  }
                </Flex>
              </Card>
              <Card>
                <Text>
                  Year Spending
                </Text>
                <Flex gap="2" mt='2' direction="column">
                  {
                    dashboardStats.data.year.map((record: TransactionDashboard) => (
                      <Badge>
                        <Flex gap='2'>
                        <Text>{record.name}</Text>
                        <Text>{record.sum}</Text>
                        </Flex>
                      </Badge>
                    ))
                  }
                </Flex>
              </Card>
            </Flex>
          </Card>
          </Grid>
          <Card className="w-full min-h-[10rem] mt-4">
            <Text>Recent Transactions </Text>
            <Flex direction='column' gap='2'>
              {
                recentTransaction?.data.map((record) => (
                  <Card id={record.id}>
                    <TransactionDisplayComponent record={record}/>
                  </Card>
                ))
              }
            </Flex>
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

    </Flex>
  )
}