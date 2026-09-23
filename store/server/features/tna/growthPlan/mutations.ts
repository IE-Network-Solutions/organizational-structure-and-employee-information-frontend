import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CreateGrowthPlanPayload,
  ProposeEditPayload,
  RejectGoalPayload,
  RequestCompletionPayload,
  AddGoalActivityPayload,
  AddGoalChecklistItemPayload,
  ApplyCourseEvidencePayload,
  DeleteGoalChecklistItemPayload,
  DeleteGoalMaterialPayload,
  SaveGoalMaterialPayload,
  SaveGoalReflectionPayload,
  SaveGrowthPlanCategoryPayload,
  SaveGrowthPlanConfigPayload,
  SaveGrowthPlanSkillPayload,
  ToggleGoalChecklistPayload,
  UpdateGoalProgressPayload,
  UpdateGrowthPlanPayload,
} from '@/store/server/features/tna/growthPlan/interface';
import {
  USE_GROWTH_PLAN_MOCK,
  mockAddGoalActivity,
  mockAddGoalChecklistItem,
  mockApplyCourseEvidence,
  mockApprovePlan,
  mockCreatePlan,
  mockDeleteCategory,
  mockDeleteGoalChecklistItem,
  mockDeleteGoalMaterial,
  mockDeleteSkill,
  mockProposeEdit,
  mockPutConfig,
  mockRejectGoal,
  mockRequestCompletion,
  mockSaveCategory,
  mockSaveGoalMaterial,
  mockSaveReflection,
  mockSaveSkill,
  mockSignOffGoal,
  mockSubmitPlan,
  mockToggleGoalChecklist,
  mockUpdateGoalProgress,
  mockUpdatePlan,
} from '@/store/server/features/tna/growthPlan/mockStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const invalidateGrowthPlanCaches = (queryClient: any) => {
  [
    'growth-plan-config',
    'growth-plan-taxonomy',
    'growth-plans',
    'growth-plan-detail',
    'growth-plan-pending-approvals',
    'growth-plan-my-progress',
    'growth-plan-team-progress',
  ].forEach((key) => queryClient.invalidateQueries(key));
};

const putConfig = async (data: SaveGrowthPlanConfigPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockPutConfig(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/config`,
    method: 'PUT',
    headers: requestHeaders,
    data,
  });
};

const createPlan = async (data: CreateGrowthPlanPayload) => {
  if (USE_GROWTH_PLAN_MOCK) {
    const { userId, userData } = useAuthenticationStore.getState();
    const name =
      [userData?.firstName, userData?.middleName, userData?.lastName]
        .filter(Boolean)
        .join(' ') || 'You';
    return mockCreatePlan(data, userId || 'mock-user', name);
  }
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const updatePlan = async (data: UpdateGrowthPlanPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockUpdatePlan(data);
  const { id, ...body } = data;
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${id}`,
    method: 'PATCH',
    headers: requestHeaders,
    data: body,
  });
};

const submitPlan = async (id: string) => {
  if (USE_GROWTH_PLAN_MOCK) return mockSubmitPlan(id);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${id}/submit`,
    method: 'POST',
    headers: requestHeaders,
  });
};

const approvePlan = async (id: string) => {
  if (USE_GROWTH_PLAN_MOCK) return mockApprovePlan(id);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${id}/approve`,
    method: 'POST',
    headers: requestHeaders,
  });
};

const rejectGoal = async (data: RejectGoalPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockRejectGoal(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/reject`,
    method: 'POST',
    headers: requestHeaders,
    data: {
      feedback: data.feedback,
      revisionDeadline: data.revisionDeadline,
    },
  });
};

const requestCompletion = async (data: RequestCompletionPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockRequestCompletion(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/request-completion`,
    method: 'POST',
    headers: requestHeaders,
    data: {
      evidenceUrl: data.evidenceUrl,
      evidenceFileName: data.evidenceFileName,
      evidenceVideoId: data.evidenceVideoId,
      evidenceAttachments: data.evidenceAttachments,
    },
  });
};

const updateGoalProgress = async (data: UpdateGoalProgressPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockUpdateGoalProgress(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/progress`,
    method: 'PATCH',
    headers: requestHeaders,
    data: {
      progressStatus: data.progressStatus,
      progressPercent: data.progressPercent,
    },
  });
};

const toggleGoalChecklist = async (data: ToggleGoalChecklistPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockToggleGoalChecklist(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/checklist/${data.checklistItemId}`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { done: data.done },
  });
};

const addGoalChecklistItem = async (data: AddGoalChecklistItemPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockAddGoalChecklistItem(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/checklist`,
    method: 'POST',
    headers: requestHeaders,
    data: { label: data.label, weight: data.weight },
  });
};

const deleteGoalChecklistItem = async (
  data: DeleteGoalChecklistItemPayload,
) => {
  if (USE_GROWTH_PLAN_MOCK) return mockDeleteGoalChecklistItem(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/checklist/${data.checklistItemId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const addGoalActivity = async (data: AddGoalActivityPayload) => {
  if (USE_GROWTH_PLAN_MOCK) {
    const { userId } = useAuthenticationStore.getState();
    return mockAddGoalActivity(data, userId || 'mock-user');
  }
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/activities`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const saveGoalMaterial = async (data: SaveGoalMaterialPayload) => {
  if (USE_GROWTH_PLAN_MOCK) {
    const { userId } = useAuthenticationStore.getState();
    return mockSaveGoalMaterial(data, userId || 'mock-user');
  }
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: data.id
      ? `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/materials/${data.id}`
      : `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/materials`,
    method: data.id ? 'PATCH' : 'POST',
    headers: requestHeaders,
    data,
  });
};

