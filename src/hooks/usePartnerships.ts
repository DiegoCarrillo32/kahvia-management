import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as partnershipService from '../services/partnershipService';

export const usePartnerships = () => {
  return useQuery({
    queryKey: ['partnerships'],
    queryFn: partnershipService.getPartnerships,
  });
};

export const useRequestPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['requestPartnership'],
    mutationFn: partnershipService.requestPartnership,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['partnerships'] });
    },
  });
};

export const useAcceptPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['acceptPartnership'],
    mutationFn: partnershipService.acceptPartnership,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['partnerships'] });
    },
  });
};

export const useRejectPartnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['rejectPartnership'],
    mutationFn: partnershipService.rejectPartnership,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['partnerships'] });
    },
  });
};
