import React from 'react';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Button, Card, Dropdown, Popconfirm } from 'antd';
import { Department } from '@/types/dashboard/organization';
import { EllipsisOutlined } from '@ant-design/icons';
import CustomPagination from '@/components/customPagination';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import {
  useDeletePerspective,
  useUpdatePerspective,
} from '@/store/server/features/CFR/feedback/mutations';

interface PerspectivesDetailProps {
  perspectivesDetail: any;
}
const PerspectivesDetail = ({
  perspectivesDetail,
}: PerspectivesDetailProps) => {
  const { data: departments } = useGetDepartments();
  const { pageSize, setPageSize, page, setPage, setOpen, setSelectedFeedback } =
    ConversationStore();
  const { mutate: deletePerspective } = useDeletePerspective();
  const paginatedData = perspectivesDetail?.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const getDepartment = (id: string) => {
    return departments?.find((item: Department) => item.id === id);
  };
  return (
    <div className="border-[1px] rounded-lg p-1">
      {paginatedData?.map((item: any) => (
        <Card
          className="mx-2 my-2"
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
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                    onClick: () => {
                      setSelectedFeedback(item);
                      setOpen(true);
                    },
                  },
                  {
                    key: 'delete',
                    label: (
                      <Popconfirm
                        title="Are you sure you want to delete?"
                        onConfirm={() => deletePerspective(item?.id)}
                        okText="Yes"
                        cancelText="No"
                        data-cy={`perspective-type-detail-card-delete-confirm-${item.id}`}
                        id={`perspectiveTypeDetailCardDeleteConfirm${item.id}`}
                      >
                        <span className="flex items-center gap-2">
                          <MdDeleteOutline className="w-4 h-4" />
                          Delete
                        </span>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
            >
              <Button size="small" icon={<EllipsisOutlined />} />
            </Dropdown>
          </div>
        </Card>
      ))}
      <CustomPagination
        current={page}
        total={perspectivesDetail?.length || 0}
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
    </div>
  );
};

export default PerspectivesDetail;
