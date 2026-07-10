export interface WorkflowAssignee {
  id: string;
  name: string;
}

export interface ApprovalWorkflowItem {
  id: string;
  name: string;
  level: number;
  assignees: WorkflowAssignee[];
  approvers?: Array<{ stepOrder: number; userId: string; id?: string }>;
  approvalWorkflowType?: string;
  entityType?: string;
  entityId?: string;
  approvalType?: string;
}
