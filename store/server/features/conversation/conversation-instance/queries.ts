import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query";

const getConversationInstanceById = async (id:string|null) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV}/conversation-instances/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };

  const getConversationInstanceByQuestionSetId = async (id:string,userId:string|null,departmentId:string|null) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV}/conversation-instances/by-conversation-set-id/${id}?userId=${userId}&&departmentId=${departmentId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };


  const getAllConversationInstances= async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV}/conversation-instances`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };
  
  export const useGetAllConversationInstancesById= (id:string|null) => {
    return useQuery<any>('conversation-instance', ()=>getConversationInstanceById(id), {
      enabled: typeof id === 'string' && id.length > 0,
      // keepPreviousData: true,
    });
  };

  export const useGetAllConversationInstancesByQuestionSetId= (id:string,userId:string|null,departmentId:string|null) => {
    return useQuery<any>('conversation-instances', ()=>getConversationInstanceByQuestionSetId(id,userId,departmentId), {
      enabled: typeof id === 'string' && id.length > 0,
      keepPreviousData: true,
    });
  };
  
  export const useGetAllConversationInstances = () => {
    return useQuery<any>('conversation-instances', getAllConversationInstances);
  };
    