import { ActionPlanSourceType } from '@/types/enumTypes';
import { ActionPlanStatus } from '@/types/enumTypes';

/**
 * Action Plan Interface
 * Represents an action plan that can originate from either a MEETING or SURVEY
 */
export interface ActionPlan {
  id: string;
  issue?: string;
  actionToBeTaken?: string;
  description: string;
  responsiblePerson: string[];
  responsibleUsers?: Array<{ responsibleId: string }>;
  status: ActionPlanStatus | string;
  priority: string;
  deadline: string;
  formId?: string | null;
  sourceType: ActionPlanSourceType; // Required - indicates source (MEETING or SURVEY)
  sourceId?: string; // Optional - ID of the meeting or survey
  sourceName?: string; // Optional - Name/title of the meeting or survey
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Create Action Plan DTO
 * Used when creating new action plans
 * NOTE: Do NOT include sourceType, sourceId, or sourceName - backend sets these automatically
 */
export interface CreateActionPlanDto {
  actionToBeTaken: string;
  description?: string;
  responsiblePerson: string[];
  status: string;
  priority: string;
  deadline: string;
  // Explicitly NO sourceType, sourceId, sourceName - backend handles these
}

/**
 * Update Action Plan DTO
 * Used when updating existing action plans
 * NOTE: Do NOT include sourceType, sourceId, or sourceName - backend manages these
 */
export interface UpdateActionPlanDto {
  actionToBeTaken?: string;
  description?: string;
  responsiblePerson?: string[];
  status?: string;
  priority?: string;
  deadline?: string;
  // Explicitly NO sourceType, sourceId, sourceName - backend manages these
}
