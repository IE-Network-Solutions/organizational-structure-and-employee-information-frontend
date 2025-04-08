export interface PlanRequestBody {
  filter: {
    id?: string[];
    periodTypeId?: string[];
    isActive?: boolean;
    isPublic?: boolean;
    isFree?: boolean;
  };
}
