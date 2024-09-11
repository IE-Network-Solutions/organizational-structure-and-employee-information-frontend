import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { FiscalYear } from './interface';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
/* eslint-disable @typescript-eslint/naming-convention */

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const createFiscalYear = async (fiscalYear: FiscalYear) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars`,
    method: 'POST',
    data: fiscalYear,
    headers,
  });
};

const updateFiscalYear = async (id: string, fiscalYear: FiscalYear) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${id}`,
    method: 'PATCH',
    data: fiscalYear,
    headers,
  });
};

const deleteFiscalYear = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${id}`,
    method: 'DELETE',
    headers,
  });
};

export const useCreateFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation(createFiscalYear, {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
    },
  });
};

export const useUpdateFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: string; fiscalYear: FiscalYear }) =>
      updateFiscalYear(data.id, data.fiscalYear),
    {
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('fiscalYears');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

export const useDeleteFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteFiscalYear(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
    },
  });
};

/* eslint-enable @typescript-eslint/naming-convention */
