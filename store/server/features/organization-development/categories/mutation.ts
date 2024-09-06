import NotificationMessage from "@/components/common/notification/notificationMessage";
import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV_URL, ORG_AND_EMP_URL, teantI, } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useMutation, useQueryClient } from "react-query";
import { DataItem } from "./interface";


/**
 * Function to add a new post by sending a POST request to the API
 * @param newPost The data for the new post
 * @returns The response data from the API
 */
const createActionPlan = async (values: DataItem[]) => {
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/many/75ae2dbc-e533-4aa8-a782-d657dab977d2`,
    method: 'POST',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      // tenantId: tenantId, // Pass tenantId in the headers
      tenantId: teantI,
    },
  });
};

export const useCreateActionPlan = () => {
    const queryClient = useQueryClient();
    return useMutation(createActionPlan, {
      onSuccess: () => {
        queryClient.invalidateQueries('actionPlan');
        NotificationMessage.success({
          message: 'Successfully Created',
          description: 'action plan successfully Created',
        });
      },
      onError: () => {
        NotificationMessage.error({
          message: 'Creating Failed',
          description: 'action plan Created Failed',
        });
      },
    });
  };