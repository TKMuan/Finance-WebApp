import { Grid, CheckboxGroup, Flex, RadioGroup, DropdownMenu, Box, Text, TextField, Button, Card, Badge, Dialog } from '@radix-ui/themes'
import { useAuth, useUpdateTransaction } from '../hooks'
import { useEffect, useState} from 'react'
import type { Dispatch, SetStateAction} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon, Trash2, X, FilterIcon, ArrowLeft, ArrowRight, ArrowDown, Pencil } from 'lucide-react'
import { useGetTransactions, useDeleteTransaction, useGetGroups, useGetMethods} from '../hooks'
import type { UserMethods, UserGroupings, Transaction, TransactionFilter, UpdateTransactionInput } from '../types'
import { DateSelection, LoadingComponent } from '../components'

interface FilterProps {
    updateFilter: Dispatch<SetStateAction<TransactionFilter>>,
    userMethods: UserMethods[],
    userGroups: UserGroupings[] 
}

const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const parseLocalDateParam = (value: string | null, fallback: Date) => {
    if (!value) return fallback

    const [yearStr, monthStr, dayStr] = value.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr)
    const day = Number(dayStr)

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return fallback
    }

    return new Date(year, month - 1, day)
}

const FiltersSelection = ({updateFilter, userMethods, userGroups}: FilterProps) => {

    const [searchParams, setSearchParams] = useSearchParams()
    const [fromDate, setFromDate] = useState<Date >(new Date())
    const [toDate, setToDate] = useState<Date>(new Date())
    const [fromAmount, setFromAmount] = useState<number>()
    const [toAmount, setToAmount] = useState<number>()
    const [method, setMethod] = useState<Omit<UserMethods, "accountID"> | null>(null) 
    const [group, setGroup] = useState<Omit<UserGroupings, "accountID"> | null>(null)
    const [type, setType] = useState<boolean | null>(null)

    const updateFilterVals = () => {
        const formattedFromDate = formatLocalDate(fromDate)
        const formattedToDate = formatLocalDate(toDate)

        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('from_date', formattedFromDate)
        nextParams.set('to_date', formattedToDate)

        if (fromAmount !== undefined) {
            nextParams.set('from_amount', fromAmount.toString())
        } else {
            nextParams.delete('from_amount')
        }

        if (toAmount !== undefined) {
            nextParams.set('to_amount', toAmount.toString())
        } else {
            nextParams.delete('to_amount')
        }

        if (type !== null) {
            nextParams.set('tType', String(type))
        } else {
            nextParams.delete('tType')
        }

        if (method?.id) {
            nextParams.set('method', method.id)
        } else {
            nextParams.delete('method')
        }

        if (group?.id) {
            nextParams.set('group', group.id)
        } else {
            nextParams.delete('group')
        }

        setSearchParams(nextParams)

        updateFilter(
            (prev) =>
            ({
                ...prev,
                "from_date": formattedFromDate,
                "to_date": formattedToDate,
                "from_amount": fromAmount ?? null,
                "to_amount": toAmount ?? null,
                "tType": type,
                "method": method?.id || null,
                "group": group?.id || null,
            })
        )
    }

    useEffect(() => {
        const defaultFromDate = new Date(new Date().getFullYear() - 5, 0, 1)
        const defaultToDate = new Date()

        const parsedFromDate = parseLocalDateParam(searchParams.get('from_date'), defaultFromDate)
        const parsedToDate = parseLocalDateParam(searchParams.get('to_date'), defaultToDate)

        const fromAmountParam = searchParams.get('from_amount')
        const parsedFromAmount = fromAmountParam !== null ? Number.parseInt(fromAmountParam, 10) : NaN

        const toAmountParam = searchParams.get('to_amount')
        const parsedToAmount = toAmountParam !== null ? Number.parseInt(toAmountParam, 10) : NaN

        const methodParam = searchParams.get('method')
        const groupParam = searchParams.get('group')
        const typeParam = searchParams.get('tType')

        const selectedMethod = methodParam ? userMethods.find((rec) => rec.id === methodParam) ?? null : null
        const selectedGroup = groupParam ? userGroups.find((rec) => rec.id === groupParam) ?? null : null

        const parsedType = typeParam === 'true' ? true : typeParam === 'false' ? false : null

        setFromDate(parsedFromDate)
        setToDate(parsedToDate)
        setFromAmount(Number.isNaN(parsedFromAmount) ? undefined : parsedFromAmount)
        setToAmount(Number.isNaN(parsedToAmount) ? undefined : parsedToAmount)
        setMethod(selectedMethod)
        setGroup(selectedGroup)
        setType(parsedType)

        updateFilter((prev) => ({
            ...prev,
            from_date: formatLocalDate(parsedFromDate),
            to_date: formatLocalDate(parsedToDate),
            from_amount: Number.isNaN(parsedFromAmount) ? null : parsedFromAmount,
            to_amount: Number.isNaN(parsedToAmount) ? null : parsedToAmount,
            tType: parsedType,
            method: selectedMethod?.id || null,
            group: selectedGroup?.id || null,
        }))
    }, [searchParams, userMethods, userGroups, updateFilter])

    return (
        <Flex my="2" className='w-full'>
            <Card className='w-full'>
                <Flex gap="2" direction={'column'}>
                    <Flex gap="2" direction="column" >
                        <Flex gap="4" justify="start">
                            <Text>From Date:</Text>
                            <DateSelection value={fromDate} onChange={setFromDate}/>
                        </Flex>
                        <Flex gap="4" justify="start">
                            <Text>To Date:</Text>
                            <DateSelection value={toDate} onChange={setToDate}/>
                        </Flex>
                    </Flex>
                    <Flex direction={"column"} gap="2">
                        <Flex gap="2" align="center">
                            <Text>From Amount:</Text>
                            <TextField.Root type="number" value={fromAmount} onChange={((e) => {
                                const parsed = parseInt(e.target.value)
                                setFromAmount(Number.isNaN(parsed) ? undefined : parsed)
                            })}/>
                            <Text>To Amount:</Text>
                            <TextField.Root type="number" value={toAmount} onChange={(e) => {
                                const parsed = parseInt(e.target.value)
                                setToAmount(Number.isNaN(parsed) ? undefined : parsed)
                            }}/>
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
                                        userMethods.map((record, index) => (
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
                                        userGroups.map((record, index) => (
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
                <Flex justify={"center"} gap="2">
                    <Button variant="outline" radius="full" onClick={() => setSearchParams({})}>
                        Clear
                    </Button>
                    <Button variant="outline" radius="full" onClick={updateFilterVals}>
                        Search
                    </Button>
                </Flex>
            </Card>
        </Flex>
    )
}
interface TransactionDisplayProp {
    record: Transaction,
    userMethods: UserMethods[] 
    userGroups: UserGroupings[]
}

const TransactionDisplayComponent = ({record, userMethods, userGroups}: TransactionDisplayProp) => {

    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const {isPending: pendingDelete, mutate: deleteMethod} = useDeleteTransaction()
    const {isPending: pendingUpdate, mutate: updateTransaction} = useUpdateTransaction()
    const [groups, setGroups] = useState(record.groups.map(rec => rec.id))
    const [date, setDate] = useState(new Date(record.transaction_time))
    const [updateData, setUpdateData] = useState<UpdateTransactionInput>(
        {
            id: record.id,
            accountID: record.accountID,
            amount: record.amount,
            description: record.description,
            method: record.method,
            groups: [],
            type: record.type,
            transaction_time: record.transaction_time
        }
    )
    const handleUpdate = () => {

        const data = {
            ...updateData,
            groups: groups,
                transaction_time: date
        }
        updateTransaction(data)
    }
    const handleDelete = () => {
        deleteMethod({"id": record.id})
        setConfirmDelete(false)
    }
    if (pendingDelete){
        return <Text>Deleting...</Text>
    }
    if (pendingUpdate){
        return <Text>Updating...</Text>
    }
    return (
        <Flex direction="column">
            <Flex direction="row" justify="between" align="center" className="justify-between">
                <Flex className="h-fit" gap='2' maxWidth={{"sm": "50", "md":"100"}} direction="column">
                    <Text truncate className='max-w-50 md:max-w-150' >
                        {record.description}
                    </Text>
                    <Flex gap='2' className="flex-wrap">
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
                    <Flex gap='2' className="flex-wrap">
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
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <Button variant="ghost">
                                <Pencil color='black'/> 
                            </Button>
                        </Dialog.Trigger>

                        <Dialog.Content className="w-fit" maxWidth="100%">
                            <Dialog.Title>Edit Transaction</Dialog.Title>
                            <Dialog.Description size="2" mb="4">
                                Make changes to your transaction.
                            </Dialog.Description>

                            <Flex direction="column" gap="3">
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Amount
                                    </Text>
                                    <TextField.Root
                                        value={updateData.amount}
                                        type='number'
                                        placeholder="Enter Amount"
                                        onChange={(e) => setUpdateData((prev) => ({...prev, amount: parseInt(e.target.value)}))}
                                    />
                                </label>
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Description
                                    </Text>
                                    <TextField.Root
                                        value={updateData.description}
                                        placeholder="Enter description"
                                        onChange={(e) => setUpdateData((prev) => ({...prev, description: e.target.value.trim()}))}
                                    />
                                </label>
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Type
                                    </Text>
                                    <RadioGroup.Root defaultValue={record.type ? 'true' : 'false'} name="example">
                                        <RadioGroup.Item value="true" onClick={() => setUpdateData((prev) => ({...prev, type: true}))} >Debit</RadioGroup.Item>
                                        <RadioGroup.Item value="false" onClick={() => setUpdateData((prev) => ({...prev, type: false}))} >Credit</RadioGroup.Item>
                                    </RadioGroup.Root>
                                </label>
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Method
                                    </Text>
                                    <RadioGroup.Root defaultValue={record.method} name="example">
                                        <Grid gap='2' columns={{initial: '2', md:'3', lg:'4'}}>
                                        {
                                            userMethods.map((method) => (
                                                <RadioGroup.Item value={method.id} onClick={() => setUpdateData((prev) => ({...prev, method: method.id}))} >{method.name}</RadioGroup.Item>

                                            ))
                                        }
                                        </Grid>
                                    </RadioGroup.Root>
                                </label>
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Groups
                                    </Text>
                                    <CheckboxGroup.Root defaultValue={record.groups.map((rec) => rec.id)} name="example" value={groups} onValueChange={setGroups}>
                                        <Grid gap='2' columns={{initial: '2', md:'3', lg:'4'}}>
                                            {
                                                userGroups.map((group) => (
                                                    <CheckboxGroup.Item value={group.id}>{group.name}</CheckboxGroup.Item>

                                                ))
                                            }
                                        </Grid>
                                    </CheckboxGroup.Root>

                                </label>
                                <label>
                                    <Text as="div" size="2" mb="1" weight="bold">
                                        Transaction Time
                                    </Text>
                                    <DateSelection value={date} onChange={setDate}/>
                                </label>
                            </Flex>

                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button variant="soft" color="gray">
                                        Cancel
                                    </Button>
                                </Dialog.Close>
                                <Dialog.Close>
                                    <Button onClick={() => handleUpdate()}>Save</Button>
                                </Dialog.Close>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Root>

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
    const [searchParams, setSearchParams] = useSearchParams()
    const [showFilters, setShowFilters] = useState(false)
    const [desc, setDesc] = useState<string | null>(() => {
        const initialDesc = searchParams.get('desc')?.trim()
        return initialDesc ? initialDesc : null
    })

    const [transFilters, setTransFilters] = useState<TransactionFilter>({
        "from_amount":  null,
        "to_amount":  null,
        "desc": desc,
        "tType": null,
        "method": null,
        "from_date": null,
        "to_date": null,
        "group": null,
        "page": 0,
        "limit": 10
    })

    const updateDesc = (val: string) => {
        const newVal = val.trim()
        const nextDesc = newVal ? newVal : null
        setDesc(nextDesc)

        const nextParams = new URLSearchParams(searchParams)
        if (nextDesc) {
            nextParams.set('desc', nextDesc)
        } else {
            nextParams.delete('desc')
        }
        setSearchParams(nextParams)
    }

    
    const {data: transactions, refetch: refetchTrans, isPending: loadingTransactions} = useGetTransactions(user?.id || "", 0, 25, transFilters)
    const {data: userMethodsData, isPending: loadingMethods} = useGetMethods(user?.id || "",0,100)
    const {data: userGroupsData, isPending: loadingGroups} = useGetGroups(user?.id || "", 0, 100)
    const navigate = useNavigate()

    useEffect(() => {
        console.log("filters updated refetching transactions")
        console.log(transFilters)
        refetchTrans()
    }, [transFilters])
    useEffect(() => {
        console.log("transactions: ",transactions)
    }, [transactions])

    if (loadingTransactions || loading || loadingMethods || loadingGroups){
        return <LoadingComponent/>
    }

    return (
        <Box className="w-full p-5">
            <Text className="pt-3">Welcome to your transactions page!</Text>
            <Card className="w-full min-h-[10] h-vh mt-4 mb-4">
                <Text>
                    Transaction List
                </Text>
                <Flex align="center" gap="2" my="2">
                    <TextField.Root className="w-full" value={desc ?? ''} onChange={((e) => updateDesc(e.target.value))}>
                    </TextField.Root>
                    <SearchIcon onClick={() => setTransFilters((prev) => ({...prev, desc: desc || null}))}/>
                    <FilterIcon onClick={() => setShowFilters((prev) => !prev)}/>
                </Flex>
                <Flex justify="end" direction="column">
                <Flex justify={"end"} className='w-full'>
                </Flex>
                {
                    showFilters && <FiltersSelection updateFilter={setTransFilters} userGroups={userGroupsData?.data || []} userMethods={userMethodsData?.data || []}/>
                }
                </Flex>
                <Card className="h-full">
                    <Flex direction="column" className="">
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
                                        <TransactionDisplayComponent record={record} userMethods={userMethodsData?.data || []} userGroups={userGroupsData?.data || []}/>
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
                    <Button radius="full" variant="outline" onClick={() => navigate('/dashboard')}>Home</Button>
                </Flex>
            </Card>
        </Box>
    )
}