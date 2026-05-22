import type { UserGroupings, UserMethods } from "./user.types";

export interface Transaction {
    id: string,
    accountID: string,
    amount: number,
    description: string,
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
    tType: boolean,
    method: Omit<UserMethods, "accountID">,
    transaction_time: Date,
    groups: Omit<UserGroupings, "accountID">[],
}
export interface TransactionDashboard{
    name: string,
    sum: number
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