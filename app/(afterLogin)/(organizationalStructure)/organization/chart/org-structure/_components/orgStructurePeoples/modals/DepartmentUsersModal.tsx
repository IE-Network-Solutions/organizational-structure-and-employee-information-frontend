'use client';

import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { Avatar, Typography, Spin } from 'antd';
import { User } from 'lucide-react';
import useDepartmentStore from '@/store/uistate/features/organizationStructure/orgState/departmentStates';
import { useGetDepartmentUsersWithoutTeamLead } from '@/store/server/features/organizationStructure/organizationalChart/query';
import type { DepartmentStaffUser } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import { useIsMobile } from '@/hooks/useIsMobile';

/** Normalize API item: may be user object or { user, role, employeeJobInformation } shape */
function normalizeUser(
  item: DepartmentStaffUser & {
    user?: DepartmentStaffUser;
    employeeJobInformation?: DepartmentStaffUser['employeeJobInformation'];
  },
): DepartmentStaffUser {
  if (item.user && typeof item.user === 'object') {
    return {
      ...item.user,
      role: item.role ?? item.user.role,
      position: item.position ?? item.user.position,
      employeeJobInformation:
        item.employeeJobInformation ?? item.user.employeeJobInformation,
    };
  }
  return item;
}

function getDisplayName(u: DepartmentStaffUser): string {
  const first = u.firstName ?? '';
  const middle = u.middleName ?? '';
  const last = u.lastName ?? '';
  return [first, middle, last].filter(Boolean).join(' ').trim() || '—';
}

function getPosition(u: DepartmentStaffUser): string {
  return (
    u.employeeJobInformation?.[0]?.position?.name ??
    u.position?.name ??
    u.role?.name ??
    ''
  );
}

