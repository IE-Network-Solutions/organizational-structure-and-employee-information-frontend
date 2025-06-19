import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { EmployeeOffBoardingTasks, EmploymentStatusUpdate } from './interface';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const addOffboardingItem = async (values: EmploymentStatusUpdate) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-termination`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const rehireTerminatedEmployee = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-termination/rehireUser/${values?.userId}`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const resignedEmployee = async (jobId: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/EmployeeJobInformation/resign/${jobId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
}; 
const addTerminationTasks = async (values: EmployeeOffBoardingTasks[]) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-employee-tasks`,

    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const addOffboardingTasksTemplate = async (
  values: EmployeeOffBoardingTasks[],
) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-tasks-template`,

    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const updateOffboardingItem = async (values: any) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-employee-tasks/${values?.id}`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const deleteOffboardingItem = async (id: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-employee-tasks/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};


const deleteOffboardingTemplateTasksItem = async (id: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-tasks-template/${id}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useAddOffboardingItem = () => {
  const queryClient = useQueryClient();
  return useMutation(addOffboardingItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardingActiveTermiantionsByUserId');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Item successfully Created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: 'Item creation Failed',
      });
    },
  });
};
export const useResignedEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(resignedEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('employee');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Item successfully Created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: 'Item creation Failed',
      });
    },
  });
};

export const useAddTerminationTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(addTerminationTasks, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItems');
      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Item successfully Created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: 'Item creation Failed',
      });
    },
  });
};

export const useUpdateOffboardingItem = () => {
  const queryClient = useQueryClient();
  return useMutation(updateOffboardingItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItems');
      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Item successfully updated',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Updating Failed',
        description: 'Item update Failed',
      });
    },
  });
};

export const useDeleteOffboardingItem = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteOffboardingItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItems');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Item successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deleting Failed',
        description: 'Item deletion Failed',
      });
    },
  });
};

export const useDeleteOffboardingTemplateTasksItem = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteOffboardingTemplateTasksItem, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItemsTemplate');
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Item successfully deleted',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Deleting Failed',
        description: 'Item deletion Failed',
      });
    },
  });
};

export const useAddOffboardingTasksTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(addOffboardingTasksTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardItemsTemplate');

      NotificationMessage.success({
        message: 'Successfully Created',
        description: 'Item successfully Created',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: 'Item creation Failed',
      });
    },
  });
};

export const useRehireTerminatedEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation(rehireTerminatedEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries('offboardingActiveTermiantionsByUserId');
      queryClient.invalidateQueries('employees'); // Invalidate both caches

      NotificationMessage.success({
        message: 'Successfully Updated',
        description: 'Item successfully updated',
      });
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Updating Failed',
        description: 'Item update Failed',
      });
    },
  });
};
