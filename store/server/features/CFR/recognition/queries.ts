import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query"

const getAllRecognitionTypes = async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV_URL}/recognition-type/parent`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };

  const getRecognitionTypeById = async (id:string) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV_URL}/recognition-type/parent/${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };

  export const useGetRecognitionTypeById = (id: string | null) => {
    return useQuery<any>(
      ['recognitionTypes', id],
      () => getRecognitionTypeById(id as string), // Type assertion since `enabled` ensures `id` is valid
      {
        enabled: !!id && id.trim() !== '', // Check id is not null and not an empty string
        keepPreviousData:false
      }
    );
  };
export const useGetAllRecognitionType = () => {
    return useQuery<any>('recognitionTypes', getAllRecognitionTypes);
  };
  