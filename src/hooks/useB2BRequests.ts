import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as b2bRequestService from '../services/b2bRequestService';
import { B2BRequestStatus, B2BRequestType } from '../types/partnership';

export const useB2BRequests = () => {
  return useQuery({
    queryKey: ['b2bRequests'],
    queryFn: b2bRequestService.getB2BRequests,
  });
};

export const useSendB2BRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['sendB2BRequest'],
    mutationFn: ({ partnershipId, receiverId, receiverBusinessName, type, message }: {
      partnershipId: string;
      receiverId: string;
      receiverBusinessName: string;
      type: B2BRequestType | string;
      message: string;
    }) => b2bRequestService.sendB2BRequest(partnershipId, receiverId, receiverBusinessName, type, message),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['b2bRequests'] });
    },
  });
};

export const useAddRequestUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['addRequestUpdate'],
    mutationFn: ({ requestId, newStatus, updateMessage }: {
      requestId: string;
      newStatus: B2BRequestStatus;
      updateMessage: string;
    }) => b2bRequestService.addRequestUpdate(requestId, newStatus, updateMessage),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['b2bRequests'] });
    },
  });
};
