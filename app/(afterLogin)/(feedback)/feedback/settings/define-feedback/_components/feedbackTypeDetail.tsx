import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Button, Card, Popconfirm, Tabs, Pagination, Input } from 'antd';
import { Edit2Icon } from 'lucide-react';
import React, { useState } from 'react';
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
    setOpen,
    setSelectedFeedback,
    page,
    setPage,
    pageSize,
  } = ConversationStore();

  const [searchQuery, setSearchQuery] = useState('');

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
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Search feedbacks..."
            allowClear
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <div className="flex justify-end text-xs mx-2">
          <Button
            type="primary"
            htmlType="button"
            icon={<BiPlus />}
            title="Add Type"
            onClick={() => setOpen(true)}
          >
            Add Type
          </Button>
        </div>
        {paginatedItems.map((item: any) => (
          <Card className="mx-2 mb-2" key={item.id}>
            <div className="flex justify-between">
              <div>
                <p>{item?.name}</p>
                <p className="text-xs text-gray-500">{item?.description}</p>
              </div>
              <p className="flex gap-2">
                <Button
                  size="small"
                  onClick={() => editHandler(item)}
                  icon={<Edit2Icon className="w-4 h-4 text-xs" />}
                  type="primary"
                />
                <Popconfirm
                  title="Are you sure you want to delete?"
                  onConfirm={() => handleDelete(item?.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    size="small"
                    loading={deleteLoading}
                    icon={<MdDeleteOutline />}
                    danger
                    type="primary"
                  />
                </Popconfirm>
              </p>
            </div>
          </Card>
        ))}
        <div className="flex justify-center mt-4">
          <Pagination
            current={page}
            onChange={(page) => setPage(page)}
            total={filteredItems.length}
            pageSize={pageSize}
            hideOnSinglePage
          />
        </div>
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
    <div className="mt-5">
      <Tabs
        defaultActiveKey={'appreciation'}
        items={tabItems}
        onChange={onChange}
      />
    </div>
  );
}

export default FeedbackTypeDetail;
