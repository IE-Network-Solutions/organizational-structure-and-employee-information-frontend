export interface PlanningAssignation {
  id?: string;
  name: string;
  plan: string;
  date: string;
}

export interface PlanningAssignationState {
  open: boolean;
  openDeleteModal: boolean;
  setOpen: (value: boolean) => void;
  setOpenDeleteModal: (value: boolean) => void;
  deletedId: string;
  setDeletedId: (value: string) => void;
  planningAssignation?: PlanningAssignation | null;
  setPlanningAssignation: (
    planningAssignation: PlanningAssignation | null,
  ) => void;
}
