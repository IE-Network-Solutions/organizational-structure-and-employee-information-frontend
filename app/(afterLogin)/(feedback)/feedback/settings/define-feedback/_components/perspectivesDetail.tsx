import React from 'react';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Card, Dropdown, Popconfirm } from 'antd';
import { Department } from '@/types/dashboard/organization';
import CustomPagination from '@/components/customPagination';
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { useDeletePerspective } from '@/store/server/features/CFR/feedback/mutations';
import { BsThreeDots } from 'react-icons/bs';
import EmptyState from '@/components/empty';

interface PerspectivesDetailProps {
  perspectivesDetail: any;
}
const PerspectivesDetail = ({
  perspectivesDetail,
}: PerspectivesDetailProps) => {
  const { isMobile } = useIsMobile();
  const { data: departments } = useGetDepartments();
  const {
    pageSize,
    setPageSize,
    page,
    setPage,
    setOpen,
    setSelectedFeedback,
    perspectiveOpenDropdownId,
    setPerspectiveOpenDropdownId,
  } = ConversationStore();
  const { mutate: deletePerspective } = useDeletePerspective();
  const perspectiveList = perspectivesDetail ?? [];
  const paginatedData = perspectiveList.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const openCreatePerspective = () => {
    setSelectedFeedback(null);
    setOpen(true);
  };
  const getDepartment = (id: string) => {
    return departments?.find((item: Department) => item.id === id);
  };
  return (
    <div
      className={`rounded-lg border-[1px] border-[#D9D9D9] bg-white shadow-sm ${
        isMobile ? ' p-3 ' : 'p-1'
      }`}
      data-cy="settings-define-feedback-perspectives-panel"
    >
      {perspectiveList.length === 0 ? (
        <div
          className="flex min-h-[220px] items-center justify-center py-6"
          data-cy="settings-define-feedback-perspective-empty"
          id="settingsDefineFeedbackPerspectiveEmptyId"
        >
          <EmptyState
            title="No perspectives yet"
            description="Add a perspective to link feedback with departments."
            actionText="Add perspective"
            onAction={openCreatePerspective}
          />
        </div>
      ) : (
        <>
          {paginatedData?.map((item: any) => (
            <Card
              className={`my-2 border-[#D9D9D9] ${isMobile ? 'mx-0  shadow-none' : 'mx-2'}`}
              key={item.id}
              data-cy={`settings-define-feedback-perspective-card-${item.id}`}
              id={`settingsDefineFeedbackPerspectiveCard${item.id}`}
            >
              <div
                className="flex justify-between items-start"
                data-cy={`settings-define-feedback-perspective-card-content-${item.id}`}
                id={`settingsDefineFeedbackPerspectiveCardContent${item.id}`}
              >
                <div
                  className="Grid gap-8"
                  data-cy={`settings-define-feedback-perspective-card-info-${item.id}`}
                  id={`settingsDefineFeedbackPerspectiveCardInfo${item.id}`}
                >
                  <div
                    data-cy="settings-define-feedback-perspective-name-container"
                    id="settingsDefineFeedbackPerspectiveNameContainer"
                  >
                    <p
                      className="font-bold"
                      data-cy={`settings-define-feedback-perspective-name-${item.id}`}
                      id={`settingsDefineFeedbackPerspectiveName${item.id}`}
                    >
                      {item?.name}
                    </p>
                  </div>
                  <div
                    data-cy="settings-define-feedback-perspective-department-container"
                    id="settingsDefineFeedbackPerspectiveDepartmentContainer"
                  >
                    <p
                      className="text-gray-600"
                      data-cy={`settings-define-feedback-perspective-department-${item.id}`}
                      id={`settingsDefineFeedbackPerspectiveDepartment${item.id}`}
                    >
                      {getDepartment(item?.departmentId)?.name}
                    </p>
                    <p
                      className="text-xs text-gray-400"
                      data-cy={`settings-define-feedback-perspective-date-${item.id}`}
                      id={`settingsDefineFeedbackPerspectiveDate${item.id}`}
                    >
                      {new Date(item?.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <Dropdown
                  trigger={['click']}
                  placement="bottomRight"
                  arrow={false}
                  open={perspectiveOpenDropdownId === item.id}
                  onOpenChange={(open) => {
                    if (open) {
                      setPerspectiveOpenDropdownId(item.id);
                    } else {
                      setPerspectiveOpenDropdownId(null);
                    }
                  }}
                  menu={{
                    onClick: ({ key, domEvent }) => {
                      if (key === 'delete') {
                        domEvent.preventDefault();
                        domEvent.stopPropagation();
                        setPerspectiveOpenDropdownId(item.id);
                        return;
                      }
                      setPerspectiveOpenDropdownId(null);
                    },
                    items: [
                      {
                        key: 'edit',
                        label: 'Edit',
                        icon: <MdOutlineEdit className="w-4 h-4 " />,
                        className: 'text-xs text-gray-600',
                        onClick: () => {
                          setSelectedFeedback(item);
                          setOpen(true);
                          setPerspectiveOpenDropdownId(null);
                        },
                      },
                      {
                        key: 'delete',
                        className: 'text-xs text-gray-600',
                        label: (
                          <Popconfirm
                            title="Are you sure you want to delete?"
                            onConfirm={() => {
                              deletePerspective(item?.id);
                              setPerspectiveOpenDropdownId(null);
                            }}
                            onCancel={() => {
                              setPerspectiveOpenDropdownId(null);
                            }}
                            okText="Yes"
                            cancelText="No"
                            data-cy={`perspective-type-detail-card-delete-confirm-${item.id}`}
                            id={`perspectiveTypeDetailCardDeleteConfirm${item.id}`}
                          >
                            <span
                              className="flex items-center gap-2"
                              data-cy={`perspective-type-detail-delete-option-${item.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPerspectiveOpenDropdownId(item.id);
                              }}
                            >
                              <MdOutlineDelete className="w-4 h-4" />
                              Delete
                            </span>
                          </Popconfirm>
                        ),
                      },
                    ],
                  }}
                >
                  <button
                    type="button"
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[#D9D9D9] bg-transparent p-1 font-extrabold text-2xl text-black hover:border-primary hover:text-primary"
                    data-cy={`settings-define-feedback-perspective-actions-button-${item.id}`}
                    id={`settingsDefineFeedbackPerspectiveActionsButton${item.id}`}
                  >
                    <BsThreeDots
                      id={`settingsDefineFeedbackPerspectiveActions${item.id}`}
                      data-cy={`settingsDefineFeedbackPerspectiveActions${item.id}`}
                    />
                  </button>
                </Dropdown>
              </div>
            </Card>
          ))}
          <CustomPagination
            current={page}
            total={perspectiveList.length}
            pageSize={pageSize}
            onChange={(page, size) => {
              setPage(page);
              setPageSize(size);
            }}
            onShowSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            data-cy="settings-define-feedback-perspective-pagination"
          />
        </>
      )}
    </div>
  );
};

export default PerspectivesDetail;
