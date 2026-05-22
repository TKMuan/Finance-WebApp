import { useContext } from 'react';
import { AuthContext } from '../context';
import { useMutation, useQuery } from '@tanstack/react-query'
import { checkActiveSessionApi, loginApi, registerApi } from '../api';
import type { CreateUserInput, LoginCredentials, User } from '../types';

export const useAuth = () => useContext(AuthContext);

export const useActiveSession = () => useQuery({
    queryKey: ['auth', 'active-session'],
    queryFn: checkActiveSessionApi,
    staleTime: 0,
    retry: false,
})

export const useLoginMutation = () => useMutation({
    mutationFn: ({ email, password }: LoginCredentials) => loginApi(email, password),
})

export const useRegisterMutation = () => useMutation({
    mutationFn: ({ email, password, fname, lname }: CreateUserInput) => registerApi(email, password, fname, lname),
})

export type AuthUser = User