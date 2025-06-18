import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import axios from 'axios';
import { useMutation, useQueryClient } from 'react-query';

const importData = async (data: any) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/imported-data`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};
const logUserId = useAuthenticationStore.getState().userId;

const exportData = async (data: any) => {
  try {
    const payload = {
      ...data,
      updatedBy: logUserId,
      createdBy: logUserId,
    };
    const response = await axios.post(
      `${INCENTIVE_URL}/incentives/export/incentive-data`,
      payload,
      {
        headers: {
          ...requestHeader(),
        },
        responseType: 'blob', // Important for file download!
      },
    );
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const disposition = response.headers['content-disposition'];
    let fileName = 'Incentive Data Export.xlsx';
    if (disposition && disposition.includes('filename=')) {
      fileName = disposition.split('filename=')[1].replace(/"/g, '');
    }

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

const sendIncentiveToPayroll = async (data: string[]) => {
  return await crudRequest({
    method: 'POST',
    url: `${INCENTIVE_URL}/incentives/send-to-payroll/incentive/data`,
    headers: requestHeader(),
    data: { incentiveId: data },
  });
};

export const useSendIncentiveToPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ data }: { data: string[] }) => sendIncentiveToPayroll(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sendToPayroll');
        NotificationMessage.success({
          message: 'Incentive sent to payroll successfully!',
          description: 'Incentive data has been successfully sent to payroll',
        });
      },
    },
  );
};

export const useExportIncentiveData = () => {
  const queryClient = useQueryClient();
  return useMutation(exportData, {
    onSuccess: () => {
      queryClient.invalidateQueries('exportData');
      NotificationMessage.success({
        message: 'Data exported successfully!',
        description: 'Incentive data has been successfully exported',
      });
    },
  });
};
export const useImportData = () => {
  const queryClient = useQueryClient();
  return useMutation(importData, {
    onSuccess: () => {
      queryClient.invalidateQueries('importData');
      NotificationMessage.success({
        message: 'Data imported successfully!',
        description: 'Data has been successfully imported',
      });
    },
  });
};
