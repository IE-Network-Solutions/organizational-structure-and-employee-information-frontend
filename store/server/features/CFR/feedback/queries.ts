import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { ORG_DEV_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query";


const getPerspectives = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/perspectives`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getPerspectivesById = async (departmentId:string|null) => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
  
    return crudRequest({
      url: `${ORG_DEV_URL}/perspectives?departmentId=${departmentId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
  };

export const useGetPerspectiveById = (departmentId: string|null) => {
  return useQuery<any>(
    ['perspectives', departmentId], // Unique query key based on params
    () => getPerspectivesById(departmentId),{
        enabled: !!departmentId && departmentId.trim().length > 0, // Ensures departmentId is truthy and not an empty string
    },
  );
};
export const useGetAllPerspectives= () => {
  return useQuery<any>(
    ['perspectives'], // Unique query key based on params
    () => getPerspectives(),
  );
};