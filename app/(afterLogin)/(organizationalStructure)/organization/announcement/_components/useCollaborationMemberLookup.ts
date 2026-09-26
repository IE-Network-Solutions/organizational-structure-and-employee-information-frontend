'use client';

import { useMemo } from 'react';
import {
  useGetAllUsers,
  useGetAllUsersData,
} from '@/store/server/features/employees/employeeManagment/queries';
import type { SpaceMember } from './mockAnnouncementService';

/**
 * Org-and-emp user list responses vary by endpoint:
 * - `/users/all-users/all` → `{ items: [...] }` or a bare array
 * - `/users` → often an id-keyed object map `{ [userId]: user }`
 */
const normalizeUsers = (data: unknown): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  if (typeof data !== 'object') return [];
  const body = data as Record<string, unknown>;

  const candidates = [
    body.items,
    body.data,
    body.users,
    body.employees,
    (body.data as Record<string, unknown> | undefined)?.items,
    (body.data as Record<string, unknown> | undefined)?.users,
    (body.data as Record<string, unknown> | undefined)?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate as any[];
    }
  }

  // Id-keyed map: { [uuid]: { id, firstName, ... }, ... }
  const values = Object.values(body).filter(
    (value) =>
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      ('id' in (value as object) ||
        'email' in (value as object) ||
        'firstName' in (value as object) ||
        'fullName' in (value as object)),
  ) as any[];

  if (values.length > 0) return values;

  return [];
};

const getUserName = (user: any) => {
  const employeeInfo = user?.employeeInformation;
  return (
    user?.fullName ||
    employeeInfo?.fullName ||
    [
      user?.firstName || employeeInfo?.firstName,
      user?.middleName || employeeInfo?.middleName,
      user?.lastName || employeeInfo?.lastName,
    ]
      .filter(Boolean)
      .join(' ') ||
    user?.email ||
    'Unknown user'
  );
};

const toSpaceMember = (user: any): SpaceMember | null => {
  const id = String(user?.id || user?.userId || '').trim();
  if (!id) return null;
  return {
    id,
    name: getUserName(user),
    email: user?.email ? String(user.email) : undefined,
    avatarUrl:
      user?.profileImage ||
      user?.employeeInformation?.profileImage ||
      user?.avatar ||
      undefined,
  };
};

export const useCollaborationMemberLookup = () => {
  // Primary: full employee payload used across payroll/OKR.
  const { data: allUsersData } = useGetAllUsersData();
  // Fallback: `/users` (widely used for people pickers; often an id-keyed map).
  const { data: allUsers } = useGetAllUsers();

  return useMemo(() => {
    const lookup = new Map<string, SpaceMember>();

    const primary = normalizeUsers(allUsersData);
    const fallback = primary.length > 0 ? [] : normalizeUsers(allUsers);
    const users = primary.length > 0 ? primary : fallback;

    for (const user of users) {
      const member = toSpaceMember(user);
      if (member) lookup.set(member.id, member);
    }
    return lookup;
  }, [allUsersData, allUsers]);
};

export const useAvailableOrgMembers = (existingMemberIds: Set<string>) => {
  const memberLookup = useCollaborationMemberLookup();
  const { isLoading: allUsersDataLoading } = useGetAllUsersData();
  const { isLoading: allUsersLoading } = useGetAllUsers();

  const members = useMemo(
    () =>
      Array.from(memberLookup.values())
        .filter((member) => !existingMemberIds.has(member.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [memberLookup, existingMemberIds],
  );

  return {
    members,
    isLoading: allUsersDataLoading || allUsersLoading,
    totalFromOrg: memberLookup.size,
  };
};
