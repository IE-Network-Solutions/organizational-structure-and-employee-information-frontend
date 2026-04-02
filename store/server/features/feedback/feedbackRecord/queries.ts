/**
 * @module fetchQuestionTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const fetchFeedbackRecordById = async (id: string) => {
  const token = await getCurrentToken();
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
  feedbackTypeId,
  feedbackPerspective,
  userId,
  pageSize,
  page,
  empId,
  givenDate,
}: {
  variantType: 'appreciation' | 'reprimand';
  /** When set, API filters by feedback type (Engagement/KPI). Omit to list all types for the variant. */
  feedbackTypeId?: string;
  /** Maps to issuerId=… or recipientId=… on the request (Given by vs Issued to). */
  feedbackPerspective?: 'givenBy' | 'issuedTo' | null;
  userId: string;
  pageSize?: number;
  empId: string;
  page?: number;
  givenDate?: string[];
}) => {
  const token = await getCurrentToken();
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

  const authUserId = useAuthenticationStore.getState().userId ?? '';
  const perspectiveSubjectId =
    empId && empId !== ''
      ? empId
      : userId && userId !== 'all'
        ? userId
        : authUserId;

  if (feedbackPerspective === 'givenBy' && perspectiveSubjectId) {
    urlParams.push(`issuerId=${perspectiveSubjectId}`);
  } else if (feedbackPerspective === 'issuedTo' && perspectiveSubjectId) {
    urlParams.push(`recipientId=${perspectiveSubjectId}`);
  } else if (empId && empId !== '') {
    urlParams.push(`empId=${empId}`);
  }

  if (pageSize) urlParams.push(`limit=${pageSize}`);
  if (page) urlParams.push(`page=${page}`);
  if (variantType) urlParams.push(`variantType=${variantType}`);
  if (feedbackTypeId) urlParams.push(`feedbackTypeId=${feedbackTypeId}`);

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

const fetchAllFeedbackRecordForExport = async ({
  variantType,
  feedbackTypeId,
  feedbackPerspective,
  userId,
  empId,
  givenDate,
}: {
  variantType: 'appreciation' | 'reprimand';
  feedbackTypeId?: string;
  feedbackPerspective?: 'givenBy' | 'issuedTo' | null;
  userId: string;
  empId: string;
  givenDate?: string[];
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  // Constructing the query URL dynamically (without pagination)
  const urlParams: string[] = [];

  if (givenDate?.length) {
    urlParams.push(`startDate=${givenDate[0]}`);
    urlParams.push(`endDate=${givenDate[1]}`);
  }
  if (userId && userId !== 'all') urlParams.push(`userId=${userId}`);

  const authUserId = useAuthenticationStore.getState().userId ?? '';
  const perspectiveSubjectId =
    empId && empId !== ''
      ? empId
      : userId && userId !== 'all'
        ? userId
        : authUserId;

  if (feedbackPerspective === 'givenBy' && perspectiveSubjectId) {
    urlParams.push(`issuerId=${perspectiveSubjectId}`);
  } else if (feedbackPerspective === 'issuedTo' && perspectiveSubjectId) {
    urlParams.push(`recipientId=${perspectiveSubjectId}`);
  } else if (empId && empId !== '') {
    urlParams.push(`empId=${empId}`);
  }

  if (variantType) urlParams.push(`variantType=${variantType}`);
  if (feedbackTypeId) urlParams.push(`feedbackTypeId=${feedbackTypeId}`);

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
  feedbackTypeId,
  feedbackPerspective,
  userId,
  pageSize,
  page,
  empId,
  givenDate,
}: {
  variantType: 'appreciation' | 'reprimand';
  feedbackTypeId?: string;
  feedbackPerspective?: 'givenBy' | 'issuedTo' | null;
  userId: string;
  pageSize?: number;
  empId: string;
  page?: number;
  givenDate?: string[];
}) => {
  return useQuery(
    [
      'feedbackRecord',
      {
        variantType,
        feedbackTypeId: feedbackTypeId ?? null,
        feedbackPerspective: feedbackPerspective ?? null,
        userId,
        empId,
        pageSize,
        page,
        givenDate,
      },
    ],
    () =>
      fetchAllFeedbackRecord({
        variantType,
        feedbackTypeId,
        feedbackPerspective,
        userId,
        pageSize,
        empId,
        page,
        givenDate,
      }),
  );
};

export const useFetchAllFeedbackRecordForExport = ({
  variantType,
  feedbackTypeId,
  feedbackPerspective,
  userId,
  empId,
  givenDate,
}: {
  variantType: 'appreciation' | 'reprimand';
  feedbackTypeId?: string;
  feedbackPerspective?: 'givenBy' | 'issuedTo' | null;
  userId: string;
  empId: string;
  givenDate?: string[];
}) => {
  return useQuery(
    [
      'feedbackRecordForExport',
      {
        variantType,
        feedbackTypeId: feedbackTypeId ?? null,
        feedbackPerspective: feedbackPerspective ?? null,
        userId,
        empId,
        givenDate,
      },
    ],
    () =>
      fetchAllFeedbackRecordForExport({
        variantType,
        feedbackTypeId,
        feedbackPerspective,
        userId,
        empId,
        givenDate,
      }),
    {
      enabled: false, // Only fetch when explicitly called
    },
  );
};
