import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { ClosedDates, FiscalYear } from './interface';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const createFiscalYear = async (fiscalYear: any) => {
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
    method: 'PUT',
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
  const { closeFiscalYearDrawer } = useFiscalYearDrawerStore();
  const queryClient = useQueryClient();
  return useMutation(createFiscalYear, {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
      closeFiscalYearDrawer();
      handleSuccessMessage('PUT');
      NotificationMessage.success({
        message: 'Fiscal year created successfully!',
        description: 'Fiscal year has been successfully created',
      });
    },
  });
};

export const useUpdateFiscalYear = () => {
  const { closeFiscalYearDrawer } = useFiscalYearDrawerStore();
  const queryClient = useQueryClient();
  return useMutation(
    (data: { id: string; fiscalYear: any }) =>
      updateFiscalYear(data.id, data.fiscalYear),
    {
      onSuccess: (variables: any) => {
        queryClient.invalidateQueries('fiscalYears');

        closeFiscalYearDrawer();
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

      handleSuccessMessage('DELETE');
    },
  });
};

const updateClosedDate = async (
  fiscalYearId: string,
  closedDates: ClosedDates[],
) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${fiscalYearId}`,
    method: 'PATCH',
    data: { closedDates },
    headers,
  });
};
export const useUpdateClosedDate = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { fiscalYearId: string; closedDates: ClosedDates[] }) =>
      updateClosedDate(data.fiscalYearId, data.closedDates),
    {
      onSuccess: (variables: any) => {
        queryClient.invalidateQueries('fiscalActiveYear');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};