const deleteGoalMaterial = async (data: DeleteGoalMaterialPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockDeleteGoalMaterial(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/materials/${data.materialId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const applyCourseEvidence = async (data: ApplyCourseEvidencePayload) => {
  if (USE_GROWTH_PLAN_MOCK) {
    const { userId } = useAuthenticationStore.getState();
    return mockApplyCourseEvidence(data, userId || 'mock-user');
  }
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/apply-course-evidence`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const saveReflection = async (data: SaveGoalReflectionPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockSaveReflection(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/reflections`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const signOffGoal = async ({
  planId,
  goalId,
}: {
  planId: string;
  goalId: string;
}) => {
  if (USE_GROWTH_PLAN_MOCK) return mockSignOffGoal({ planId, goalId });
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${planId}/goals/${goalId}/sign-off`,
    method: 'POST',
    headers: requestHeaders,
  });
};

const proposeEdit = async (data: ProposeEditPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockProposeEdit(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${data.planId}/goals/${data.goalId}/propose-edit`,
    method: 'POST',
    headers: requestHeaders,
    data: data.changes,
  });
};

const saveCategory = async (data: SaveGrowthPlanCategoryPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockSaveCategory(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: data.id
      ? `${TNA_URL}/growth-plan/taxonomy/categories/${data.id}`
      : `${TNA_URL}/growth-plan/taxonomy/categories`,
    method: data.id ? 'PATCH' : 'POST',
    headers: requestHeaders,
    data,
  });
};

const deleteCategory = async (id: string) => {
  if (USE_GROWTH_PLAN_MOCK) return mockDeleteCategory(id);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/taxonomy/categories/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const saveSkill = async (data: SaveGrowthPlanSkillPayload) => {
  if (USE_GROWTH_PLAN_MOCK) return mockSaveSkill(data);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: data.id
      ? `${TNA_URL}/growth-plan/taxonomy/skills/${data.id}`
      : `${TNA_URL}/growth-plan/taxonomy/skills`,
    method: data.id ? 'PATCH' : 'POST',
    headers: requestHeaders,
    data,
  });
};

const deleteSkill = async (id: string) => {
  if (USE_GROWTH_PLAN_MOCK) return mockDeleteSkill(id);
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/taxonomy/skills/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

export const useSetGrowthPlanConfig = () => {
  const queryClient = useQueryClient();
  return useMutation(putConfig, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Growth plan configuration saved.',
      });
    },
  });
};

export const useSaveGrowthPlanCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(saveCategory, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Skill category saved.',
      });
    },
  });
};

export const useDeleteGrowthPlanCategory = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCategory, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Skill category deleted.',
      });
    },
  });
};

export const useSaveGrowthPlanSkill = () => {
  const queryClient = useQueryClient();
  return useMutation(saveSkill, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Skill saved.',
      });
    },
  });
};

export const useDeleteGrowthPlanSkill = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteSkill, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Skill deleted.',
      });
    },
  });
};

export const useCreateGrowthPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(createPlan, {
    onSuccess: (notused, variables) => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: variables.asDraft
          ? 'Growth plan draft saved.'
          : 'Growth plan created.',
      });
    },
  });
};

export const useUpdateGrowthPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePlan, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Growth plan updated.',
      });
    },
  });
};

export const useSubmitGrowthPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(submitPlan, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Growth plan activated.',
      });
    },
  });
};

export const useApproveGrowthPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(approvePlan, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description:
          'Growth plan approved. Track progress under Personal Growth Plan.',
      });
    },
  });
};

export const useRejectGrowthPlanGoal = () => {
  const queryClient = useQueryClient();
  return useMutation(rejectGoal, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Goal rejected with feedback.',
      });
    },
  });
};

export const useRequestGoalCompletion = () => {
  const queryClient = useQueryClient();
  return useMutation(requestCompletion, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Completion requested. Awaiting manager sign-off.',
      });
    },
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  return useMutation(updateGoalProgress, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
    },
  });
};

export const useToggleGoalChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleGoalChecklist, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
    },
  });
};

export const useAddGoalChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation(addGoalChecklistItem, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Checklist item added.',
      });
    },
  });
};

export const useDeleteGoalChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteGoalChecklistItem, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
    },
  });
};

export const useAddGoalActivity = () => {
  const queryClient = useQueryClient();
  return useMutation(addGoalActivity, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Update added to your learning log.',
      });
    },
  });
};

export const useSaveGoalMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(saveGoalMaterial, {
    onSuccess: (notused, variables) => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: variables.id
          ? 'Material updated.'
          : 'Material added to this skill.',
      });
    },
  });
};

export const useDeleteGoalMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteGoalMaterial, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Material removed.',
      });
    },
  });
};

export const useApplyCourseEvidence = () => {
  const queryClient = useQueryClient();
  return useMutation(applyCourseEvidence, {
    onSuccess: (notused, variables) => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: variables.requestCompletion
          ? 'Course applied as evidence and completion requested.'
          : 'Course logged as learning evidence on this skill.',
      });
    },
  });
};

export const useSaveGoalReflection = () => {
  const queryClient = useQueryClient();
  return useMutation(saveReflection, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Quarterly reflection saved.',
      });
    },
  });
};

export const useSignOffGrowthPlanGoal = () => {
  const queryClient = useQueryClient();
  return useMutation(signOffGoal, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Goal marked complete.',
      });
    },
  });
};

export const useProposeGoalEdit = () => {
  const queryClient = useQueryClient();
  return useMutation(proposeEdit, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Edit proposed. Awaiting manager re-approval.',
      });
    },
  });
};
