import CustomPagination from '@/components/customPagination';
import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Button, Card, Input, Dropdown, Modal } from 'antd';
import { Edit2Icon } from 'lucide-react';
import React from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { EllipsisOutlined } from '@ant-design/icons';

import styles from './feedbackTypeDetail.module.css';

interface FeedbackTypeDetailProps {
  feedbackTypeDetail: any;
}

function FeedbackTypeDetail({ feedbackTypeDetail }: FeedbackTypeDetailProps) {
  const { isMobile } = useIsMobile();
  const { mutate: deleteFeedback } = useDeleteFeedback();

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

  const searchPlaceholder =
    variantType === 'appreciation'
      ? 'Search Appreciation.'
      : 'Search Reprimand.';

  return (
    <div
      className={`rounded-lg border-[1px] border-gray-200 bg-white shadow-sm ${
        isMobile ? ' p-3 ' : 'p-2'
      }`}
      data-cy={`feedback-type-detail-${variantType}-panel`}
    >
      <div
        className={`flex justify-between overflow-x-auto text-xs ${isMobile ? 'mx-0 mb-3' : 'mx-2'}`}
        data-cy={`feedback-type-detail-${variantType}-actions`}
        id={`feedbackTypeDetail${variantType}Actions`}
      >
        <div
          className={isMobile ? 'mb-0 w-full' : ''}
          style={isMobile ? undefined : { marginBottom: 16 }}
          data-cy={`feedback-type-detail-${variantType}-search-container`}
          id={`feedbackTypeDetail${variantType}SearchContainer`}
        >
          <div className={isMobile ? styles.mobileSearch : undefined}>
            <Input.Search
              placeholder={searchPlaceholder}
              allowClear
              onChange={(e) =>
                variantType === 'appreciation'
                  ? setSearchAppreciationQuery(e.target.value)
                  : variantType === 'reprimand'
                    ? setSearchReprimandQuery(e.target.value)
                    : null
              }
              className={`w-full rounded-md ${isMobile ? '' : 'sm:w-80 md:w-96 lg:w-72'}`}
              data-cy={`feedback-type-detail-${variantType}-search`}
              id={`feedbackTypeDetail${variantType}Search`}
            />
          </div>
        </div>
      </div>
      {feedbackTypeDetail?.items?.map((item: any) => (
        <Card
          className={`mb-2 border-gray-200 ${isMobile ? 'mx-0 rounded-lg shadow-none' : 'mx-2'}`}
          key={item.id}
          data-cy={`feedback-type-detail-${variantType}-card-${item.id}`}
          id={`feedbackTypeDetail${variantType}Card${item.id}`}
        >
          <div
            className="flex justify-between gap-2"
            data-cy={`feedback-type-detail-${variantType}-card-content-${item.id}`}
            id={`feedbackTypeDetail${variantType}CardContent${item.id}`}
          >
            <div
              className="min-w-0 flex-1"
              data-cy={`feedback-type-detail-${variantType}-card-info-${item.id}`}
              id={`feedbackTypeDetail${variantType}CardInfo${item.id}`}
            >
              <p
                className="font-semibold text-gray-900"
                data-cy={`feedback-type-detail-${variantType}-card-name-${item.id}`}
                id={`feedbackTypeDetail${variantType}CardName${item.id}`}
              >
                {item?.name}
              </p>
              <p
                className="mt-0.5 text-xs leading-relaxed text-gray-500"
                data-cy={`feedback-type-detail-${variantType}-card-description-${item.id}`}
                id={`feedbackTypeDetail${variantType}CardDescription${item.id}`}
              >
                {item?.description}
              </p>
            </div>
            <p
              className="flex shrink-0 gap-2"
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
        <div className={isMobile ? 'px-0 pt-1' : ''}>
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
        </div>
      )}
    </div>
  );
}

export default FeedbackTypeDetail;
