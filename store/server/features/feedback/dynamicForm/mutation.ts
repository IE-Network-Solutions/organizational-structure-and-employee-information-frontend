import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken, getOptionalToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';

const submitResponseMutation = async (id: string, values: any) => {
  const token = await getOptionalToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers: Record<string, string> = {};
  if (tenantId) headers.tenantId = tenantId;
  if (token) headers.Authorization = `Bearer ${token}`;

  return crudRequest({
    url: `${ORG_DEV_URL}/responses/public/${id}`,
    method: 'post',
    headers,
    data: values,
  });
};

function buildResponseDetailUpdatePayload(values: any): {
  responseDetail: any[];
} {
  // `values` from the public survey page is the Zustand store shape:
  // [
  //   { questionId, respondentId, responseDetail: [{ id, value }, ...] },
  //   ...
  // ]
  // Backend expects:
  // { responseDetail: [{ id: <uuid>, response: <string> }, ...] }
  if (Array.isArray(values)) {
    const flattened = values.flatMap((q: any) => {
      const details: any[] = Array.isArray(q?.responseDetail)
        ? q.responseDetail
        : [];
      return (
        details
          .map((d: any) => {
            const id = d?.id;
            const response = d?.response ?? d?.value ?? '';
            return {
              // id must be UUID; assume backend already provides UUIDs when pre-filling.
              id: id != null ? String(id) : '',
              response: String(response),
              // Keep questionId if backend ignores/doesn't require it; helps some schemas.
              questionId:
                q?.questionId != null ? String(q.questionId) : undefined,
            };
          })
          // Remove empty records (helps avoid backend UUID validation failures).
          // Remove invalid ids to avoid UUID validation errors.
          .filter((item: any) => item.id !== '' && item.id !== 'undefined')
      );
    });

    return { responseDetail: flattened };
  }

  // Fallback: if caller already sends the expected shape.
  if (
    values &&
    typeof values === 'object' &&
    Array.isArray(values.responseDetail)
  ) {
    return values;
  }

  return { responseDetail: [] };
}

const updateResponseMutation = async (responseId: string, values: any) => {
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
    ({ id, values }: { id: string; values: any }) =>
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
    ({ responseId, values }: { responseId: string; values: any }) =>
      updateResponseMutation(responseId, values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee');
      },
    },
  );
};
