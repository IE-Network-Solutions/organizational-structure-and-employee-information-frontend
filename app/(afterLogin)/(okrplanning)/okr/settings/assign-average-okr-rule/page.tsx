'use client';

import React, { useMemo, useState } from 'react';
import { Avatar, Dropdown, Input, MenuProps, Skeleton, Tag } from 'antd';
import { EllipsisOutlined, SearchOutlined } from '@ant-design/icons';
import { useQueries } from 'react-query';
import EmptyState from '@/components/empty';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import {
  getAverageOkrRuleByUser,
  useGetOkrRule,
} from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/queries';
import { useAverageOkrRuleAssignmentStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/average-okr-rule-assignment';
import { AverageOkrRuleAssignment } from '@/store/uistate/features/okrplanning/monitoring-evaluation/average-okr-rule-assignment/interface';
import { useRemoveAverageOkrRuleFromUser } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import AssignmentModal from './_components/assignmentModal';

type TriggerRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const getUserFullName = (user: any) =>
  `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`
    .replace(/\s+/g, ' ')
    .trim();

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);

const EditAssignmentIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-cy="average-okr-rule-assignment-edit-icon"
  >
    <path
      d="M7.37333 4.01333L7.98667 4.62667L1.94667 10.6667H1.33333V10.0533L7.37333 4.01333V4.01333ZM9.77333 0C9.60667 0 9.43333 0.0666666 9.30667 0.193333L8.08667 1.41333L10.5867 3.91333L11.8067 2.69333C12.0667 2.43333 12.0667 2.01333 11.8067 1.75333L10.2467 0.193333C10.1133 0.06 9.94667 0 9.77333 0V0ZM7.37333 2.12667L0 9.5V12H2.5L9.87333 4.62667L7.37333 2.12667V2.12667Z"
      fill="#374151"
      data-cy="average-okr-rule-assignment-edit-icon-path"
    />
  </svg>
);

const DeleteAssignmentIcon = () => (
  <svg
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-cy="average-okr-rule-assignment-delete-icon"
  >
    <path
      d="M0.666667 10.6667C0.666667 11.4 1.26667 12 2 12H7.33333C8.06667 12 8.66667 11.4 8.66667 10.6667V2.66667H0.666667V10.6667ZM2 4H7.33333V10.6667H2V4ZM7 0.666667L6.33333 0H3L2.33333 0.666667H0V2H9.33333V0.666667H7Z"
      fill="#FF4D4F"
      data-cy="average-okr-rule-assignment-delete-icon-path"
    />
  </svg>
);

