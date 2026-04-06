import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const createRecruitmentStatus = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    method: 'POST',
    url: `${RECRUITMENT_URL}/applicant-status-stages`,
    data,
    headers,
  });
};

const updateRecruitmentStatus = async (data: any, id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'PUT',
    url: `${RECRUITMENT_URL}/applicant-status-stages/${id}`,
    data,
    headers,
  });
};

const deleteRecruitmentStatus = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    method: 'DELETE',
    url: `${RECRUITMENT_URL}/applicant-status-stages/${id}`,
    headers,
  });
};

export const useCreateRecruitmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(createRecruitmentStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('recruitmentStatuses');
      NotificationMessage.success({
        message: 'Recruitment Status created successfully!',
        description: 'Recruitment status has been successfully created',
      });
    },
  });
};

export const useUpdateRecruitmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, id }: { data: any; id: string }) =>
      updateRecruitmentStatus(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recruitmentStatuses');
        NotificationMessage.success({
          message: 'Recruitment Status updated successfully!',
          description: 'Recruitment status has been successfully updated',
        });
      },
    },
  );
};

export const useDeleteRecruitmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteRecruitmentStatus(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('recruitmentStatuses');
      NotificationMessage.success({
        message: 'Recruitment Status deleted successfully!',
        description: 'Recruitment status has been successfully deleted',
      });
    },
  });
};
