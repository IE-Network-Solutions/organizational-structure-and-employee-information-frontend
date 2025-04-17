// import { Meta } from '../okrPlanningAndReporting/interface';

import { Meta } from '../../okrPlanningAndReporting/interface';

export interface HierarchyList {
  id: string;
  name: string;
}
export interface EntityTypeList {
  name: string;
}

export type ApprovalWorkflow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  name: string;
  approvalType: string;
  description: string;
  entityType: string;
  entityId: string;
  approvalWorkflowType: string;
};

export interface AllApprovalWorkFlow {
  items: ApprovalWorkflow[];
  meta: Meta;
}