const AssignAverageOkrRulePage = () => {
  const [searchText, setSearchText] = useState('');
  const [deleteTriggerRect, setDeleteTriggerRect] =
    useState<TriggerRect | null>(null);
  const {
    open,
    setOpen,
    assignment,
    setAssignment,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
  } = useAverageOkrRuleAssignmentStore();

  const { data: allUsersData, isLoading: usersLoading } = useGetAllUsers();
  const { data: okrRulesData, isLoading: rulesLoading } = useGetOkrRule();
  const { mutate: removeAverageOkrRuleFromUser, isLoading: deleteLoading } =
    useRemoveAverageOkrRuleFromUser();

  const allUsers = useMemo(
    () => allUsersData?.items ?? [],
    [allUsersData?.items],
  );
  const okrRules = useMemo(
    () => okrRulesData?.items ?? [],
    [okrRulesData?.items],
  );

  const activeUsers = useMemo(
    () =>
      allUsers.filter(
        (user: any) =>
          !user?.deletedAt &&
          user?.employee_status !== 'inactive' &&
          user?.employee_status !== 'terminated',
      ),
    [allUsers],
  );

  const assignmentQueries = useQueries(
    activeUsers.map((user: any) => ({
      queryKey: ['averageOkrRuleByUser', user.id],
      queryFn: () => getAverageOkrRuleByUser(user.id),
      enabled: Boolean(user?.id),
    })),
  );

  const isAssignmentsLoading = assignmentQueries.some(
    (query) => query.isLoading,
  );

  const normalizedAssignments = useMemo(() => {
    return activeUsers
      .map((user: any, index: number) => {
        const queryData = assignmentQueries[index]?.data as any;
        if (!queryData?.id) {
          return null;
        }

        return {
          id: user.id,
          userId: user.id,
          averageOkrRuleId: queryData.id,
          averageOkrRule: queryData,
          user,
          fullName: getUserFullName(user) || 'Unknown employee',
          ruleTitle: queryData?.title || 'Default Average Okr Rule',
          profileImage: user?.profileImage,
        } as AverageOkrRuleAssignment & {
          fullName: string;
          ruleTitle: string;
          profileImage?: string;
        };
      })
      .filter(Boolean) as Array<
      AverageOkrRuleAssignment & {
        fullName: string;
        ruleTitle: string;
        profileImage?: string;
      }
    >;
  }, [activeUsers, assignmentQueries]);

  const filteredAssignments = useMemo(() => {
    return normalizedAssignments.filter((item) =>
      item.fullName.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [normalizedAssignments, searchText]);

  const isLoading = usersLoading || rulesLoading || isAssignmentsLoading;
  const hasSearch = searchText.trim().length > 0;
  const isFilteredOnlyEmpty =
    filteredAssignments.length === 0 &&
    normalizedAssignments.length > 0 &&
    hasSearch;
  const isEditMode = Boolean(assignment?.id);

  const closeModal = () => {
    setAssignment(null);
    setOpen(false);
  };

  const closeDeleteModal = () => {
    setDeletedId('');
    setOpenDeleteModal(false);
  };

  const handleDeleteModalAfterClose = () => {
    setDeleteTriggerRect(null);
  };

  const handleEdit = (item: AverageOkrRuleAssignment) => {
    setAssignment(item);
    setOpen(true);
  };

  const handleDeleteClick = (item: AverageOkrRuleAssignment) => {
    const button = document.querySelector<HTMLElement>(
      `[data-cy="average-okr-rule-assignment-card-menu-button-${item.id}"]`,
    );

    if (button) {
      const rect = button.getBoundingClientRect();
      setDeleteTriggerRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setDeleteTriggerRect(null);
    }

    setAssignment(item);
    setDeletedId(item.id || '');
    setOpenDeleteModal(true);
  };

  const confirmDelete = () => {
    removeAverageOkrRuleFromUser(deletedId, {
      onSuccess: () => {
        closeDeleteModal();
      },
    });
  };

  const getMenuItems = (item: AverageOkrRuleAssignment): MenuProps['items'] => [
    {
      key: 'edit',
      label: (
        <div
          className="flex items-center gap-3 py-1"
          onClick={() => handleEdit(item)}
          data-cy={`average-okr-rule-assignment-card-edit-${item.id}`}
        >
          <EditAssignmentIcon />
          <span
            className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
            data-cy={`average-okr-rule-assignment-card-edit-text-${item.id}`}
          >
            Edit Assignment
          </span>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: (
        <div
          className="flex items-center gap-3 py-1 text-[#ff4d4f]"
          onClick={() => handleDeleteClick(item)}
          data-cy={`average-okr-rule-assignment-card-delete-${item.id}`}
        >
          <DeleteAssignmentIcon />
          <span
            className="text-[14px] font-normal text-[#FF4D4F]"
            data-cy={`average-okr-rule-assignment-card-delete-text-${item.id}`}
          >
            Delete Assignment
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full" data-cy="average-okr-rule-assignment-page">
      <div
        className="min-h-[400px] rounded-xl bg-white px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5 lg:px-8"
        data-cy="average-okr-rule-assignment-main-container"
      >
        <div
          className="mb-5 w-full max-w-[299px]"
          data-cy="average-okr-rule-assignment-search-wrapper"
        >
          <Input
            placeholder="Search Name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            addonAfter={<SearchOutlined />}
            className="h-8 w-full average-okr-rule-assignment-search"
            data-cy="average-okr-rule-assignment-search-input"
          />
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            data-cy="average-okr-rule-assignment-loading-grid"
          >
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                active
                avatar
                paragraph={{ rows: 2 }}
                className="rounded-[8px] border border-[#f0f0f0] p-5"
              />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div
            className="flex min-h-[280px] items-center justify-center py-8"
            data-cy="average-okr-rule-assignment-empty-state"
          >
            <EmptyState
              title={
                isFilteredOnlyEmpty
                  ? 'No assignments match your search'
                  : 'No OKR rule assignments yet'
              }
              description={
                isFilteredOnlyEmpty
                  ? 'Try a different employee name or clear the search.'
                  : 'Assign an average OKR rule to employees to get started.'
              }
              className="average-okr-rule-assignment-empty-no-icon"
            />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            data-cy="average-okr-rule-assignment-cards-grid"
          >
            {filteredAssignments.map((item) => (
              <div
                key={item.id}
                className="rounded-[8px] bg-[#F9FAFB] p-4 transition-shadow hover:shadow-sm sm:p-5"
                data-cy={`average-okr-rule-assignment-card-${item.id}`}
              >
                <div
                  className="flex items-start justify-between gap-3"
                  data-cy={`average-okr-rule-assignment-card-header-${item.id}`}
                >
                  <div
                    className="flex min-w-0 flex-1 items-start gap-2"
                    data-cy={`average-okr-rule-assignment-card-user-block-${item.id}`}
                  >
                    <div
                      className="flex-shrink-0"
                      data-cy={`average-okr-rule-assignment-card-avatar-wrapper-${item.id}`}
                    >
                      {item.profileImage ? (
                        <Avatar
                          size={24}
                          src={item.profileImage}
                          data-cy={`average-okr-rule-assignment-card-avatar-${item.id}`}
                        />
                      ) : (
                        <Avatar
                          size={24}
                          className="bg-[#f0f0f0] text-[#8c8c8c] text-[10px] font-medium"
                          data-cy={`average-okr-rule-assignment-card-avatar-fallback-${item.id}`}
                        >
                          {getInitials(item.fullName)}
                        </Avatar>
                      )}
                    </div>

                    <div
                      className="min-w-0 flex-1"
                      data-cy={`average-okr-rule-assignment-card-content-${item.id}`}
                    >
                      <p
                        className="truncate text-[14px] font-semibold leading-5 text-[rgba(0,0,0,0.7)]"
                        data-cy={`average-okr-rule-assignment-card-name-${item.id}`}
                      >
                        {item.fullName}
                      </p>
                    </div>
                  </div>

                  <Dropdown
                    menu={{ items: getMenuItems(item) }}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="average-okr-rule-assignment-dropdown"
                  >
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center text-[#8c8c8c] transition-colors hover:text-[#262626] bg-transparent border-none cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                      data-cy={`average-okr-rule-assignment-card-menu-button-${item.id}`}
                    >
                      <EllipsisOutlined
                        style={{ fontSize: 14 }}
                        data-cy={`average-okr-rule-assignment-card-menu-icon-${item.id}`}
                      />
                    </button>
                  </Dropdown>
                </div>

                <div
                  className="mt-3"
                  data-cy={`average-okr-rule-assignment-card-chip-row-${item.id}`}
                >
                  <Tag
                    className="m-0 rounded-[4px] border border-[#D9D9D9] bg-[rgba(0,0,0,0.02)] px-2 py-0.5 text-[12px] font-normal text-[rgba(0,0,0,0.7)]"
                    data-cy={`average-okr-rule-assignment-card-rule-${item.id}`}
                  >
                    {item.ruleTitle}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AssignmentModal
        open={open}
        mode={isEditMode ? 'edit' : 'create'}
        onClose={closeModal}
        assignment={assignment}
        users={allUsers}
        okrRules={okrRules}
      />

      <DeleteModal
        open={openDeleteModal}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        onAfterClose={handleDeleteModalAfterClose}
        triggerRect={deleteTriggerRect ?? undefined}
        loading={deleteLoading}
        title="Delete Assignment"
        deleteMessage="Are you sure you want to delete this assignment?"
        deleteText="Delete"
        cancelText="Cancel"
        hideImage
        danger
        modalClassName="recruitment-settings-delete-modal"
        data-cy="average-okr-rule-assignment-delete-modal"
      />

      <style jsx global data-cy="average-okr-rule-assignment-page-styles">{`
        .average-okr-rule-assignment-search.ant-input-group-wrapper {
          height: 32px !important;
        }
        .average-okr-rule-assignment-search.ant-input-group-wrapper
          .ant-input-wrapper {
          display: flex !important;
          align-items: center !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          background-color: white !important;
          height: 32px !important;
        }
        .average-okr-rule-assignment-search.ant-input-group-wrapper .ant-input {
          border: none !important;
          box-shadow: none !important;
          height: 32px !important;
          padding-left: 12px !important;
          font-size: 14px !important;
          color: #262626 !important;
        }
        .average-okr-rule-assignment-search.ant-input-group-wrapper
          .ant-input::placeholder {
          color: #bfbfbf !important;
        }
        .average-okr-rule-assignment-search.ant-input-group-wrapper
          .ant-input-group-addon {
          background-color: white !important;
          border: none !important;
          border-left: 1px solid #f0f0f0 !important;
          padding: 0 14px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 32px !important;
        }
        .average-okr-rule-assignment-search.ant-input-group-wrapper
          .ant-input-group-addon
          .anticon {
          font-size: 14px !important;
          color: #595959 !important;
        }
        .average-okr-rule-assignment-dropdown .ant-dropdown-menu {
          border-radius: 8px !important;
          padding: 4px !important;
        }
        .average-okr-rule-assignment-dropdown .ant-dropdown-menu-item {
          border-radius: 6px !important;
        }
        .average-okr-rule-assignment-empty-no-icon .ant-empty-image {
          display: none !important;
        }
        .average-okr-rule-assignment-empty-no-icon .ant-empty-description {
          margin-top: 0 !important;
        }
        @media (max-width: 640px) {
          .average-okr-rule-assignment-search.ant-input-group-wrapper
            .ant-input-group-addon {
            padding: 0 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AssignAverageOkrRulePage;
