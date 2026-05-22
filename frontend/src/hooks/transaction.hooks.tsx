import type { Pagination, Transaction, CreateTransactionInput, TransactionFilter} from "../types";
import { useQuery, queryOptions, useQueryClient, useMutation } from "@tanstack/react-query"
import { retrieve_transaction, retrieve_all_transactions, create_transaction, update_transaction, delete_transaction, retrieve_transaction_dashboard} from "../api";
import { useNavigate } from "react-router-dom";

export const useGetTransactionsOptions = (id: string, page: number, size: number, filters: TransactionFilter) => {
  return queryOptions<Pagination<Transaction>>(
    {
      queryKey: ['userTransactions', id, page, size, filters],
      queryFn: async () => retrieve_all_transactions(id, page, size, filters),
      enabled: Boolean(id),
    }
  )
}

export function useGetTransactions(id: string, page: number = 0, size: number = 10, filters: TransactionFilter) {
  console.log('id: ', id)
  return useQuery<Pagination<Transaction>>(useGetTransactionsOptions(id, page, size, filters));
}

export const useGetTransactionOptions = (id: string, accountID: string) => {
  return queryOptions<Transaction>(
    {
      queryKey: ['userTransactions', id, accountID],
      queryFn: async () => retrieve_transaction(id, accountID),
      enabled: Boolean(id),
    }
  )
}
export function useGetTransaction(id: string, accountID: string) {
  console.log('id: ', id)
  return useQuery<Transaction>(useGetTransactionOptions(id, accountID));
}
export function useGetTransactionDashboard(accountID: string) {
  return useQuery({
    queryKey: ["transactionDashboard"],
    queryFn: async () => retrieve_transaction_dashboard(accountID)
  });
}

// Mutation
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (payload: CreateTransactionInput) => create_transaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      navigate("/transactions")
    },
  });
}

export function useUpdateTransaction() { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Transaction) => update_transaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTransactions']})
    }
  })
}

export function useDeleteTransaction() { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => delete_transaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTransactions']})
    }
  })
}
