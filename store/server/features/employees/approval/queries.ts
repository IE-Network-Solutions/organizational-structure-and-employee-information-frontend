import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getAllBranchTransferRequest = async (
  pageSize: number,
  currentPage: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request?page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getBranchTransferRequestById = async (
  id: string,
  pageSize: number,
  currentPage: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request/${id}?page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getBranchTransferApproveById = async (
  id: string,
  pageSize: number,
  currentPage: number,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request/BranchRequestwithApprover/${id}?page=${currentPage}&limit=${pageSize}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getSingleTransferRequest = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/branch-request/request/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetAllBranchTransferRequest = (
  pageSize: number,
  currentPage: number,
) => {
  return useQuery<any>(['transferRequest', pageSize, currentPage], () =>
    getAllBranchTransferRequest(pageSize, currentPage),
  );
};
export const useGetBranchTransferApproveById = (
  userId: string,
  pageSize: number,
  currentPage: number,
) => {
  return useQuery<any>(
    ['transferApprovalRequest', userId, pageSize, currentPage],
    () => getBranchTransferApproveById(userId, pageSize, currentPage),
    {
      enabled: !!userId,
    },
  );
};
export const useGetBranchTransferRequestById = (
  userId: string,
  pageSize: number,
  currentPage: number,
) => {
  return useQuery<any>(
    ['myTransferRequest', userId, pageSize, currentPage],
    () => getBranchTransferRequestById(userId, pageSize, currentPage),
    {
      enabled: !!userId,
    },
  );
};
export const useGetSingleTransferRequest = (userId: string) => {
  return useQuery<any>(
    ['singleTransferRequest', userId],
    () => getSingleTransferRequest(userId),
    {
      enabled: !!userId,
    },
  );
};
