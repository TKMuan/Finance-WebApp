import type { CreateGroupingInput, UserGroupings } from "../types"

const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";

export const create_grouping = async (data: CreateGroupingInput) => {
    console.log("create_grouping called")
    console.log("data: ", data)
    const response = await fetch(`${BACKEND_API}/groupings/`, {
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

export const update_grouping = async (grouping_details: UserGroupings) => {
    const response = await fetch(`${BACKEND_API}/groupings/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grouping_details),
    })
    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const retrieve_groupings = async (
    accountID: string, 
    page: number, 
    size: number,
    searchGroup: string | null
) => {
    const query = new URLSearchParams({
        accountID: accountID,
        limit: String(size),
        page: String(page),
        name: searchGroup || "" 
    });

    const response = await fetch(`${BACKEND_API}/groupings/all?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const retrieve_grouping = async (id: string, accountID: string) => {
    const query = new URLSearchParams({
        accountID: accountID,
        id: id
    });

    const response = await fetch(`${BACKEND_API}/groupings/?${query.toString()}`, {
        method: "GET",
        credentials: "include",
    })

    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}

export const delete_grouping = async (id: string, accountID: string) => {
    const query = new URLSearchParams({
        "id": id,
        "accountID": accountID
    })
    const response = await fetch(`${BACKEND_API}/groupings/?${query.toString()}`, {
        method: "DELETE",
        credentials: "include",
    })
    if (!response.ok) throw new Error("");
    const recieved = await response.json();
    console.log("recieved: ", recieved)
    return recieved.data;
}
