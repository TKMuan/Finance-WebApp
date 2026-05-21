import type { Pagination, UserGroupings, CreateUserGroupingInput} from "../types";
import { useQuery, queryOptions, useQueryClient, useMutation } from "@tanstack/react-query"
import { retrieve_groupings,retrieve_grouping, create_grouping, update_grouping, delete_grouping} from "../api";
import { useNavigate } from "react-router-dom";

export const useGetGroupsOptions = (id: string, page: number, size: number, searchGroup: string | null = null) => {
  return queryOptions<Pagination<UserGroupings>>(
    {
      queryKey: ['userGroups', id, page, size],
      queryFn: async () => retrieve_groupings(id, page, size, searchGroup),
      enabled: Boolean(id),
    }
  )
}

export function useGetGroups(id: string, page: number = 0, size: number = 10, searchGroup: string | null = null) {
  console.log('id: ', id)
  return useQuery<Pagination<UserGroupings>>(useGetGroupsOptions(id, page, size, searchGroup));
}

export const useGetGroupOptions = (id: string, accountID: string) => {
  return queryOptions<UserGroupings>(
    {
      queryKey: ['userGroups', id, accountID],
      queryFn: async () => retrieve_grouping(id, accountID),
      enabled: Boolean(id),
    }
  )
}
export function useGetGroup(id: string, accountID: string) {
  console.log('id: ', id)
  return useQuery<UserGroupings>(useGetGroupOptions(id, accountID));
}

// Mutation
export function useCreateGroup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  
  return useMutation({
    mutationFn: (payload: CreateUserGroupingInput) => create_grouping(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      navigate("/groups")
    },
  });
}

export function useUpdateGroup() { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserGroupings) => update_grouping(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGroups']})
    }
  })
}

export function useDeleteGroup() { const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, accountID }: { id: string; accountID: string }) => delete_grouping(id, accountID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGroups']})
    }
  })
}
