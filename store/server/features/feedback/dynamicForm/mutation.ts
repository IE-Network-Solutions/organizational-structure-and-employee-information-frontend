import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken, getOptionalToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

type ResponseDetailApiItem = {
  id: string;
  response: string;
  questionId?: string;
};

/** Map store `{ id, value }` rows to API `{ id, response }` (accepts either key). */
function mapResponseDetailItems(
  details: unknown,
  questionId?: string,
): ResponseDetailApiItem[] {
  const list = Array.isArray(details) ? details : [];
  return list
    .map((d: { id?: unknown; value?: unknown; response?: unknown }) => {
      const id = d?.id;
      const response = d?.response ?? d?.value ?? '';
      return {
        id: id != null ? String(id) : '',
        response: String(response),
        ...(questionId != null ? { questionId: String(questionId) } : {}),
      };
    })
    .filter((item) => item.id !== '' && item.id !== 'undefined');
}

/** POST /responses/public/{formId} — full survey answers in one array. */
function buildSubmitResponsePayload(values: unknown): Array<{
  questionId?: string;
  respondentId?: string | null;
  responseDetail: ResponseDetailApiItem[];
}> {
  if (!Array.isArray(values)) return [];
  return values.map((q: Record<string, unknown>) => {
    const questionId =
      q?.questionId != null ? String(q.questionId) : undefined;
    return {
      questionId,
      respondentId:
        q?.respondentId === undefined ? undefined : (q.respondentId as string | null),
      responseDetail: mapResponseDetailItems(q?.responseDetail, questionId),
    };
  });
}

/** PUT /responses/{id} — one question's details flattened. */
function buildResponseDetailUpdatePayload(values: unknown): {
  responseDetail: ResponseDetailApiItem[];
} {
  if (Array.isArray(values)) {
    return {
      responseDetail: values.flatMap((q: Record<string, unknown>) =>
        mapResponseDetailItems(
          q?.responseDetail,
          q?.questionId != null ? String(q.questionId) : undefined,
        ),
      ),
    };
  }

  if (
    values &&
    typeof values === 'object' &&
    Array.isArray((values as { responseDetail?: unknown }).responseDetail)
  ) {
    return values as { responseDetail: ResponseDetailApiItem[] };
  }

  return { responseDetail: [] };
}

const submitResponseMutation = async (id: string, values: unknown) => {
  const token = await getOptionalToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers: Record<string, string> = {};
  if (tenantId) headers.tenantId = tenantId;
  if (token) headers.Authorization = `Bearer ${token}`;

  return crudRequest({
    url: `${ORG_DEV_URL}/responses/public/${id}`,
    method: 'post',
    headers,
    data: buildSubmitResponsePayload(values),
  });
};

const updateResponseMutation = async (responseId: string, values: unknown) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_DEV_URL}/responses/${responseId}`,
    method: 'put',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
    data: buildResponseDetailUpdatePayload(values),
  });
};

export const useSubmitFormResponse = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, values }: { id: string; values: unknown }) =>
      submitResponseMutation(id, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
      },
    },
  );
};

export const useUpdateFormResponse = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ responseId, values }: { responseId: string; values: unknown }) =>
      updateResponseMutation(responseId, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
      },
    },
  );
};
