import CustomPagination from '@/components/customPagination';
import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Card, Input, Dropdown, Popconfirm } from 'antd';
import React from 'react';
import { MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { SearchOutlined } from '@ant-design/icons';
import { BsThreeDots } from 'react-icons/bs';
import EmptyState from '@/components/empty';

interface FeedbackTypeDetailProps {
  feedbackTypeDetail: any;
}

function FeedbackTypeDetail({ feedbackTypeDetail }: FeedbackTypeDetailProps) {
  const { isMobile } = useIsMobile();
  const { mutate: deleteFeedback } = useDeleteFeedback();

  const {
    setSelectedFeedback,
    setOpen,
    page,
    variantType,
    setPage,
    pageSize,
    setSearchAppreciationQuery,
    setSearchReprimandQuery,
    searchAppreciationQuery,
    searchReprimandQuery,
    feedbackOpenDropdownId,
    setFeedbackOpenDropdownId,
  } = ConversationStore();

  const listItems = feedbackTypeDetail?.items ?? [];
  const hasActiveSearch = Boolean(
    (variantType === 'appreciation'
      ? searchAppreciationQuery
      : searchReprimandQuery
    )?.trim(),
  );

  const openCreateFeedbackType = () => {
    setSelectedFeedback(null);
    setOpen(true);
  };

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
      className={`rounded-lg border-[1px] border-[#D9D9D9] bg-white shadow-sm ${
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
          <div data-cy={`feedback-type-detail-${variantType}-search-inner`}>
            <Input
              placeholder={searchPlaceholder}
              addonAfter={<SearchOutlined className="text-gray-400" />}
              allowClear
              className="w-full max-w-[280px] h-10 rounded-md text-sm [&_.ant-input]:!text-sm [&_.ant-input-group-addon]:!px-3 [&_.ant-input-group-addon]:!bg-white"
              onChange={(e) =>
                variantType === 'appreciation'
                  ? setSearchAppreciationQuery(e.target.value)
                  : variantType === 'reprimand'
                    ? setSearchReprimandQuery(e.target.value)
                    : null
              }
              data-cy={`feedback-type-detail-${variantType}-search`}
              id={`feedbackTypeDetail${variantType}Search`}
            />
          </div>
        </div>
      </div>
      {listItems.length === 0 ? (
        <div
          className="flex min-h-[220px] items-center justify-center py-6"
          data-cy={`feedback-type-detail-${variantType}-empty`}
          id={`feedbackTypeDetail${variantType}EmptyId`}
        >
          <EmptyState
            title={
              hasActiveSearch
                ? 'No feedback types match your search'
                : `No ${variantType} types yet`
            }
            description={
              hasActiveSearch
                ? 'Try a different search term.'
                : 'Create a type to use in feedback and conversations.'
            }
            actionText="Create type"
            onAction={openCreateFeedbackType}
          />
        </div>
      ) : (
        listItems.map((item: any) => (
        <Card
          className={`mb-2 border-[#D9D9D9] ${isMobile ? 'mx-0 rounded-lg shadow-none' : 'mx-2'}`}
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
                placement="bottomRight"
                arrow={false}
                open={feedbackOpenDropdownId === item.id}
                onOpenChange={(open) => {
                  if (open) {
                    setFeedbackOpenDropdownId(item.id);
                  } else {
                    setFeedbackOpenDropdownId(null);
                  }
                }}
                menu={{
                  onClick: ({ key, domEvent }) => {
                    if (key === 'delete') {
                      domEvent.preventDefault();
                      domEvent.stopPropagation();
                      setFeedbackOpenDropdownId(item.id);
                      return;
                    }
                    setFeedbackOpenDropdownId(null);
                  },
                  items: [
                    {
                      key: 'edit',
                      label: 'Edit',
                      icon: <MdOutlineEdit className="w-4 h-4 " />,
                      className: 'text-xs text-gray-600',
                      onClick: () => {
                        handleEdit(item);
                        setFeedbackOpenDropdownId(null);
                      },
                    },
                    {
                      key: 'delete',
                      className: 'text-xs text-gray-600',
                      label: (
                        <Popconfirm
                          title="Are you sure you want to delete?"
                          onConfirm={() => {
                            handleDelete(item?.id);
                            setFeedbackOpenDropdownId(null);
                          }}
                          onCancel={() => {
                            setFeedbackOpenDropdownId(null);
                          }}
                          okText="Yes"
                          cancelText="No"
                          data-cy={`Feedback-type-detail-card-delete-confirm-${item.id}`}
                          id={`FeedbackTypeDetailCardDeleteConfirm${item.id}`}
                        >
                          <span
                            className="flex items-center gap-2"
                            data-cy={`feedback-type-detail-delete-option-${item.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFeedbackOpenDropdownId(item.id);
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
            </p>
          </div>
        </Card>
        ))
      )}
      {feedbackTypeDetail?.meta &&
        (feedbackTypeDetail?.meta?.totalItems ?? 0) > 0 && (
        <div
          className={isMobile ? 'px-0 pt-1' : ''}
          data-cy={`feedback-type-detail-${variantType}-pagination-wrap`}
        >
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
