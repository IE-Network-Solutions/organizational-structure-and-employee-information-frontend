import NotificationMessage from "@/components/common/notification/notificationMessage";
import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useMutation, useQueryClient } from "react-query";

const deleteConversationInstancesById= async (id:string) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV}/conversation-instances/${id}`,
      method: 'delete',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };

  const updateConversationInstancesById= async (selectedInstance:string,values:any) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
    return crudRequest({
      url: `${ORG_DEV}/conversation-instances/${selectedInstance}`,
      method: 'put',
      data:values,
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };


export const useDeleteConversationInstancesById = () => {
  const queryClient = useQueryClient();
  return useMutation((id:string) => deleteConversationInstancesById(id), // Mutation function
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conversation-instances');
        NotificationMessage?.success({
            message:'successfully deleted !!',
            description:'conversation instance deleted !!'
        });
      },
    }
  );
};

export const useUpdateConversationInstancesById = () => {
    const queryClient = useQueryClient();
    return useMutation(({selectedInstance,values}:{selectedInstance:string,values:any}) => updateConversationInstancesById(selectedInstance,values), // Mutation function
      {
        onSuccess: () => {
          queryClient.invalidateQueries('conversation-instances');
          NotificationMessage?.success({
              message:'successfully updated !!',
              description:'conversation instance updated !!'
          });
        },
      }
    );
  };