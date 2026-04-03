export interface AssignAverageOkrRuleEditContext {
  userId: string;
  averageOkrRuleId: string;
}

export interface AssignAverageOkrRuleState {
  open: boolean;
  setOpen: (value: boolean) => void;
  editContext: AssignAverageOkrRuleEditContext | null;
  setEditContext: (value: AssignAverageOkrRuleEditContext | null) => void;
}
