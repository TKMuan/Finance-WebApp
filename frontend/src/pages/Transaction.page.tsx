import { Flex, DropdownMenu, Box, Text, TextField, Button, Card, Badge, Spinner } from '@radix-ui/themes'
import { useAuth } from '../hooks'
import { useEffect, useState} from 'react'
import type { Dispatch, SetStateAction} from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, Trash2, X, FilterIcon, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react'
import { useGetTransactions, useDeleteTransaction, useGetGroups, useGetMethods} from '../hooks'
import type { UserMethods, UserGroupings, Transaction, TransactionFilter } from '../types'
import { DateSelection } from '../components'

interface FilterProps {
    updateFilter: Dispatch<SetStateAction<TransactionFilter>>;
}

const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const FiltersSelection = ({updateFilter}: FilterProps) => {

    const [fromDate, setFromDate] = useState<Date >(new Date())
    const [toDate, setToDate] = useState<Date>(new Date())
    const [fromAmount, setFromAmount] = useState<number>()
    const [toAmount, setToAmount] = useState<number>()
    const [method, setMethod] = useState<Omit<UserMethods, "accountID"> | null>(null) 
    const [group, setGroup] = useState<Omit<UserGroupings, "accountID"> | null>(null)
    const [type, setType] = useState<boolean | null>(null)

    const {user, loading: isLoading} = useAuth()

    const {data: userMethods, isPending: methodsLoading} = useGetMethods(user?.id || "")
    const {data: userGroups, isPending: groupsLoading} = useGetGroups(user?.id || "")

    const updateFilterVals = () => {

        updateFilter(
            (prev) =>
            ({
                ...prev,
                "from_date": formatLocalDate(fromDate),
                "to_date": formatLocalDate(toDate),
                "from_amount": fromAmount || null,
                "to_amount": toAmount || null,
                "tType": type,
                "method": method?.id || null,
                "group": group?.id || null,
            })
        )
    }

    useEffect(() => {
        const setFD = new Date(fromDate.getFullYear() - 5, 0, 1)
        setFromDate(setFD)
    }, [])

    if (isLoading || methodsLoading || groupsLoading){
        return <Spinner></Spinner>
    }

    return (
        <Flex my="2" className='w-full'>
            <Card className='w-full'>
                <Flex gap="2" direction={'column'}>
                    <Flex gap="2" direction="column" >
                        <Text>Date</Text>
                        <Flex gap="2" align="center">
                            <Text>From:</Text>
                            <DateSelection value={fromDate} onChange={setFromDate}/>
                            <Text>To:</Text>
                            <DateSelection value={toDate} onChange={setToDate}/>
                        </Flex>
                    </Flex>
                    <Flex direction={"column"} gap="2">
                        <Text>Amount</Text>
                        <Flex gap="2" align="center">
                            <Text>From:</Text>
                            <TextField.Root type="number" value={fromAmount} onChange={((e) => setFromAmount(parseInt(e.target.value)))}/>
                            <Text>To:</Text>
                            <TextField.Root type="number" value={toAmount} onChange={(e) => setToAmount(parseInt(e.target.value))}/>
                        </Flex>
                    </Flex>
                    <Flex gap="4" align="start" justify="start" direction="column">
                        <Flex gap="4" align="center">
                            <Text>Method:</Text>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <Button variant="ghost">
                                        {
                                            method !== null ? (method.name) : "Any" 
                                        }
                                    </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    {
                                        userMethods?.data.map((record, index) => (
                                            <DropdownMenu.Item id={`${index}`} onClick={() => setMethod(record)}>
                                                {record.name}
                                            </DropdownMenu.Item>
                                        ))
                                    }
                                    <DropdownMenu.Item onClick={() => setMethod(null)}>
                                        Any
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        </Flex>
                        <Flex gap="4" align="center">
                            <Text>Group:</Text>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <Button variant="ghost">
                                        {
                                            group !== null ? (group.name) : "Any" 
                                        }
                                    </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    {
                                        userGroups?.data.map((record, index) => (
                                            <DropdownMenu.Item id={`${index}`} onClick={() => setGroup(record)}>
                                                {record.name}
                                            </DropdownMenu.Item>
                                        ))
                                    }
                                    <DropdownMenu.Item onClick={() => setGroup(null)}>
                                        Any
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        </Flex>
                    </Flex>
                    <Flex align="center" className='w-full' gap="4">
                        <Text>Type:</Text>
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <Button variant="ghost">
                                    {
                                        (type !== null) ? (type ? "Debit" : "Credit") : "Any"
                                    }
                                </Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Item onClick={() => setType(false)}>
                                    Credit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onClick={() => setType(true)}>
                                    Debit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item onClick={() => setType(null)}>
                                    Any
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    </Flex>
                </Flex>
                <Flex justify={"center"}>
                    <Button onClick={updateFilterVals}>
                        Search
                    </Button>
                </Flex>
            </Card>
        </Flex>
    )
}
interface TransactionDisplayProp {
    record: Transaction,
}
const TransactionDisplayComponent = ({record}: TransactionDisplayProp) => {

    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const {isPending: pendingDelete, mutate: deleteMethod} = useDeleteTransaction()

    const handleDelete = () => {
        deleteMethod({"id": record.id})
        setConfirmDelete(false)
    }
    if (pendingDelete){
        return <Text>Deleting...</Text>
    }
    return (
        <Flex direction="column">
            <Flex direction="row" justify="between" align="center" className="justify-between">
                <Flex className="h-fit" gap='2' maxWidth={{"sm": "50", "md":"100"}} direction="column">
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
                <Flex direction="row" gap='2'>
                    {
                        confirmDelete ? 
                        <Flex align="center">
                            <X onClick={() => setConfirmDelete(false)}/>
                            <Button className="method_delete_button" onClick={() => handleDelete()}>Delete</Button>
                        </Flex> : 

                        <Flex>
                        <Trash2 onClick={() => setConfirmDelete(true)}/>                                
                        </Flex>
                        
                    }
                </Flex>
            </Flex>
        </Flex>
    )

}

