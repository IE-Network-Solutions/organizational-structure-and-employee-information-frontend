import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  AddGoalActivityPayload,
  AddGoalChecklistItemPayload,
  ApplyCourseEvidencePayload,
  CreateGrowthPlanPayload,
  DeleteGoalChecklistItemPayload,
  DeleteGoalMaterialPayload,
  EnrollGoalCoursePayload,
  SaveGoalMaterialPayload,
  SaveGrowthPlanCategoryPayload,
  SaveGrowthPlanConfigPayload,
  SaveGrowthPlanSkillPayload,
  ToggleGoalChecklistPayload,
  UpdateGrowthPlanPayload,
} from '@/store/server/features/tna/growthPlan/interface';
import {
  ApiCategory,
  materialTypeToApi,
  toCategoryBody,
  toCreatePlanBody,
  toSkillBody,
  toUpdatePlanBody,
  unwrapItem,
} from '@/store/server/features/tna/growthPlan/adapters';
import { inferMaterialTypeFromUrl } from '@/types/tna/growthPlan';

const GROWTH_PLAN_QUERY_KEYS = [
  'growth-plan-config',
  'growth-plan-taxonomy',
  'growth-plans',
  'growth-plan-detail',
  'growth-plan-skill',
  'growth-plan-team-progress',
];

const invalidateGrowthPlanCaches = (queryClient: any) => {
  GROWTH_PLAN_QUERY_KEYS.forEach((key) => queryClient.invalidateQueries(key));
};

/** Backend errors: `{ message }`, or `{ message, errors: [{ error }] }` for validation. */
const apiErrorMessage = (error: any): string => {
  const data = error?.response?.data;
  const firstValidation = Array.isArray(data?.errors)
    ? data.errors[0]?.error
    : null;
  const message = Array.isArray(data?.message)
    ? data.message[0]
    : data?.message;

  return (
    firstValidation || message || 'Something went wrong. Please try again.'
  );
};

const notifyError = (error: unknown) =>
  NotificationMessage.error({
    message: 'Error',
    description: apiErrorMessage(error),
  });

const skillUrl = (goalId: string) => `${TNA_URL}/growth-plan-skill/${goalId}`;

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** Only the maximums exist server-side; limits off clears them. */
const putConfig = async (data: SaveGrowthPlanConfigPayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan-setting`,
    method: 'PUT',
    headers: requestHeaders,
    data: {
      maxSkillsPerQuarter: data.enforceCapacityLimits
        ? data.maxSkillsPerQuarter
        : null,
      maxShortlistedSkills: data.enforceCapacityLimits
        ? data.maxSkillsInPlanShortlist
        : null,
    },
  });
};

/** Saves the category, then creates any skills entered alongside it. */
const saveCategory = async (data: SaveGrowthPlanCategoryPayload) => {
  const requestHeaders = await requestHeader();
  const saved = unwrapItem<ApiCategory>(
    await crudRequest({
      url: `${TNA_URL}/growth-skill-category`,
      method: 'PUT',
      headers: requestHeaders,
      data: toCategoryBody(data),
    }),
  );

  for (const skill of data.skills ?? []) {
    if (!skill?.name?.trim()) continue;
    await crudRequest({
      url: `${TNA_URL}/growth-skill`,
      method: 'PUT',
      headers: requestHeaders,
      data: { categoryId: saved.id, name: skill.name.trim() },
    });
  }

  return saved;
};

const deleteCategory = async (id: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-skill-category/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const saveSkill = async (data: SaveGrowthPlanSkillPayload) => {
  const requestHeaders = await requestHeader();
  return unwrapItem(
    await crudRequest({
      url: `${TNA_URL}/growth-skill`,
      method: 'PUT',
      headers: requestHeaders,
      data: toSkillBody(data),
    }),
  );
};

const deleteSkill = async (id: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-skill/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

const createPlan = async (data: CreateGrowthPlanPayload) => {
  const requestHeaders = await requestHeader();
  return unwrapItem(
    await crudRequest({
      url: `${TNA_URL}/growth-plan`,
      method: 'PUT',
      headers: requestHeaders,
      data: toCreatePlanBody(data),
    }),
  );
};

const updatePlan = async (data: UpdateGrowthPlanPayload) => {
  const { id, ...body } = data;
  const requestHeaders = await requestHeader();
  return unwrapItem(
    await crudRequest({
      url: `${TNA_URL}/growth-plan/${id}`,
      method: 'PATCH',
      headers: requestHeaders,
      data: toUpdatePlanBody(body),
    }),
  );
};

/** Activates a draft plan (there is no approval step). */
const activatePlan = async (id: string) => {
  const requestHeaders = await requestHeader();
  return unwrapItem(
    await crudRequest({
      url: `${TNA_URL}/growth-plan/${id}/activate`,
      method: 'PATCH',
      headers: requestHeaders,
    }),
  );
};

// ---------------------------------------------------------------------------
// Skill page — checklist, notes, materials, TNA courses
// ---------------------------------------------------------------------------

const toggleGoalChecklist = async (data: ToggleGoalChecklistPayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/checklist/${data.checklistItemId}`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { isDone: data.done },
  });
};

