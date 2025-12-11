import CustomPagination from '@/components/customPagination';
import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Button, Card, Popconfirm, Tabs, Input } from 'antd';
import { Edit2Icon } from 'lucide-react';
import React from 'react';
import { BiPlus } from 'react-icons/bi';
import { MdDeleteOutline } from 'react-icons/md';

interface FeedbackTypeDetailProps {
  feedbackTypeDetail: any;
}

function FeedbackTypeDetail({ feedbackTypeDetail }: FeedbackTypeDetailProps) {
  const { mutate: deleteFeedback, isLoading: deleteLoading } =
    useDeleteFeedback();

  const {
    setVariantType,
    variantType,
    setOpen,
    setSelectedFeedback,
    page,
    setPage,
    pageSize,
    searchQuery,
    setSearchQuery,
  } = ConversationStore();

  const onChange = (key: string) => {
    const variantType = key === 'appreciation' ? 'appreciation' : 'reprimand';
    setVariantType(variantType);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    deleteFeedback(id);
  };
  const editHandler = (item: string) => {
    setSelectedFeedback(item);
  };

  const renderFeedbackItems = (variant: 'appreciation' | 'reprimand') => {
    const filteredItems =
      feedbackTypeDetail?.feedback?.filter((item: any) => {
        const matchesVariant = item?.variant === variant;
        const matchesSearch = searchQuery
          ? item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item?.description?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchesVariant && matchesSearch;
      }) || [];

    // Sort by createdAt in descending order (latest first)
    const sortedItems = [...filteredItems].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    return (
      <>
        <div className="flex justify-between text-xs mx-2 overflow-x-auto " data-cy={`feedback-type-detail-${variant}-actions`} id={`feedbackTypeDetail${variant}Actions`}>
          <div style={{ marginBottom: 16 }} data-cy={`feedback-type-detail-${variant}-search-container`} id={`feedbackTypeDetail${variant}SearchContainer`}>
            <Input.Search
              placeholder="Search feedbacks..."
              allowClear
              onChange={(e) => setSearchQuery(e.target.value)}
              // style={{ width: 300 }}
              className="w-full sm:w-80 md:w-96 lg:w-[300px]"
              data-cy={`feedback-type-detail-${variant}-search`}
              id={`feedbackTypeDetail${variant}Search`}
            />
          </div>
          <Button
            type="primary"
            htmlType="button"
            icon={<BiPlus />}
            title="Add Type"
            onClick={() => setOpen(true)}
            data-cy={`feedback-type-detail-${variant}-add-button`}
            id={`feedbackTypeDetail${variant}AddButton`}
          >
            <span className="hidden md:inline" data-cy={`feedback-type-detail-${variant}-add-button-text`} id={`feedbackTypeDetail${variant}AddButtonText`}> Add Type</span>
          </Button>
        </div>
        {paginatedItems.map((item: any) => (
          <Card className="mx-2 mb-2" key={item.id} data-cy={`feedback-type-detail-${variant}-card-${item.id}`} id={`feedbackTypeDetail${variant}Card${item.id}`}>
            <div className="flex justify-between" data-cy={`feedback-type-detail-${variant}-card-content-${item.id}`} id={`feedbackTypeDetail${variant}CardContent${item.id}`}>
              <div data-cy={`feedback-type-detail-${variant}-card-info-${item.id}`} id={`feedbackTypeDetail${variant}CardInfo${item.id}`}>
                <p data-cy={`feedback-type-detail-${variant}-card-name-${item.id}`} id={`feedbackTypeDetail${variant}CardName${item.id}`}>{item?.name}</p>
                <p className="text-xs text-gray-500" data-cy={`feedback-type-detail-${variant}-card-description-${item.id}`} id={`feedbackTypeDetail${variant}CardDescription${item.id}`}>{item?.description}</p>
              </div>
              <p className="flex gap-2" data-cy={`feedback-type-detail-${variant}-card-actions-${item.id}`} id={`feedbackTypeDetail${variant}CardActions${item.id}`}>
                <Button
                  size="small"
                  onClick={() => editHandler(item)}
                  icon={<Edit2Icon className="w-4 h-4 text-xs" />}
                  type="primary"
                  data-cy={`feedback-type-detail-${variant}-card-edit-button-${item.id}`}
                  id={`feedbackTypeDetail${variant}CardEditButton${item.id}`}
                />
                <Popconfirm
                  title="Are you sure you want to delete?"
                  onConfirm={() => handleDelete(item?.id)}
                  okText="Yes"
                  cancelText="No"
                  data-cy={`feedback-type-detail-${variant}-card-delete-confirm-${item.id}`}
                  id={`feedbackTypeDetail${variant}CardDeleteConfirm${item.id}`}
                >
                  <Button
                    size="small"
                    loading={deleteLoading}
                    icon={<MdDeleteOutline />}
                    danger
                    type="primary"
                    data-cy={`feedback-type-detail-${variant}-card-delete-button-${item.id}`}
                    id={`feedbackTypeDetail${variant}CardDeleteButton${item.id}`}
                  />
                </Popconfirm>
              </p>
            </div>
          </Card>
        ))}
        {filteredItems.length > pageSize && (
          <CustomPagination
            current={page}
            total={filteredItems.length}
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
  };

  const tabItems = [
    {
      key: 'appreciation',
      label: 'Appreciation',
      children: renderFeedbackItems('appreciation'),
    },
    {
      key: 'reprimand',
      label: 'Reprimand',
      children: renderFeedbackItems('reprimand'),
    },
  ];

  return (
    <div className="mt-5" data-cy="feedback-type-detail" id="feedbackTypeDetail">
      <Tabs activeKey={variantType} items={tabItems} onChange={onChange} data-cy="feedback-type-detail-tabs" id="feedbackTypeDetailTabs" />
    </div>
  );
}

export default FeedbackTypeDetail;
