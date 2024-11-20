import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query";

const getConversationInstanceById = async (id:string) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV}/conversation-instance/${id}`,
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
  
  export const useGetQuestionSetById= (id:string) => {
    return useQuery<any>('conversation-instance-', ()=>getConversationInstanceById(id), {
      enabled: typeof id === 'string' && id.length > 0,
      keepPreviousData: true,
    });
  };
  
  export const useGetAllConversationInstances = () => {
    return useQuery<any>('conversation-instances', getAllConversationInstances);
  };
    