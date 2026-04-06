import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const importData = async (data: any) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${ORG_DEV_URL}/imported-data`,
    method: 'POST',
    headers: requestHeaders,
    data,
    skipEncryption: true, // Skip encryption for file uploads to preserve FormData
  });
};
// const logUserId = useAuthenticationStore.getState().userId;

const exportData = async (data: any) => {
  const requestHeaders = await requestHeader();
  try {
    // const payload = {
    //   ...data,
    //   updatedBy: logUserId,
    //   createdBy: logUserId,
    // };
    // Axios default responseType parses the body as text/JSON, which corrupts binary xlsx.
    const blob = await crudRequest({
      url: `${INCENTIVE_URL}/incentives/export/incentive-data`,
      method: 'POST',
      data,
      headers: requestHeaders,
      skipEncryption: true, // Skip encryption for file downloads
      responseType: 'blob',
    });

    const fileBlob =
      blob instanceof Blob
        ? blob
        : new Blob([blob], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    const fileName = 'Incentive Data Export.xlsx';

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
  const requestHeaders = await requestHeader();
  return await crudRequest({
    method: 'POST',
    url: `${INCENTIVE_URL}/incentives/send-to-payroll/incentive/data`,
    headers: requestHeaders,
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