export function DepartmentUsersModal() {
  const usersModalOpen = useDepartmentStore((s) => s.usersModalOpen);
  const usersModalDepartmentId = useDepartmentStore(
    (s) => s.usersModalDepartmentId,
  );
  const usersModalAnchor = useDepartmentStore((s) => s.usersModalAnchor);
  const usersModalScreenPosition = useDepartmentStore(
    (s) => s.usersModalScreenPosition,
  );
  const fullNodes = useDepartmentStore((s) => s.fullNodes);
  const setUsersModalOpen = useDepartmentStore((s) => s.setUsersModalOpen);
  const setUsersModalDepartmentId = useDepartmentStore(
    (s) => s.setUsersModalDepartmentId,
  );
  const setUsersModalAnchor = useDepartmentStore((s) => s.setUsersModalAnchor);
  const setUsersModalFlowPosition = useDepartmentStore(
    (s) => s.setUsersModalFlowPosition,
  );
  const setUsersModalScreenPosition = useDepartmentStore(
    (s) => s.setUsersModalScreenPosition,
  );

  const { data: users = [], isLoading } = useGetDepartmentUsersWithoutTeamLead(
    usersModalDepartmentId,
  );

  /** Show only tree users (have employeeJobInformation in the org tree) */
  const treeUsers = useMemo(() => {
    return users.filter((item) => {
      const u = normalizeUser(
        item as DepartmentStaffUser & { user?: DepartmentStaffUser },
      );
      return u.employeeJobInformation && u.employeeJobInformation.length > 0;
    });
  }, [users]);

  const handleClose = useCallback(() => {
    setUsersModalOpen(false);
    setUsersModalDepartmentId(null);
    setUsersModalAnchor(null);
    setUsersModalFlowPosition(null);
    setUsersModalScreenPosition(null);
  }, [
    setUsersModalOpen,
    setUsersModalDepartmentId,
    setUsersModalAnchor,
    setUsersModalFlowPosition,
    setUsersModalScreenPosition,
  ]);

  /** Use screen position (sticks to node when chart moves) when set, else initial anchor */
  const position =
    usersModalScreenPosition ?? (usersModalOpen && usersModalAnchor ? usersModalAnchor : null);
  const useAnchor = !!position;
  const cardRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useIsMobile();

  /** Modal dimensions for viewport clamping (smaller on mobile) */
  const modalWidth = isMobile ? 140 : 180;
  const modalHeightEstimate = isMobile ? 100 : 145;
  const margin = 8;

  /** Clamp position so modal stays visible inside viewport (especially on mobile) */
  const [clampedPosition, setClampedPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!useAnchor || !position) {
      setClampedPosition(null);
      return;
    }
    const left = position.left + 4;
    const top = position.top;
    const maxLeft = typeof window !== 'undefined' ? window.innerWidth - modalWidth - margin : 400;
    const maxTop =
      typeof window !== 'undefined' ? window.innerHeight - modalHeightEstimate - margin : 400;
    setClampedPosition({
      left: Math.max(margin, Math.min(left, maxLeft)),
      top: Math.max(margin, Math.min(top, maxTop)),
    });
  }, [position?.left, position?.top, useAnchor, modalWidth, modalHeightEstimate]);

  useEffect(() => {
    if (!useAnchor) return;
    const onResize = () => {
      if (!position) return;
      const left = position.left + 4;
      const top = position.top;
      const maxLeft = window.innerWidth - modalWidth - margin;
      const maxTop = window.innerHeight - modalHeightEstimate - margin;
      setClampedPosition({
        left: Math.max(margin, Math.min(left, maxLeft)),
        top: Math.max(margin, Math.min(top, maxTop)),
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [useAnchor, position?.left, position?.top, modalWidth, modalHeightEstimate]);


  /** Close when clicking outside the card (no full-viewport overlay, so zoomed chart stays visible) */
  useEffect(() => {
    if (!usersModalOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [usersModalOpen, handleClose]);

  /** Accent bar uses department color (from node borderColor) or fallback */
  const departmentNode = fullNodes.find(
    (n) => n.id === usersModalDepartmentId && (n as { type?: string }).type === 'orgNode',
  );
  const accentColor =
    (departmentNode as { data?: { borderColor?: string } } | undefined)?.data
      ?.borderColor ?? '#4A3728';

  if (!usersModalOpen) return null;

  const bodyContent = isLoading ? (
    <div
      className="flex justify-center py-1.5"
      data-cy="org-structure-department-users-loading"
    >
      <Spin size="small" />
    </div>
  ) : treeUsers.length === 0 ? (
    <Typography.Text
      type="secondary"
      className="block py-0.5 sm:py-1 text-center text-[10px] sm:text-[11px]"
    >
      No staff in this department.
    </Typography.Text>
  ) : (
    <div
      className="max-h-[80px] sm:max-h-[120px] overflow-y-auto overflow-x-hidden pr-0.5"
      data-cy="org-structure-department-users-list"
    >
      <ul
        className="list-none p-0 m-0"
        data-cy="org-structure-department-users-ul"
      >
        {treeUsers.map((item, index) => {
          const user = normalizeUser(
            item as DepartmentStaffUser & { user?: DepartmentStaffUser },
          );
          return (
            <li
              key={user.id ?? user.userId ?? index}
              className="min-h-[28px] sm:min-h-[34px] flex flex-col justify-center"
              data-cy="org-structure-department-user-item"
            >
              {index > 0 && (
                <div
                  className="border-t border-gray-100 shrink-0"
                  aria-hidden
                  data-cy="org-structure-department-user-divider"
                />
              )}
              <div
                className="flex items-center gap-1.5 sm:gap-2 py-0.5 sm:py-1 flex-1 min-h-[26px] sm:min-h-[30px]"
                data-cy="org-structure-department-user-row"
              >
                <Avatar
                  size={isMobile ? 16 : 20}
                  src={user.profileImage ?? user.profileImageDownload}
                  icon={
                    !user.profileImage && !user.profileImageDownload ? (
                      <User
                        className="!text-white"
                        size={isMobile ? 8 : 10}
                        strokeWidth={2}
                      />
                    ) : undefined
                  }
                  className="shrink-0 bg-gray-400"
                />
                <div
                  className="min-w-0 flex-1 text-left overflow-hidden"
                  data-cy="org-structure-department-user-info"
                >
                  <Typography.Text
                    strong
                    className="block text-gray-800 text-[10px] sm:text-[11px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {getDisplayName(user)}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    className="block text-[9px] sm:text-[10px] leading-tight mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {getPosition(user) || '—'}
                  </Typography.Text>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-label="Department staff"
      className={`flex flex-col w-full fixed z-[1000] shadow-lg ${isMobile ? 'max-w-[140px]' : 'max-w-[180px]'}`}
      style={{
        top: useAnchor
          ? (clampedPosition ? clampedPosition.top : position!.top)
          : '50%',
        left: useAnchor
          ? (clampedPosition ? clampedPosition.left : position!.left + 4)
          : '50%',
        ...(useAnchor ? {} : { transform: 'translate(-50%, -50%)' }),
      }}
      data-cy="org-structure-department-users-modal"
    >
      <div
        className="h-0.5 sm:h-1 w-full rounded-t-md shrink-0"
        style={{ backgroundColor: accentColor }}
        data-cy="org-structure-department-users-modal-accent"
      />
      <div
        className="rounded-b-md border border-t-0 border-gray-200 bg-white overflow-visible"
        style={{
          padding: isMobile ? '4px 6px' : '6px 8px',
          maxHeight: isMobile ? 90 : 140,
        }}
        data-cy="org-structure-department-users-modal-body"
      >
        {bodyContent}
      </div>
    </div>
  );
}
