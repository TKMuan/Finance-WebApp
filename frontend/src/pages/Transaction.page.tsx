import { useAuth, useUpdateTransaction } from '../hooks'
import { useEffect, useRef, useState} from 'react'
import type { Dispatch, SetStateAction} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon, Trash2, X, FilterIcon, ArrowLeft, ArrowRight, Pencil } from 'lucide-react'
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
        <div className="app-filter-panel app-filter-grid">
            <div className="app-filter-grid app-filter-grid--two">
                <div className="app-filter-field">
                    <span className="app-filter-label">From Date</span>
                    <DateSelection value={fromDate} onChange={setFromDate}/>
                </div>
                <div className="app-filter-field">
                    <span className="app-filter-label">To Date</span>
                    <DateSelection value={toDate} onChange={setToDate}/>
                </div>
            </div>

            <div className="app-filter-grid app-filter-grid--two">
                <div className="app-filter-field">
                    <span className="app-filter-label">From Amount</span>
                    <input
                        className="app-input app-input--full"
                        type="number"
                        value={fromAmount ?? ''}
                        onChange={(e) => {
                            const parsed = parseInt(e.target.value)
                            setFromAmount(Number.isNaN(parsed) ? undefined : parsed)
                        }}
                    />
                </div>
                <div className="app-filter-field">
                    <span className="app-filter-label">To Amount</span>
                    <input
                        className="app-input app-input--full"
                        type="number"
                        value={toAmount ?? ''}
                        onChange={(e) => {
                            const parsed = parseInt(e.target.value)
                            setToAmount(Number.isNaN(parsed) ? undefined : parsed)
                        }}
                    />
                </div>
            </div>

            <div className="app-filter-grid app-filter-grid--two">
                <div className="app-filter-field">
                    <span className="app-filter-label">Method</span>
                    <select
                        className="app-select app-input--full"
                        value={method?.id ?? ''}
                        onChange={(e) => {
                            const selectedMethod = userMethods.find((record) => record.id === e.target.value) ?? null
                            setMethod(selectedMethod)
                        }}
                    >
                        <option value="">Any</option>
                        {userMethods.map((record) => (
                            <option key={record.id} value={record.id}>
                                {record.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="app-filter-field">
                    <span className="app-filter-label">Group</span>
                    <select
                        className="app-select app-input--full"
                        value={group?.id ?? ''}
                        onChange={(e) => {
                            const selectedGroup = userGroups.find((record) => record.id === e.target.value) ?? null
                            setGroup(selectedGroup)
                        }}
                    >
                        <option value="">Any</option>
                        {userGroups.map((record) => (
                            <option key={record.id} value={record.id}>
                                {record.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="app-filter-field">
                <span className="app-filter-label">Type</span>
                <select
                    className="app-select app-input--full"
                    value={type === null ? '' : String(type)}
                    onChange={(e) => {
                        const nextType = e.target.value === '' ? null : e.target.value === 'true'
                        setType(nextType)
                    }}
                >
                    <option value="">Any</option>
                    <option value="false">Credit</option>
                    <option value="true">Debit</option>
                </select>
            </div>

            <div className="app-filter-actions">
                <button type="button" className="app-button app-button--subtle" onClick={() => setSearchParams({})}>
                    Clear
                </button>
                <button type="button" className="app-button app-button--primary" onClick={updateFilterVals}>
                    Search
                </button>
            </div>
        </div>
    )
}
interface TransactionDisplayProp {
    record: Transaction,
    userMethods: UserMethods[] 
    userGroups: UserGroupings[]
}

const TransactionDisplayComponent = ({record, userMethods, userGroups}: TransactionDisplayProp) => {

    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
    const {isPending: pendingDelete, mutate: deleteMethod} = useDeleteTransaction()
    const {isPending: pendingUpdate, mutate: updateTransaction} = useUpdateTransaction()
    const [groups, setGroups] = useState(record.groups.map(rec => rec.id))
    const [date, setDate] = useState(new Date(record.transaction_time))
    const editDialogRef = useRef<HTMLDialogElement | null>(null)
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
    useEffect(() => {
        const dialog = editDialogRef.current

        if (!dialog) {
            return
        }

        if (isEditOpen && !dialog.open) {
            dialog.showModal()
        }

        if (!isEditOpen && dialog.open) {
            dialog.close()
        }
    }, [isEditOpen])

    if (pendingDelete){
        return <span>Deleting...</span>
    }
    if (pendingUpdate){
        return <span>Updating...</span>
    }
    const isDebit = record.type

    return (
        <div className={`transaction-card ${isDebit ? 'transaction-card--debit' : 'transaction-card--credit'}`}>
            <div className="transaction-card__body">
                <p className="transaction-title">{record.description}</p>
                <div className="transaction-meta-row">
                    <span className={`transaction-pill ${isDebit ? 'transaction-amount--debit' : 'transaction-amount--credit'}`}>
                        {record.amount}
                    </span>
                    <span className={`transaction-pill ${isDebit ? 'transaction-pill--debit' : 'transaction-pill--credit'}`}>
                        {record.methodName}
                    </span>
                    <span className={`transaction-pill ${isDebit ? 'transaction-pill--debit' : 'transaction-pill--credit'}`}>
                        {record.transaction_time.getDate()}-{record.transaction_time.getMonth() + 1}-{record.transaction_time.getFullYear()}
                    </span>
                </div>
                <div className="transaction-group-row">
                    {
                        record.groups?.map((groupRecord) => (
                            <span key={groupRecord.id} id={groupRecord.id} className={`transaction-pill ${isDebit ? 'transaction-pill--debit' : 'transaction-pill--credit'}`}>
                                {groupRecord.name}
                            </span>
                        ))
                    }
                </div>
            </div>
            <div className="transaction-card__actions">
                    <button
                        type="button"
                        className="app-icon-button transaction-card__icon-button"
                        onClick={() => setIsEditOpen(true)}
                        aria-label="Edit transaction"
                    >
                        <Pencil size={18} />
                    </button>

                    {isEditOpen && (
                        <dialog
                            ref={editDialogRef}
                            className="transaction-dialog"
                            onClose={() => setIsEditOpen(false)}
                            onCancel={(event) => {
                                event.preventDefault()
                                setIsEditOpen(false)
                            }}
                        >
                            <form className="transaction-dialog__content" method="dialog">
                                <div>
                                    <h3 className="transaction-dialog__title">Edit Transaction</h3>
                                    <p className="transaction-dialog__description">Make changes to your transaction.</p>
                                </div>

                                <div className="transaction-dialog__form">
                                    <label className="transaction-dialog__field">
                                        <span className="transaction-dialog__label">Amount</span>
                                        <input
                                            className="app-input app-input--full"
                                            value={updateData.amount}
                                            type="number"
                                            placeholder="Enter Amount"
                                            onChange={(e) => setUpdateData((prev) => ({...prev, amount: Number.parseInt(e.target.value, 10)}))}
                                        />
                                    </label>

                                    <label className="transaction-dialog__field">
                                        <span className="transaction-dialog__label">Description</span>
                                        <input
                                            className="app-input app-input--full"
                                            value={updateData.description}
                                            placeholder="Enter description"
                                            onChange={(e) => setUpdateData((prev) => ({...prev, description: e.target.value}))}
                                        />
                                    </label>

                                    <fieldset className="transaction-dialog__field">
                                        <legend className="transaction-dialog__label">Type</legend>
                                        <div className="transaction-dialog__option-grid transaction-dialog__option-grid--compact">
                                            <label className="transaction-dialog__choice">
                                                <input
                                                    type="radio"
                                                    name={`transaction-type-${record.id}`}
                                                    checked={updateData.type === true}
                                                    onChange={() => setUpdateData((prev) => ({...prev, type: true}))}
                                                />
                                                <span>Debit</span>
                                            </label>
                                            <label className="transaction-dialog__choice">
                                                <input
                                                    type="radio"
                                                    name={`transaction-type-${record.id}`}
                                                    checked={updateData.type === false}
                                                    onChange={() => setUpdateData((prev) => ({...prev, type: false}))}
                                                />
                                                <span>Credit</span>
                                            </label>
                                        </div>
                                    </fieldset>

                                    <fieldset className="transaction-dialog__field">
                                        <legend className="transaction-dialog__label">Method</legend>
                                        <div className="transaction-dialog__option-grid">
                                            {userMethods.map((method) => (
                                                <label key={method.id} className="transaction-dialog__choice">
                                                    <input
                                                        type="radio"
                                                        name={`transaction-method-${record.id}`}
                                                        checked={updateData.method === method.id}
                                                        onChange={() => setUpdateData((prev) => ({...prev, method: method.id}))}
                                                    />
                                                    <span>{method.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <fieldset className="transaction-dialog__field">
                                        <legend className="transaction-dialog__label">Groups</legend>
                                        <div className="transaction-dialog__option-grid">
                                            {userGroups.map((group) => (
                                                <label key={group.id} className="transaction-dialog__choice">
                                                    <input
                                                        type="checkbox"
                                                        checked={groups.includes(group.id)}
                                                        onChange={() => setGroups((prev) => (
                                                            prev.includes(group.id)
                                                                ? prev.filter((groupId) => groupId !== group.id)
                                                                : [...prev, group.id]
                                                        ))}
                                                    />
                                                    <span>{group.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <label className="transaction-dialog__field">
                                        <span className="transaction-dialog__label">Transaction Time</span>
                                        <DateSelection value={date} onChange={setDate}/>
                                    </label>
                                </div>

                                <div className="transaction-dialog__actions">
                                    <button
                                        type="button"
                                        className="app-button app-button--subtle"
                                        onClick={() => setIsEditOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="app-button app-button--primary"
                                        onClick={() => {
                                            handleUpdate()
                                            setIsEditOpen(false)
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </dialog>
                    )}

                    {
                        confirmDelete ? 
                        <div className="transaction-card__delete-confirm">
                            <button
                                type="button"
                                className="transaction-card__icon-button"
                                onClick={() => setConfirmDelete(false)}
                                aria-label="Cancel delete"
                            >
                                <X size={18} />
                            </button>
                            <button type="button" className="app-action" onClick={() => handleDelete()}>Delete</button>
                        </div> : 

                        <button
                            type="button"
                            className="app-icon-button transaction-card__icon-button"
                            onClick={() => setConfirmDelete(true)}
                            aria-label="Delete transaction"
                        >
                            <Trash2 size={18} />
                        </button>
                        
                    }
            </div>
        </div>
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
        "limit": 20
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
    const {data: userMethodsData, isPending: loadingMethods} = useGetMethods(user?.id || "", 0, 100)
    const {data: userGroupsData, isPending: loadingGroups} = useGetGroups(user?.id || "", 0, 100)
    const navigate = useNavigate()

    useEffect(() => {
        refetchTrans()
    }, [transFilters, refetchTrans])

    if (loadingTransactions || loading || loadingMethods || loadingGroups) {
        return <LoadingComponent />
    }

    return (
        <div className="app-page">
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-topbar">
                        <div className="app-topbar__row">
                            <div>
                                <h1 className="app-title">Transactions</h1>
                                <p className="app-subtitle">Search, filter, update, and review every payment in one place.</p>
                            </div>
                        </div>
                    </div>

                    <div className="app-content">
                        <p className="app-intro">Welcome to your transactions page!</p>

                        <section className="app-section">
                            <div className="app-section__header">
                                <h2 className="app-section__title">Transaction List</h2>
                            </div>

                            <div className="app-toolbar">
                                <div className="app-toolbar__right app-input-row" style={{ justifyContent: 'flex-start' }}>
                                    <input
                                        className="app-input app-input--search max-h-12"
                                        value={desc ?? ''}
                                        onChange={(e) => updateDesc(e.target.value)}
                                        placeholder="Search transactions"
                                    />
                                    <div>
                                        <button type="button" className="app-icon-button" onClick={() => setTransFilters((prev) => ({...prev, desc: desc || null}))} aria-label="Search transactions">
                                            <SearchIcon />
                                        </button>
                                        <button type="button" className="app-icon-button ml-2"  onClick={() => setShowFilters((prev) => !prev)} aria-label="Toggle filters">
                                            <FilterIcon />
                                        </button>

                                    </div>
                                <div className="app-toolbar__split-right max-w-24">
                                    <select
                                        className="app-select app-input--full"
                                        value={transFilters.limit}
                                        onChange={(e) => setTransFilters((prev) => ({ ...prev, limit: Number.parseInt(e.target.value, 10) }))}
                                    >
                                        <option value={20}>20</option>
                                        <option value={35}>35</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                                </div>
                            </div>

                            {showFilters && (
                                <div className="app-stack">
                                    <FiltersSelection updateFilter={setTransFilters} userGroups={userGroupsData?.data || []} userMethods={userMethodsData?.data || []} />
                                </div>
                            )}

                            <div className="app-toolbar app-toolbar--split">
                                <div />
                                <div className="app-toolbar__split-center">
                                    <button type="button" className="app-button app-button--subtle w-full" onClick={() => navigate('/transactions/create')}>
                                        Create Transaction
                                    </button>
                                </div>
                            </div>

                            <div className="app-list">
                                {transactions ? transactions.data.map((record) => (
                                    <div key={record.id} id={record.id} className="app-list-card">
                                        <TransactionDisplayComponent
                                            record={record}
                                            userMethods={userMethodsData?.data || []}
                                            userGroups={userGroupsData?.data || []}
                                        />
                                    </div>
                                )) : null}
                            </div>

                            <div className="app-toolbar" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
                                <button type="button" className="app-button app-button--subtle" disabled={transFilters.page === 0} onClick={() => setTransFilters((prev) => ({...prev, page: prev.page - 1}))}>
                                    <ArrowLeft />
                                </button>
                                <span className="transaction-page__index">{transFilters.page + 1}</span>
                                <button type="button" className="app-button app-button--subtle" disabled={transactions?.data.length !== transFilters.limit} onClick={() => setTransFilters((prev) => ({...prev, page: prev.page + 1}))}>
                                    <ArrowRight />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                                <button type="button" className="app-button app-button--subtle" onClick={() => navigate('/dashboard')}>
                                    Home
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}