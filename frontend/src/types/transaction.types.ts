import type { UserGroupings } from "./user.types";

export interface Transaction {
    id: string,
    accountID: string,
    amount: number,
    description: string,
    category: string,
    type: boolean,
    method: string,
    methodName: string
    transaction_time: Date,
    groups: Omit<UserGroupings, "accountID">[],
}
export interface CreateTransactionInput {
    accountID: string,
    amount: number,
    description: string,
    category: string,
    type: boolean,
    method: string,
    date: Date,
    groups: string[],
}

export interface TransactionFilter {
    from_amount: number | null,
    to_amount: number | null,
    desc: string | null,
    tType: boolean | null,
    method: string | null,
    from_date: string | null,
    to_date: string | null,
    group: string | null,
    page: number,
    limit: number
}