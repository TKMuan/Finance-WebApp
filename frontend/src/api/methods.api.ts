import type { CreateMethodInput, UserMethods } from "../types"

const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";

export const create_method = async (data: CreateMethodInput) => {
    console.log("create_method called")
    console.log("data: ", data)
    const response = await fetch(`${BACKEND_API}/method/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json()
    console.log("recieved: ", recieved)
    return recieved;
}

export const update_method = async (method_details: UserMethods) => {
    const response = await fetch(`${BACKEND_API}/method/`, {
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

export const retrieve_methods = async (accountID: string, page: number, size: number) => {
    const query = new URLSearchParams({
        id: accountID,
        limit: String(size),
        page: String(page),
    });

    const response = await fetch(`${BACKEND_API}/method/all?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const retrieve_method = async (id: string, accountID: string) => {
    const query = new URLSearchParams({
        accountID: accountID,
        id: id
    });

    const response = await fetch(`${BACKEND_API}/method?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const delete_method = async (id: string, accountID: string) => {
    const query = new URLSearchParams({
        "id": id,
        "accountID": accountID
    })
    const response = await fetch(`${BACKEND_API}/method/?${query.toString()}`, {
        method: "DELETE",
        credentials: "include",
    })
    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}