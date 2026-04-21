import { useQuery } from '@tanstack/react-query';
import { apiFetchAuth, isAuthenticated } from '../modules/API/API';

export const fetchCurrentUser = () =>
    apiFetchAuth('/api/me').then((r) => r?.user || null);

export const useCurrentUser = () =>
    useQuery({
        queryKey: ['me'],
        queryFn: fetchCurrentUser,
        enabled: isAuthenticated(),
        staleTime: 60_000,
    });
