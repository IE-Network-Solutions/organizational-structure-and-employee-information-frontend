/**
 * @module fetchQuestionTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const fetchFeedbackRecordById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/feedback-type/${id}`,
    method: 'GET',
    headers,
  });
};
const fetchAllFeedbackRecord = async ({
  variantType,
  activeTab,
  userId,
  pageSize,
  page,
  empId,
  givenDate,
}: {
  variantType: 'appreciation' | 'reprimand';
  activeTab: string;
  userId: string;
  pageSize?: number;
  empId: string;
  page?: number;
  givenDate?: string[];
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  // Constructing the query URL dynamically
  const urlParams: string[] = [];

  if (givenDate?.length) {
    urlParams.push(`startDate=${givenDate[0]}`);
    urlParams.push(`endDate=${givenDate[1]}`);
  }
  if (userId && userId !== 'all') urlParams.push(`userId=${userId}`);
  if (empId && empId !== '') urlParams.push(`empId=${empId}`);
  if (pageSize) urlParams.push(`limit=${pageSize}`);
  if (page) urlParams.push(`page=${page}`);
  if (variantType) urlParams.push(`variantType=${variantType}`);
  if (activeTab) urlParams.push(`feedbackTypeId=${activeTab}`);

  const url = `${ORG_DEV_URL}/feedback-record?${urlParams.join('&')}`;

  try {
    return await crudRequest({
      url: url,
      method: 'GET',
      headers,
    });
  } catch (error) {
    throw error;
  }
};
export const useFetchFeedbackRecordById = (id: string) => {
  return useQuery(
    ['feedbackRecord', id], // Include `id` in the query key for caching
    () => fetchFeedbackRecordById(id), // Fetch function
    // {
    //   enabled: !!id, // Conditionally enable the query
    // },
  );
};

export const useFetchAllFeedbackRecord = ({
  variantType,
  activeTab,
  userId,
  pageSize,
  page,
  empId,
  givenDate,
}: {
  variantType: 'appreciation' | 'reprimand';
  activeTab: string;
  userId: string;
  pageSize?: number;
  empId: string;
  page?: number;
  givenDate?: string[];
}) => {
  return useQuery(
    [
      'feedbackRecord',
      { variantType, activeTab, userId, empId, pageSize, page, givenDate },
    ],
    () =>
      fetchAllFeedbackRecord({
        variantType,
        activeTab,
        userId,
        pageSize,
        empId,
        page,
        givenDate,
      }),
  );
};
