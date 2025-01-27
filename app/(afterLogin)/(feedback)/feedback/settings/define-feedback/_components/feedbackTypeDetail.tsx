import { useDeleteFeedback } from '@/store/server/features/feedback/feedback/mutation';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { Button, Card, Popconfirm, Tabs } from 'antd';
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

  const { setVariantType, setOpen, setSelectedFeedback } = ConversationStore();

  const onChange = (key: string) => {
    const variantType = key === 'appreciation' ? 'appreciation' : 'reprimand';
    setVariantType(variantType);
  };

  const handleDelete = (id: string) => {
    deleteFeedback(id);
  };
  const editHandler = (item: string) => {
    setSelectedFeedback(item);
  };
  const tabItems = [
    {
      key: 'appreciation', // Ant Design Tabs expect "key" instead of "id"
      label: 'Appreciation',
      children: (
        <>
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
          {feedbackTypeDetail?.feedback
            ?.filter((item: any) => item?.variant === 'appreciation')
            ?.map((item: any) => (
              <Card className="mx-2" key={item.id}>
                <div className="flex justify-between">
                  <p>{item?.name}</p>
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
        </>
      ),
    },
    {
      key: 'reprimand',
      label: 'Reprimand',
      children: (
        <>
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
          {feedbackTypeDetail?.feedback
            ?.filter((item: any) => item?.variant === 'reprimand')
            ?.map((item: any) => (
              <Card className="mx-2" key={item.id}>
                <div className="flex justify-between">
                  <p>{item?.name}</p>
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
                        icon={<MdDeleteOutline />}
                        danger
                        type="primary"
                      />
                    </Popconfirm>
                  </p>
                </div>
              </Card>
            ))}
        </>
      ),
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