const addGoalChecklistItem = async (data: AddGoalChecklistItemPayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/checklist`,
    method: 'POST',
    headers: requestHeaders,
    data: { title: data.label, weight: data.weight },
  });
};

const deleteGoalChecklistItem = async (
  data: DeleteGoalChecklistItemPayload,
) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/checklist/${data.checklistItemId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

/** Notes are the only activity the API stores. */
const addGoalActivity = async (data: AddGoalActivityPayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/notes`,
    method: 'POST',
    headers: requestHeaders,
    data: {
      ...(data.title?.trim() ? { title: data.title.trim() } : {}),
      body: data.body ?? '',
    },
  });
};

/**
 * Adds an employee material: a URL (YouTube, Vimeo, link…) as JSON, or a file
 * as multipart, which the backend pushes to the file server.
 */
const saveGoalMaterial = async (data: SaveGoalMaterialPayload) => {
  const requestHeaders = await requestHeader();
  const url = `${skillUrl(data.goalId)}/resources`;

  if (data.file) {
    const formData = new FormData();
    formData.append('type', materialTypeToApi(data.type ?? 'document', true));
    formData.append('title', data.title);
    formData.append('file', data.file);

    return crudRequest({
      url,
      method: 'POST',
      headers: { ...requestHeaders, 'Content-Type': 'multipart/form-data' },
      data: formData,
      skipEncryption: true,
    });
  }

  const link = (data.url ?? '').trim();
  return crudRequest({
    url,
    method: 'POST',
    headers: requestHeaders,
    data: {
      type: materialTypeToApi(
        data.type ?? inferMaterialTypeFromUrl(link),
        false,
      ),
      title: data.title,
      url: link,
    },
  });
};

const deleteGoalMaterial = async (data: DeleteGoalMaterialPayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/resources/${data.materialId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

/** Marks a recommended TNA course completed (enrolling first if needed). */
const applyCourseEvidence = async (data: ApplyCourseEvidencePayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/courses/${data.resourceId}/complete`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { isCompleted: data.isCompleted ?? true },
  });
};

const enrollGoalCourse = async (data: EnrollGoalCoursePayload) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${skillUrl(data.goalId)}/courses/${data.resourceId}/enroll`,
    method: 'POST',
    headers: requestHeaders,
  });
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

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
    onError: notifyError,
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
    onError: (error) => {
      // Skills may have been created before a later one failed.
      invalidateGrowthPlanCaches(queryClient);
      notifyError(error);
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
    onError: notifyError,
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
    onError: notifyError,
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
    onError: notifyError,
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
    onError: notifyError,
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
    onError: notifyError,
  });
};

/** Activates a draft plan. Name kept from the prototype's "submit". */
export const useSubmitGrowthPlan = () => {
  const queryClient = useQueryClient();
  return useMutation(activatePlan, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Growth plan activated.',
      });
    },
    onError: notifyError,
  });
};

export const useToggleGoalChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleGoalChecklist, {
    onSuccess: () => invalidateGrowthPlanCaches(queryClient),
    onError: notifyError,
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
    onError: notifyError,
  });
};

export const useDeleteGoalChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteGoalChecklistItem, {
    onSuccess: () => invalidateGrowthPlanCaches(queryClient),
    onError: notifyError,
  });
};

export const useAddGoalActivity = () => {
  const queryClient = useQueryClient();
  return useMutation(addGoalActivity, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Note saved.',
      });
    },
    onError: notifyError,
  });
};

export const useSaveGoalMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation(saveGoalMaterial, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Material added to this skill.',
      });
    },
    onError: notifyError,
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
    onError: notifyError,
  });
};

export const useApplyCourseEvidence = () => {
  const queryClient = useQueryClient();
  return useMutation(applyCourseEvidence, {
    onSuccess: (notused, variables) => {
      invalidateGrowthPlanCaches(queryClient);
      queryClient.invalidateQueries('my-courses');
      NotificationMessage.success({
        message: 'Success',
        description:
          variables.isCompleted === false
            ? 'Course marked as not completed.'
            : 'Course marked as completed on this skill.',
      });
    },
    onError: notifyError,
  });
};

export const useEnrollGoalCourse = () => {
  const queryClient = useQueryClient();
  return useMutation(enrollGoalCourse, {
    onSuccess: () => {
      invalidateGrowthPlanCaches(queryClient);
      queryClient.invalidateQueries('my-courses');
      queryClient.invalidateQueries('course-with-assignments');
      queryClient.invalidateQueries('course-management');
      NotificationMessage.success({
        message: 'Enrolled',
        description: 'You are now assigned to this course.',
      });
    },
    onError: notifyError,
  });
};
