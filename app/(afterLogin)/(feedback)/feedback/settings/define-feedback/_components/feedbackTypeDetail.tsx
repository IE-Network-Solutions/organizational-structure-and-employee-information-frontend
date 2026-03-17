import CustomPagination from '@/components/customPagination';
import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Button, Card, Popconfirm, Tabs, Input, Dropdown } from 'antd';
import { Edit2Icon } from 'lucide-react';
import React from 'react';
import { BiPlus } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';
import { MoreOutlined } from '@ant-design/icons';

interface FeedbackTypeDetailProps {
  feedbackTypeDetail: any;
  variant: string;
}

function FeedbackTypeDetail({
  feedbackTypeDetail,
  variant,
}: FeedbackTypeDetailProps) {
  const { mutate: deleteFeedback, isLoading: deleteLoading } =
    useDeleteFeedback();

  const {
    setOpen,
    setSelectedFeedback,
    page,
    setPage,
    pageSize,
    setSearchAppreciationQuery,
    setSearchReprimandQuery,
  } = ConversationStore();

  // const handleDelete = (id: string) => {
  //   deleteFeedback(id);
  // };
  // const editHandler = (item: string) => {
  //   setSelectedFeedback(item);
  // };

  // Sort by createdAt in descending order (latest first)

  return (
    <>
      <div
        className="flex justify-between text-xs mx-2 overflow-x-auto "
        data-cy={`feedback-type-detail-${variant}-actions`}
        id={`feedbackTypeDetail${variant}Actions`}
      >
        <div
          style={{ marginBottom: 16 }}
          data-cy={`feedback-type-detail-${variant}-search-container`}
          id={`feedbackTypeDetail${variant}SearchContainer`}
        >
          <Input.Search
            placeholder="Search feedbacks..."
            allowClear
            onChange={(e) =>
              variant === 'appreciation'
                ? setSearchAppreciationQuery(e.target.value)
                : variant === 'reprimand'
                  ? setSearchReprimandQuery(e.target.value)
                  : null
            }
            className="w-full sm:w-80 md:w-96 lg:w-[300px]"
            data-cy={`feedback-type-detail-${variant}-search`}
            id={`feedbackTypeDetail${variant}Search`}
          />
        </div>
      </div>
      {feedbackTypeDetail?.items?.map((item: any) => (
        <Card
          className="mx-2 mb-2"
          key={item.id}
          data-cy={`feedback-type-detail-${variant}-card-${item.id}`}
          id={`feedbackTypeDetail${variant}Card${item.id}`}
        >
          <div
            className="flex justify-between"
            data-cy={`feedback-type-detail-${variant}-card-content-${item.id}`}
            id={`feedbackTypeDetail${variant}CardContent${item.id}`}
          >
            <div
              data-cy={`feedback-type-detail-${variant}-card-info-${item.id}`}
              id={`feedbackTypeDetail${variant}CardInfo${item.id}`}
            >
              <p
                data-cy={`feedback-type-detail-${variant}-card-name-${item.id}`}
                id={`feedbackTypeDetail${variant}CardName${item.id}`}
              >
                {item?.name}
              </p>
              <p
                className="text-xs text-gray-500"
                data-cy={`feedback-type-detail-${variant}-card-description-${item.id}`}
                id={`feedbackTypeDetail${variant}CardDescription${item.id}`}
              >
                {item?.description}
              </p>
            </div>
            <p
              className="flex gap-2"
              data-cy={`feedback-type-detail-${variant}-card-actions-${item.id}`}
              id={`feedbackTypeDetail${variant}CardActions${item.id}`}
            >
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                      // onClick: () => handleEdit(item),
                    },
                    {
                      key: 'delete',
                      label: 'Delete',
                      icon: (
                        <Popconfirm
                          title="Are you sure you want to delete?"
                          // onConfirm={() => handleDelete(item?.id)}
                          okText="Yes"
                          cancelText="No"
                          data-cy={`feedback-type-detail-${variant}-card-delete-confirm-${item.id}`}
                          id={`feedbackTypeDetail${variant}CardDeleteConfirm${item.id}`}
                        >
                          <span className="flex items-center gap-2">
                            <MdDeleteOutline className="w-4 h-4" />
                          </span>
                        </Popconfirm>
                      ),
                    },
                  ],
                }}
              >
                <Button
                  size="small"
                  shape="default"
                  icon={<MoreOutlined />}
                  data-cy={`settings-define-feedback-perspective-actions-button-${item.id}`}
                  id={`settingsDefineFeedbackPerspectiveActionsButton${item.id}`}
                />
              </Dropdown>
            </p>
          </div>
        </Card>
      ))}
      {feedbackTypeDetail?.meta && (
        <CustomPagination
          current={page}
          total={feedbackTypeDetail?.meta?.totalItems}
          pageSize={pageSize}
          onChange={(page) => {
            setPage(page);
          }}
          onShowSizeChange={() => {
            setPage(1);
          }}
          data-cy={`feedback-type-detail-${variant}-pagination`}
        />
      )}
    </>
  );
}

export default FeedbackTypeDetail;
