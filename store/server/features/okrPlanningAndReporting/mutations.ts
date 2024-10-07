import { useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { PlanningPeriod } from './interface';

const approveOrRejectPlanningPeriods = async (planningData: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/plan/validate/${planningData?.id}?value=${String(planningData?.value)}`,
    method: 'post',
    headers,
  });
};
const createReportForUnReportedtasks = async (reportingData: any,PlanningPeriodId:string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/okr-report/create-report/${userId}/${PlanningPeriodId}`,
    method: 'post',
    data:reportingData,
    headers,
  });
};
export const useApprovalPlanningPeriods = () => {
  const queryClient = useQueryClient();
  return useMutation(approveOrRejectPlanningPeriods, {
    onSuccess: () => {
      queryClient.invalidateQueries('okrPlans');
      NotificationMessage.success({
        message: 'Successfully updated',
        description: 'okr plan status successfully updated',
      });
    },
  });
};
export const useCreateReportForUnReportedtasks = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ values, planningPeriodId }: { values: any; planningPeriodId: string }) => 
      createReportForUnReportedtasks(values, planningPeriodId), 
    {
      onSuccess: () => {
        queryClient.invalidateQueries('okrPlans');
        NotificationMessage.success({
          message: 'Successfully updated',
          description: 'OKR plan status successfully updated',
        });
      },
    }
  );
};