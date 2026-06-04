import { useAuth, useGetMethods, useGetGroups, useCreateTransaction } from '../hooks'
import { DateSelection, LoadingComponent } from '../components'
import { useEffect, useRef, useState } from 'react'
import type { CreateTransactionInput, UserGroupings } from '../types'
import './transactions.create.css'
import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'

export const TransactionCreate = () => {
    const {user, loading} = useAuth()

    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false)
    const groupMenuRef = useRef<HTMLDivElement | null>(null)

    const {data: userMethodData, isPending: gettingMethods} = useGetMethods(user?.id || "")
    const {data: userGroupData, isPending: gettingGroups} = useGetGroups(user?.id || "")
    const {mutate: createTransaction, isPending: creatingTransaction} = useCreateTransaction()
    const navigate = useNavigate()

    const [FormData, setFormData] = useState<CreateTransactionInput>({
        amount: 0,
        description: "",
        method: userMethodData?.data[0] || {id: "", name: ''},
        transaction_time: selectedDate,
        accountID: user?.id || "",
        groups: [],
        type: false
    })

    useEffect(() => {
        setFormData(prev => ({...prev, transaction_time: selectedDate}))
    }, [selectedDate])

    useEffect(() => {
        if (userMethodData?.data.length && !FormData.method.id) {
            setFormData((prev) => ({...prev, method: userMethodData.data[0]}))
        }
    }, [userMethodData, FormData.method.id])

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (groupMenuRef.current && !groupMenuRef.current.contains(event.target as Node)) {
            }
        }

        document.addEventListener("mousedown", handlePointerDown)
        return () => document.removeEventListener("mousedown", handlePointerDown)
    }, [])

    const addGroup = (record: Omit<UserGroupings, 'accountID'>) => {
        const exist = FormData.groups.some(user => user.id === record.id) 

        if (!exist){
            setFormData((prev) => ({...prev, groups: [...prev.groups, record]}))
        }
    }
    const removeGroup = (id: string) => {
        setFormData((prev) => (
            {...prev, groups: prev.groups.filter(user => user.id !== id)}
        ))
    }
    const onSubmit = () => {
         console.log("Creating transaction with data: ", FormData)
         createTransaction(FormData)
    }

    if (loading || gettingGroups || gettingMethods || creatingTransaction) {
        return <LoadingComponent/>
    }
    return (
        <div className="app-page">
            <div className="app-shell">
                <div className="app-frame">
                    <div className="app-topbar">
                        <div className="app-topbar__row">
                            <div>
                                <h1 className="app-title">New Transaction</h1>
                                <p className="app-subtitle">Create a payment entry with the same look and feel as the rest of the app.</p>
                            </div>
                        </div>
                    </div>

                    <div className="app-content">
                        <section className="app-section transaction-create-section">
                            <div className="app-section__header">
                                <h2 className="app-section__title">Transaction Details</h2>
                            </div>

                            <div className="transaction-create-grid">
                                <label className="app-filter-field">
                                    <span className="app-filter-label">Amount</span>
                                    <input
                                        className="app-input app-input--full"
                                        placeholder="Amount"
                                        type="number"
                                        required
                                        value={FormData.amount}
                                        onChange={(e) => {
                                            const parsed = Number.parseFloat(e.target.value)
                                            setFormData((prev) => ({...prev, amount: Number.isNaN(parsed) ? 0 : parsed}))
                                        }}
                                    />
                                </label>

                                <label className="app-filter-field">
                                    <span className="app-filter-label">Description</span>
                                    <input
                                        className="app-input app-input--full"
                                        placeholder="Description"
                                        value={FormData.description}
                                        onChange={(e) => setFormData((prev) => ({...prev, description: e.target.value}))}
                                    />
                                </label>

                                <div className="transaction-create-section-block">
                                    <span className="app-filter-label">Type of Transaction</span>
                                    <div className="transaction-create-radio-grid transaction-create-radio-grid--compact">
                                        <label className={`transaction-create-radio-card ${!FormData.type ? 'transaction-create-radio-card--selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="transaction-type"
                                                checked={!FormData.type}
                                                onChange={() => setFormData((prev) => ({...prev, type: false}))}
                                            />
                                            <span className="transaction-create-radio-card__copy">
                                                <span className="transaction-create-radio-card__title">Credit</span>
                                                <span className="transaction-create-radio-card__subtitle">Incoming funds</span>
                                            </span>
                                        </label>
                                        <label className={`transaction-create-radio-card ${FormData.type ? 'transaction-create-radio-card--selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="transaction-type"
                                                checked={FormData.type}
                                                onChange={() => setFormData((prev) => ({...prev, type: true}))}
                                            />
                                            <span className="transaction-create-radio-card__copy">
                                                <span className="transaction-create-radio-card__title">Debit</span>
                                                <span className="transaction-create-radio-card__subtitle">Outgoing funds</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="transaction-create-section-block">
                                    <span className="app-filter-label">Transaction Method</span>
                                    {
                                        userMethodData?.data.length ?
                                        <div className="transaction-create-radio-grid">
                                            {
                                                userMethodData.data.map((data) => (
                                                    <label key={data.id} className={`transaction-create-radio-card ${FormData.method.id === data.id ? 'transaction-create-radio-card--selected' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name="transaction-method"
                                                            checked={FormData.method.id === data.id}
                                                            onChange={() => setFormData((prev) => ({...prev, method: data}))}
                                                        />
                                                        <span className="transaction-create-radio-card__copy">
                                                            <span className="transaction-create-radio-card__title">{data.name}</span>
                                                            <span className="transaction-create-radio-card__subtitle">Method</span>
                                                        </span>
                                                    </label>
                                                ))
                                            }
                                        </div> :
                                        <div className="transaction-create-alert">
                                            <Info className="transaction-create-alert__icon" />
                                            <div className="transaction-create-alert__body">
                                                <p className="transaction-create-alert__text">You need to create a method of payment to be able to create a transaction.</p>
                                                <button type="button" className="app-button app-button--subtle" onClick={() => navigate('/methods/create')}>
                                                    Go to Create Method Page
                                                </button>
                                            </div>
                                        </div>
                                    }
                                </div>

                                <label className="app-filter-field">
                                    <span className="app-filter-label">Transaction Date</span>
                                    <DateSelection
                                        value={selectedDate}
                                        onChange={setSelectedDate}
                                    />
                                </label>

                                <div className="transaction-create-section-block">
                                    <span className="app-filter-label">Transaction Groups</span>
                                    <div className="transaction-create-group-selected">
                                        {
                                            FormData.groups.length ? FormData.groups.map((record) => (
                                                <button
                                                    key={record.id}
                                                    type="button"
                                                    className="transaction-create-chip"
                                                    onClick={() => removeGroup(record.id)}
                                                >
                                                    <span>{record.name}</span>
                                                    <span className="transaction-create-chip__remove">×</span>
                                                </button>
                                            )) : <span className="transaction-create-empty">No groups selected yet.</span>
                                        }
                                    </div>

                                    <div className="transaction-create-group-picker" ref={groupMenuRef}>
                                        <button
                                            type="button"
                                            className="app-button app-button--subtle"
                                            onClick={() => setIsGroupMenuOpen((prev) => !prev)}
                                            disabled={!userGroupData?.data.length}
                                        >
                                            Add Group
                                        </button>

                                        {isGroupMenuOpen && userGroupData?.data.length ? (
                                            <div className="transaction-create-group-menu" role="menu" aria-label="Add group">
                                                {userGroupData.data.map((record) => (
                                                    <button
                                                        key={record.id}
                                                        type="button"
                                                        className="transaction-create-group-menu__item"
                                                        onClick={() => {
                                                            addGroup(record)
                                                            setIsGroupMenuOpen(false)
                                                        }}
                                                    >
                                                        {record.name}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="transaction-create-actions">
                                <button
                                    type="button"
                                    className="app-button app-button--subtle"
                                    onClick={() => navigate('/transactions')}
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    className="app-button app-button--primary"
                                    onClick={onSubmit}
                                    disabled={!userMethodData?.data.length}
                                >
                                    Create Transaction
                                </button>
                                <button
                                    type="button"
                                    className="app-button app-button--subtle"
                                    onClick={() => navigate('/dashboard')}
                                >
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