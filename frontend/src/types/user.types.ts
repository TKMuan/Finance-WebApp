export interface User{
    id: string,
    fname: string,
    lname: string,
    mname: string
}

export interface Account{
    id: string,
    email: string,
    password: string,
    fname: string,
    lname: string,
    mname: string
}

export type CreateUserInput = Omit<Account, 'id'>

export interface UserGroupings{
    id: string,
    name: string,
    accountID: string,
    parent: string
}

export type CreateUserGroupingInput = Omit<UserGroupings, 'id'>;

export interface UserMethods{
    id: string,
    name: string,
    accountID: string
}

export type CreateUserMethodsInput = Omit<UserMethods, 'id'>