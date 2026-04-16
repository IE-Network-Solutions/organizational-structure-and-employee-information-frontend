import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Objective } from '@/store/uistate/features/okrplanning/okr/interface';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';

const tenantId = useAuthenticationStore.getState().tenantId;

type ResponseData = {
  items: Objective[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

const getObjectiveByUser = async (
  id: number | string,
  pageSize: number,
  currentPage: number,
  metricTypeId: string,
  fiscalYearId?: string,
  sessions?: string[],
  keyResultDeadlineFilter?: string,
) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    } as const;

    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(pageSize));
    if (metricTypeId) params.set('metricTypeId', metricTypeId);
    if (fiscalYearId) params.set('fiscalYearId', fiscalYearId);
    if (sessions && sessions.length > 0) params.set('sessionId', sessions[0]);
    if (keyResultDeadlineFilter)
      params.set('keyResultDeadlineFilter', keyResultDeadlineFilter);

    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/${id}?${params.toString()}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getObjectiveByTeam = async (
  pageSize: number,
  currentPage: number,
  users: (string | number)[],
  userId: string,
  metricTypeId: string,
  fiscalYearId?: string,
  sessions?: string[],
  keyResultDeadlineFilter?: string,
) => {
  const token = await getCurrentToken();
  try {
    const urlParams = new URLSearchParams();
    urlParams.set('page', String(currentPage));
    urlParams.set('limit', String(pageSize));
    if (fiscalYearId) urlParams.set('fiscalYearId', fiscalYearId);
    if (sessions && sessions.length > 0)
      urlParams.set('sessionId', sessions[0]);

    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/team?${urlParams.toString()}`,
      method: 'POST',
      data: {
        users,
        metricTypeId,
        fiscalYearId,
        sessionId: sessions && sessions.length > 0 ? sessions[0] : undefined,
        ...(keyResultDeadlineFilter && { keyResultDeadlineFilter }),
      },
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
        userId: userId,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getObjectiveByCompany = async (
  id: number | string,
  pageSize: number,
  currentPage: number,
  users: number[],
  userId: string,
  metricTypeId: string,
  fiscalYearId?: string,
  sessions?: string[],
  keyResultDeadlineFilter?: string,
) => {
  const token = await getCurrentToken();
  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/company/okr/${id}?page=${currentPage}&limit=${pageSize}`,
      method: 'POST',
      data: {
        users,
        userId,
        metricTypeId,
        fiscalYearId,
        sessionId: sessions && sessions.length > 0 ? sessions[0] : undefined,
        ...(keyResultDeadlineFilter && { keyResultDeadlineFilter }),
      },
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getEmployeeOkr = async (
  sessions: string[],
  searchObjParams: {
    userId: string;
    metricTypeId: string;
    departmentId: string;
  },
  page: number,
  currentPage: number,
  keyResultDeadlineFilter?: string,
) => {
  const token = await getCurrentToken();
  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/objective/get-okr-progress/all-employees?page=${currentPage}&limit=${page}`,
      method: 'POST',
      data: {
        sessions,
        userId: searchObjParams?.userId,
        departmentId: searchObjParams?.departmentId,
        metricTypeId: searchObjParams?.metricTypeId,
        ...(keyResultDeadlineFilter && { keyResultDeadlineFilter }),
      },
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const useGetUserObjective = (
  postId: number | string,
  pageSize: number,
  currentPage: number,
  metricTypeId: string,
  fiscalYearId?: string,
  sessions?: string[],
  keyResultDeadlineFilter?: string,
) =>
  useQuery<ResponseData>(
    [
      'ObjectiveInformation',
      postId,
      pageSize,
      currentPage,
      metricTypeId,
      fiscalYearId,
      sessions,
      keyResultDeadlineFilter,
    ],
    () =>
      getObjectiveByUser(
        postId,
        pageSize,
        currentPage,
        metricTypeId,
        fiscalYearId,
        sessions,
        keyResultDeadlineFilter,
      ),
    {
      keepPreviousData: true,
    },
  );

export const useGetTeamObjective = (
  pageSize: number,
  currentPage: number,
  users: (string | number)[],
  userId: string,
  metricTypeId: string,
  fiscalYearId?: string,
  sessions?: string[],
  keyResultDeadlineFilter?: string,
) =>
  useQuery<ResponseData>(
    [
      'teamObjectiveInformation',
      users,
      pageSize,
      currentPage,
      userId,
      metricTypeId,
      fiscalYearId,
      sessions,
      keyResultDeadlineFilter,
    ],
    () =>
      getObjectiveByTeam(
        pageSize,
        currentPage,
        users,
        userId,
        metricTypeId,
        fiscalYearId,
        sessions,
        keyResultDeadlineFilter,
      ),
    {
      keepPreviousData: true,
      enabled: users.length > 0 && !!userId,
    },
  );

export const useGetCompanyObjective = (
  postId: number | string,
  pageSize: number,
  currentPage: number,
  users: number[],
  userId: string,
  metricTypeId: string,
  fiscalYearId?: string,
  sessions?: string[],
  keyResultDeadlineFilter?: string,
) =>
  useQuery<ResponseData>(
    [
      'companyObjectiveInformation',
      users,
      postId,
      pageSize,
      currentPage,
      userId,
      metricTypeId,
      fiscalYearId,
      sessions,
      keyResultDeadlineFilter,
    ],
    () =>
      getObjectiveByCompany(
        postId,
        pageSize,
        currentPage,
        users,
        userId,
        metricTypeId,
        fiscalYearId,
        sessions,
        keyResultDeadlineFilter,
      ),
    {
      keepPreviousData: true,
    },
  );

export const useGetEmployeeOkr = (
  sessions: string[],
  searchObjParams: {
    userId: string;
    metricTypeId: string;
    departmentId: string;
  },
  page: number,
  currentPage: number,
  keyResultDeadlineFilter?: string,
  queryOptions?: { enabled?: boolean },
) =>
  useQuery<ResponseData>(
    [
      'employeeOkrInformation',
      sessions,
      searchObjParams,
      page,
      currentPage,
      keyResultDeadlineFilter,
    ],
    () =>
      getEmployeeOkr(
        sessions,
        searchObjParams,
        page,
        currentPage,
        keyResultDeadlineFilter,
      ),
    {
      keepPreviousData: true,
      enabled: queryOptions?.enabled ?? true,
    },
  );
