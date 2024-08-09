import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL, tenantId } from '@/utils/constants';
import { FiscalYear } from './interface';

const headers = {
  tenantId: tenantId,
};

const createFiscalYear = async (fiscalYear: FiscalYear) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/calendars`, method: 'POST', data: fiscalYear, headers });
};

const updateFiscalYear = async (id: string, fiscalYear: FiscalYear) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/calendars/${id}`, method: 'PATCH', data: fiscalYear, headers });
};

const deleteFiscalYear = async (id: string) => {
  return await crudRequest({ url: `${ORG_AND_EMP_URL}/calendars/${id}`, method: 'DELETE', headers });
};

export const useCreateFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation(createFiscalYear, {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
    },
  });
};

export const useUpdateFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation((data: { id: string; fiscalYear: FiscalYear }) => updateFiscalYear(data.id, data.fiscalYear), {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
    },
  });
};

export const useDeleteFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteFiscalYear(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
    },
  });
};
