import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { OKR_URL } from "@/utils/constants";
import { crudRequest } from "@/utils/crudRequest";
import { useQuery } from "react-query";
import { PlanningPeriod } from "./interface";
 interface dataType{
  teamUser: string[]|[];
  employeeId: string|"";
  periodId: string|"";
  type: 'myplan' | 'allPlan';
  status: 'pending' | 'closed';
 }
const getPlanningData = async ({
  teamUser,
  employeeId,
  periodId,
  type,
  status,
}: dataType) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  const queryParams = new URLSearchParams({
    teamUser: JSON.stringify(teamUser), // Convert array to JSON string
    employeeId,
    periodId,
    type,
    status,
  }).toString();

  return await crudRequest({
    url: `${OKR_URL}/planning?${queryParams}`,
    method: 'GET',
    headers,
  });
};

const getAllPlanningPeriods = async () => {
    const token = useAuthenticationStore.getState().token;
    const tenantId = useAuthenticationStore.getState().tenantId;
    const headers = {
        tenantId: tenantId,
        Authorization: `Bearer ${token}`,
      };
      
    return await crudRequest({
      url: `${OKR_URL}/planning-periods/assignment/assigneduser/5f4d2864-3306-4be5-b729-a443045c2643`,
      method: 'GET',
      headers,
    });
  };
  
export const useAllPlanningPeriods = () => {
    return useQuery<PlanningPeriod>('planningPeriods', getAllPlanningPeriods);
  };

  export const useGetPlanning = (params:dataType) => {
    return useQuery<PlanningPeriod>(['planning', params], () => getPlanningData(params));
  };