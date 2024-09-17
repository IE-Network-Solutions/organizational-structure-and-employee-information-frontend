import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { QuestionData } from './interface';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';

const fetchQuestions = async (searchTitle: string | null) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const current = useOrganizationalDevelopment.getState().current;
  const pageSize = useOrganizationalDevelopment.getState().pageSize;

  return crudRequest({
    url: `${ORG_DEV_URL}/questions?page=${current}&&limit=${pageSize}&&question=${searchTitle}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
const fetchQuestionsByFormId = async (
  formId: string,
  searchTitle: string | null,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const current = useOrganizationalDevelopment.getState().current;
  const pageSize = useOrganizationalDevelopment.getState().pageSize;

  return crudRequest({
    url: `${ORG_DEV_URL}/questions/by-form-id/${formId}?page=${current}&&limit=${pageSize}&&question=${searchTitle}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
const fetchIndividualResponses = async (
  formId: string,
  userId: string | null,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/responses/by-user/${formId}/""`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
const fetchAllIndividualResponses = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/responses`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
const fetchAllIndividualResponsesByformId = async (formId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/responses/by-formId/${formId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};
const fetchAllActionPlans = async (formId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_DEV_URL}/action-plans/by-formid/${formId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

export const useGetAllActionPlan = (formId: string) => {
  return useQuery<any>(['actionPlans', formId], () =>
    fetchAllActionPlans(formId),
  );
};
export const useFetchedQuestions = (searchTitle: string | null) => {
  return useQuery<QuestionData>(['questions', searchTitle], () =>
    fetchQuestions(searchTitle),
  );
};
export const useFetchedQuestionsByFormId = (
  formId: string,
  searchTitle: string | null,
) => {
  return useQuery<QuestionData>(['questions', formId, searchTitle], () =>
    fetchQuestionsByFormId(formId, searchTitle),
  );
};

export const useFetchedIndividualResponses = (
  formId: string,
  userId: string | null,
) => {
  return useQuery<any>(
    ['individualResponses', formId, userId],
    () => fetchIndividualResponses(formId, userId),
    // {
    //   enabled: !!userId, // Only run the query when userId is not null or undefined
    // },
  );
};

export const useFetchedAllIndividualResponses = () => {
  return useQuery<any>('allIndividualResponses', fetchAllIndividualResponses);
};
export const useFetchedAllIndividualResponsesByFormId = (formId: string) => {
  return useQuery<any>(['allIndividualResponses', formId], () =>
    fetchAllIndividualResponsesByformId(formId),
  );
};
