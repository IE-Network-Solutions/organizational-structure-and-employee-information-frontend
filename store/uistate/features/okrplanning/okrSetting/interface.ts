export type PlanningPeriodItem = {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    userId: string;
    tenantId: string;
    planningPeriodId: string;
  };
  
  export type PlanningUser = {
    userId: string;
    items: PlanningPeriodItem[];
  };