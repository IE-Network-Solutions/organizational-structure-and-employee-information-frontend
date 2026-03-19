import CustomPagination from '@/components/customPagination';
import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Button, Card, Input, Dropdown, Modal } from 'antd';
import { Edit2Icon } from 'lucide-react';
import React from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { EllipsisOutlined } from '@ant-design/icons';

interface FeedbackTypeDetailProps {
  feedbackTypeDetail: any;
}

function FeedbackTypeDetail({ feedbackTypeDetail }: FeedbackTypeDetailProps) {
  const { mutate: deleteFeedback, isLoading: deleteLoading } =
    useDeleteFeedback();

  const {
    setSelectedFeedback,
    page,
    variantType,
    setPage,
    pageSize,
    setSearchAppreciationQuery,
    setSearchReprimandQuery,
  } = ConversationStore();

  const handleDelete = (id: string) => {
    deleteFeedback(id);
  };
  const handleEdit = (item: any) => {
    setSelectedFeedback(item);
  };

  // Sort by createdAt in descending order (latest first)

  return (
    <>
      <div
        className="flex justify-between text-xs mx-2 overflow-x-auto "
        data-cy={`feedback-type-detail-${variantType}-actions`}
        id={`feedbackTypeDetail${variantType}Actions`}
      >
        <div
          style={{ marginBottom: 16 }}
          data-cy={`feedback-type-detail-${variantType}-search-container`}
          id={`feedbackTypeDetail${variantType}SearchContainer`}
        >
          <Input.Search
            placeholder="Search feedbacks..."
            allowClear
            onChange={(e) =>
              variantType === 'appreciation'
                ? setSearchAppreciationQuery(e.target.value)
                : variantType === 'reprimand'
                  ? setSearchReprimandQuery(e.target.value)
                  : null
            }
            className="w-full sm:w-80 md:w-96 lg:w-[300px]"
            data-cy={`feedback-type-detail-${variantType}-search`}
            id={`feedbackTypeDetail${variantType}Search`}
          />
        </div>
      </div>
      {feedbackTypeDetail?.items?.map((item: any) => (
        <Card
          className="mx-2 mb-2"
          key={item.id}
          data-cy={`feedback-type-detail-${variantType}-card-${item.id}`}
          id={`feedbackTypeDetail${variantType}Card${item.id}`}
        >
          <div
            className="flex justify-between"
            data-cy={`feedback-type-detail-${variantType}-card-content-${item.id}`}
            id={`feedbackTypeDetail${variantType}CardContent${item.id}`}
          >
            <div
              data-cy={`feedback-type-detail-${variantType}-card-info-${item.id}`}
              id={`feedbackTypeDetail${variantType}CardInfo${item.id}`}
            >
              <p
                data-cy={`feedback-type-detail-${variantType}-card-name-${item.id}`}
                id={`feedbackTypeDetail${variantType}CardName${item.id}`}
              >
                {item?.name}
              </p>
              <p
                className="text-xs text-gray-500"
                data-cy={`feedback-type-detail-${variantType}-card-description-${item.id}`}
                id={`feedbackTypeDetail${variantType}CardDescription${item.id}`}
              >
                {item?.description}
              </p>
            </div>
            <p
              className="flex gap-2"
              data-cy={`feedback-type-detail-${variantType}-card-actions-${item.id}`}
              id={`feedbackTypeDetail${variantType}CardActions${item.id}`}
            >
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: <Edit2Icon className="w-4 h-4 text-xs" />,
                      onClick: () => handleEdit(item),
                    },
                    {
                      key: 'delete',
                      label: 'Delete',
                      icon: <MdDeleteOutline className="w-4 h-4" />,
                      onClick: () =>
                        Modal.confirm({
                          title: 'Are you sure you want to delete?',
                          okText: 'Yes',
                          cancelText: 'No',
                          onOk: () => handleDelete(item?.id),
                        }),
                    },
                  ],
                }}
              >
                <Button
                  size="small"
                  shape="default"
                  icon={<EllipsisOutlined />}
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
          data-cy={`feedback-type-detail-${variantType}-pagination`}
        />
      )}
    </>
  );
}

export default FeedbackTypeDetail;
