import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { ClosedDates, FiscalYear } from './interface';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useFiscalYearDrawerStore } from '@/store/uistate/features/organizations/settings/fiscalYear/useStore';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';

const formatDate = (date: any): string => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date.format && typeof date.format === 'function') {
    return date.format('YYYY-MM-DD');
  }
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
};

const buildFiscalYearPayload = (fiscalYear: any) => ({
  name: fiscalYear.name,
  description: fiscalYear.description || `Fiscal year ${fiscalYear.name}`,
  startDate: formatDate(fiscalYear.startDate),
  endDate: formatDate(fiscalYear.endDate),
  isActive: fiscalYear.isActive ?? false,
  sessions:
    fiscalYear.sessions?.map((session: any) => ({
      ...(session.id ? { id: session.id } : {}),
      name: session.name,
      description: session.description || '',
      startDate: formatDate(session.startDate),
      endDate: formatDate(session.endDate),
      active: session.active ?? false,
      months:
        session.months?.map((month: any) => ({
          ...(month.id ? { id: month.id } : {}),
          name: month.name,
          description: month.description || '',
          startDate: formatDate(month.startDate),
          endDate: formatDate(month.endDate),
          active: month.active ?? false,
        })) || [],
    })) || [],
});

const createFiscalYear = async (fiscalYear: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  // Clean payload: remove any undefined/null values and ensure required fields
  const cleanedPayload = buildFiscalYearPayload(fiscalYear);

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars`,
    method: 'POST',
    data: cleanedPayload,
    headers,
  });
};

const updateFiscalYear = async (id: string, fiscalYear: FiscalYear) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${id}`,
    method: 'PUT',
    data: buildFiscalYearPayload(fiscalYear),
    headers,
  });
};

const deleteFiscalYear = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

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
      NotificationMessage.success({
        message: 'Fiscal year created successfully!',
        description: 'Fiscal year has been successfully created',
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create fiscal year';
      NotificationMessage.error({
        message: 'Error creating fiscal year',
        description: errorMessage,
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
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.details ||
          error?.message ||
          'Failed to update fiscal year';
        NotificationMessage.error({
          message: 'Error updating fiscal year',
          description: errorMessage,
        });
      },
    },
  );
};

export const useDeleteFiscalYear = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteFiscalYear(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
      queryClient.invalidateQueries('fiscalActiveYear');
      handleSuccessMessage('DELETE');
    },
  });
};

const updateClosedDate = async (
  fiscalYearId: string,
  closedDates: ClosedDates[],
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/calendars/${fiscalYearId}`,
    method: 'PUT',
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

const activateMonth = async (id: string): Promise<void> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  await crudRequest({
    url: `${ORG_AND_EMP_URL}/month/${id}/activate`,
    method: 'PATCH',
    headers,
  });
};

export const useActivateMonth = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => activateMonth(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('fiscalYears');
      queryClient.invalidateQueries('fiscalActiveYear');
      NotificationMessage.success({
        message: 'Month activation updated',
        description: 'Month status has been updated successfully',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Failed to update month',
        description:
          'Could not update month activation status. Please try again.',
      });
    },
  });
};
