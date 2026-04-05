import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as clientService from '../services/clientService';
import { Client } from '../types/client';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getClients,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientService.addClient,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: Partial<Omit<Client, 'id' | 'createdAt' | 'userId'>> }) => 
      clientService.updateClient(clientId, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useClient = (clientId: string) => {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientService.getClient(clientId),
    enabled: !!clientId,
  });
};
