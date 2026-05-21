interface Grouping{
    id: string, 
    name: string,
    accountID: string,
}

export type CreateGroupingInput = Omit<Grouping, 'id'>;

export type CreateGroupingParent = Omit <Grouping, "parent" | "id">;
export type CreateGroupingChild = Omit <Grouping, "parent" | "id" | "accountID" >;