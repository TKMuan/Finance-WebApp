export interface User{
    id: string,
    fname: string,
    email: string
}


export interface Account{
    id: string,
    email: string,
    password: string,
    fname: string,
    lname: string,
    mname: string
}

export type LoginCredentials = Omit<Account, "id" | "fname" | "lname" | "mname">;

export type CreateUserInput = Omit<Account, 'id'>

export interface UserGroupings{
    id: string,
    name: string,
    accountID: string,
}

export type CreateUserGroupingInput = Omit<UserGroupings, 'id'>;

export interface UserMethods{
    id: string,
    name: string,
    accountID: string
}

export type CreateUserMethodsInput = Omit<UserMethods, 'id'>