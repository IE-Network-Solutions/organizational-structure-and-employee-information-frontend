import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import type {
  BasecampModuleRow,
  BasecampPersonOption,
  BasecampProjectMapping,
  BasecampProjectOption,
  BasecampStatus,
  BasecampUserMapping,
} from './types';

const base = () => {
  const url = PAYROLL_URL;
  if (!url) {
    throw new Error('PAYROLL_URL is not configured');
  }
  return `${url}/integrations/basecamp`;
};

const authHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId ?? '',
  };
};

export const basecampQueryKeys = {
  all: ['basecamp'] as const,
  status: () => [...basecampQueryKeys.all, 'status'] as const,
  modules: () => [...basecampQueryKeys.all, 'modules'] as const,
  projectMappings: () => [...basecampQueryKeys.all, 'projectMappings'] as const,
  userMappings: () => [...basecampQueryKeys.all, 'userMappings'] as const,
  projects: () => [...basecampQueryKeys.all, 'projects'] as const,
  people: () => [...basecampQueryKeys.all, 'people'] as const,
};

async function getStatus(): Promise<BasecampStatus> {
  return crudRequest({
    url: `${base()}/status`,
    method: 'GET',
    headers: await authHeaders(),
  });
}

async function getModules(): Promise<BasecampModuleRow[]> {
  return crudRequest({
    url: `${base()}/modules`,
    method: 'GET',
    headers: await authHeaders(),
  });
}

async function getProjectMappings(): Promise<BasecampProjectMapping[]> {
  return crudRequest({
    url: `${base()}/project-mappings`,
    method: 'GET',
    headers: await authHeaders(),
  });
}

async function getUserMappings(): Promise<BasecampUserMapping[]> {
  return crudRequest({
    url: `${base()}/user-mappings`,
    method: 'GET',
    headers: await authHeaders(),
  });
}

async function getProjects(): Promise<BasecampProjectOption[]> {
  return crudRequest({
    url: `${base()}/projects`,
    method: 'GET',
    headers: await authHeaders(),
  });
}

async function getPeople(): Promise<BasecampPersonOption[]> {
  return crudRequest({
    url: `${base()}/people`,
    method: 'GET',
    headers: await authHeaders(),
  });
}

export function useBasecampStatus() {
  const token = useAuthenticationStore((s) => s.token);
  return useQuery({
    queryKey: basecampQueryKeys.status(),
    queryFn: getStatus,
    enabled: !!token && !!PAYROLL_URL,
  });
}

export function useBasecampModules() {
  const token = useAuthenticationStore((s) => s.token);
  return useQuery({
    queryKey: basecampQueryKeys.modules(),
    queryFn: getModules,
    enabled: !!token && !!PAYROLL_URL,
  });
}

export function useBasecampProjectMappings() {
  const token = useAuthenticationStore((s) => s.token);
  return useQuery({
    queryKey: basecampQueryKeys.projectMappings(),
    queryFn: getProjectMappings,
    enabled: !!token && !!PAYROLL_URL,
  });
}

export function useBasecampUserMappings() {
  const token = useAuthenticationStore((s) => s.token);
  return useQuery({
    queryKey: basecampQueryKeys.userMappings(),
    queryFn: getUserMappings,
    enabled: !!token && !!PAYROLL_URL,
  });
}

export function useBasecampProjects(enabled: boolean) {
  const token = useAuthenticationStore((s) => s.token);
  return useQuery({
    queryKey: basecampQueryKeys.projects(),
    queryFn: getProjects,
    enabled: !!token && !!PAYROLL_URL && enabled,
  });
}

export function useBasecampPeople(enabled: boolean) {
  const token = useAuthenticationStore((s) => s.token);
  return useQuery({
    queryKey: basecampQueryKeys.people(),
    queryFn: getPeople,
    enabled: !!token && !!PAYROLL_URL && enabled,
  });
}

export async function fetchBasecampConnectUrl(): Promise<{ url: string }> {
  return crudRequest({
    url: `${base()}/connect`,
    method: 'GET',
    headers: await authHeaders(),
  });
}
