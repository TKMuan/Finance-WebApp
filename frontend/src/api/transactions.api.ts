import type { CreateTransactionInput, Transaction, TransactionFilter } from "../types"

const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";

export const create_transaction = async (data: CreateTransactionInput) => {
    console.log("create_transaction called")
    console.log("data: ", data)
    const {
        tType, ...payload
    } = data
    payload
    console.log("payload data: ", payload)
    const response = await fetch(`${BACKEND_API}/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({...payload,
        groups: data.groups.map(record=> record.id),
        method: data.method.id,
        type: data.tType})
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json()
    console.log("recieved: ", recieved)
    return recieved;
}

export const update_transaction = async (method_details: Transaction) => {
    const response = await fetch(`${BACKEND_API}/transactions/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method_details),
    })
    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const retrieve_all_transactions = async (
    accountID: string, 
    page: number, 
    size: number,
    filters: TransactionFilter
) => {
    console.log("Recieved filters: ", filters)
    const filterVals = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value != null))
    console.log("FilterVals: ", filterVals)
    const query = new URLSearchParams({
        accountID: accountID,
        limit: String(size),
        page: String(page),
        ...filterVals
    });

    const response = await fetch(`${BACKEND_API}/transactions/all?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    recieved.data.data = recieved.data.data.map((record: Transaction) => {
        return {...record, transaction_time: new Date(record.transaction_time)}
    })  
    return recieved.data;
}

export const retrieve_transaction = async (id: string, accountID: string) => {
    const query = new URLSearchParams({
        accountID: accountID,
        id: id
    });

    const response = await fetch(`${BACKEND_API}/transactions?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const delete_transaction = async (id: string,) => {
    const query = new URLSearchParams({
        "transID": id,
    })
    const response = await fetch(`${BACKEND_API}/transactions/?${query.toString()}`, {
        method: "DELETE",
        credentials: "include",
    })
    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const retrieve_transaction_dashboard = async (accountID: string) => {
    const query = new URLSearchParams({
        accountID: accountID
    });

    const response = await fetch(`${BACKEND_API}/transactions/dashboard?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}