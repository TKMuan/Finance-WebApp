import type { Pagination, UserMethods, CreateUserMethodsInput} from "../types";
import { useQuery, queryOptions, useQueryClient, useMutation } from "@tanstack/react-query"
import { retrieve_methods, retrieve_method, create_method, update_method, delete_method} from "../api";
import { useNavigate } from "react-router-dom";

export const useGetMethodsOptions = (id: string, page: number, size: number) => {
  return queryOptions<Pagination<UserMethods>>(
    {
      queryKey: ['userMethods', id, page, size],
      queryFn: async () => retrieve_methods(id, page, size),
      enabled: Boolean(id),
    }
  )
}

export function useGetMethods(id: string, page: number = 0, size: number = 10) {
  console.log('id: ', id)
  return useQuery<Pagination<UserMethods>>(useGetMethodsOptions(id, page, size));
}

export const useGetMethodOptions = (id: string, accountID: string) => {
  return queryOptions<UserMethods>(
    {
      queryKey: ['userMethods', id, accountID],
      queryFn: async () => retrieve_method(id, accountID),
      enabled: Boolean(id),
    }
  )
}
export function useGetMethod(id: string, accountID: string) {
  console.log('id: ', id)
  return useQuery<UserMethods>(useGetMethodOptions(id, accountID));
}

// Mutation
export function useCreateMethod() {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (payload: CreateUserMethodsInput) => create_method(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMethods'] });
      navigate("/methods")
    },
  });
}

export function useUpdateMethod() { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserMethods) => update_method(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMethods']})
    }
  })
}

export function useDeleteMethod() { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, accountID }: { id: string; accountID: string }) => delete_method(id, accountID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMethods']})
    }
  })
}

export const MethodHooks = {
  "create": useCreateMethod,
  "update": useUpdateMethod,
}