export const TransactionPage = () => {
    const {user, loading} = useAuth()
    const [showFilters, setShowFilters] = useState(false)
    const [desc, setDesc] = useState<string | null>()

    const updateDesc = (val: string) => {
        const newVal = val.trim()
        setDesc(newVal ? newVal : null)
    }

    const [transFilters, setTransFilters] = useState<TransactionFilter>({
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
    
    const {data: transactions, refetch: refetchTrans, isPending} = useGetTransactions(user?.id || "", 0, 25, transFilters)

    const navigate = useNavigate()

    useEffect(() => {
        console.log("filters updated refetching transactions")
        console.log(transFilters)
        refetchTrans()
    }, [transFilters])
    useEffect(() => {
        console.log("transactions: ",transactions)
    }, [transactions])

    if (isPending || loading){
        return <Spinner/>
    }

    return (
        <Box className="w-full p-5">
            <Text className="pt-3">Welcome to your transactions page!</Text>
            <Card className="w-full min-h-[10rem] mt-4 mb-4">
                        <Text>
                            Transaction List
                        </Text>
                        <Flex align="center" gap="2" my="2">
                            <TextField.Root className="w-full" onChange={((e) => updateDesc(e.target.value))}>
                            </TextField.Root>
                            <SearchIcon onClick={() => setTransFilters((prev) => ({...prev, desc: desc || null}))}/>
                            <FilterIcon onClick={() => setShowFilters((prev) => !prev)}/>
                        </Flex>
                        <Flex justify="end" direction="column">
                        <Flex justify={"end"} className='w-full'>
                        </Flex>
                        {
                            showFilters && <FiltersSelection updateFilter={setTransFilters}/>
                        }
                        </Flex>
                <Card>
                    <Flex direction="column" className="h-screen">
                        <Flex className="min-h-100" direction="column" gap='2'>
                            <Flex justify={'end'} px="1" gap='2'>
                                <Button variant='outline' onClick={() => navigate('/transactions/create')}>Create Transaction</Button>
                                <DropdownMenu.Root >
                                    <DropdownMenu.Trigger>
                                        <Button variant="outline">
                                            {transFilters.limit}
                                            <ArrowDown/>
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content>
                                        <Button variant="ghost" className="w-full" onClick={() => setTransFilters((prev) => ({...prev, limit: 10}))}>10</Button>
                                        <Button variant="ghost" className="w-full" onClick={() => setTransFilters((prev) => ({...prev, limit: 25}))}>25</Button>
                                        <Button variant="ghost" className="w-full" onClick={() => setTransFilters((prev) => ({...prev, limit: 50}))}>50</Button>
                                        <Button variant="ghost" className="w-full" onClick={() => setTransFilters((prev) => ({...prev, limit: 100}))}>100</Button>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </Flex>
                            {
                                transactions ? transactions.data.map((record) => (
                                    <Card key={record.id} id={record.id}>
                                        <TransactionDisplayComponent record={record}/>
                                    </Card>
                                )):<></>
                            }
                        </Flex>
                    </Flex>
                    <Flex justify={'center'} gap="2" mt="4">
                        <Button variant="outline" disabled={transFilters.page === 0} onClick={() => setTransFilters((prev) => ({...prev, page: prev.page - 1}))}>
                            <ArrowLeft />
                        </Button>
                        <Text mx="4">{transFilters.page + 1}</Text>
                        <Button variant="outline" disabled={transactions?.data.length !== transFilters.limit} onClick={() => setTransFilters((prev) => ({...prev, page: prev.page + 1}))}>
                            <ArrowRight />
                        </Button>
                    </Flex>

                </Card>
                <Flex justify={"center"} align="center" mt='4'>
                    <Button onClick={() => navigate('/dashboard')}>Home</Button>
                </Flex>
            </Card>
        </Box>
    )
}