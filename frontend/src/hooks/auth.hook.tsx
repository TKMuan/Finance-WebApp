import { useContext } from 'react';
import { AuthContext } from '../context';
import { useQuery } from "@tanstack/react-query"
import { checkActiveSessionApi, loginApi, logoutApi} from '../api';
import type { LoginCredentials } from '../types';

export const useAuth = () => useContext(AuthContext);
