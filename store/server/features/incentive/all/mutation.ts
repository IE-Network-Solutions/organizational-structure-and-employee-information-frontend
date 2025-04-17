import NotificationMessage from '@/components/common/notification/notificationMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { INCENTIVE_URL, ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';

const importData = async (data: any) => {
  return await crudRequest({
    url: `${ORG_DEV_URL}/imported-data`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};
const exportData = async (data: any) => {
  return await crudRequest({
    url: `${INCENTIVE_URL}/incentives/export/incentive-data`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
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
