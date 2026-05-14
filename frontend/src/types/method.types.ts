export interface Methods{
    id: string,
    name: string,
    accountID: string
}

export type CreateMethodInput = Omit<Methods, "id">