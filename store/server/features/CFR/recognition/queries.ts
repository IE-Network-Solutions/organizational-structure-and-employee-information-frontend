import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query"
import { RecognitionParams } from ".";

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

  const getAllRecognitionTypesWithOutCriteria = async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV_URL}/recognition`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };
  const getAllRecognitions = async ({ employeeId, yearId, sessionId, monthId }: RecognitionParams) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = '3c7e1c6f-fc6c-4f89-8437-5749b8e6dd2b' ;
    // useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV_URL}/recognition`,
      // ?employeeId=${employeeId}&yearId=${yearId}&sessionId=${sessionId}&monthId=${monthId}
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

  export const useGetAllRecognitionTypeWithOutCriteria = () => {
    return useQuery<any>('recognitionTypesWithOutCriteria', getAllRecognitionTypesWithOutCriteria);
  };
  export const useGetAllRecognition = ({ employeeId, yearId, sessionId, monthId }: RecognitionParams) => {
    return useQuery<any>(
      ['recognitions', employeeId, yearId, sessionId, monthId], // Unique query key based on params
      () => getAllRecognitions({ employeeId, yearId, sessionId, monthId })
    );
  };