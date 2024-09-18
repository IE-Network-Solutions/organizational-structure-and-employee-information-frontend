import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { NEXT_PUBLIC_OKR_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query";
import { PlanningPeriod } from "./interface";

const getAllPlanningPeriods = async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
    const headers = {
        tenantId: tenantId,
        Authorization: `Bearer ${token}`,
      };
      
    return await crudRequest({
      url: `${NEXT_PUBLIC_OKR_URL}/planning-periods`,
      method: 'GET',
      headers,
    });
  };
  
export const useAllPlanningPeriods = () => {
    return useQuery<PlanningPeriod>('planningPeriods', getAllPlanningPeriods);
  };