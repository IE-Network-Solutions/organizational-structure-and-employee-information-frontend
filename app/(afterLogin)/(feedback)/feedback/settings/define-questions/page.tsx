'use client';
import { Button, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { FaPlus } from 'react-icons/fa';
import QuestionSetForm from '../_components/questionSetForm';
import { useConversationTypes } from '@/store/server/features/conversation/queries';
import { ConversationTypeItems } from '@/store/server/features/conversation/conversationType/interface';
import { useEffect } from 'react';
import ConversationTypeDetail from './_components/ConversationTypeDetail/conversationTypeDetail';

const Page = () => {
  const { open, setOpen, activeTab, setActiveTab } = ConversationStore();
  const { data: getAllConversationType } = useConversationTypes();

  const onChange = (key: string) => {
    setActiveTab(key);
  };
  useEffect(() => {
    setActiveTab(getAllConversationType?.items[0]?.id);
  }, [getAllConversationType]);

  const activeTabName =
    getAllConversationType?.items?.find(
      (item: ConversationTypeItems) => item.id === activeTab,
    )?.name || '';

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New {activeTabName}
    </div>
  );
  const items: TabsProps['items'] = getAllConversationType?.items?.map(
    (item: ConversationTypeItems) => ({
      key: item?.id,
      label: item?.name,
      children: <ConversationTypeDetail id={item?.id} />,
    }),
  );

  return (
    <div>
      <div className="flex justify-between">
        <span className="font-bold text-lg">Questions</span>
        {activeTab !== '' && (
          <Button
            icon={<FaPlus />}
            onClick={() => setOpen(true)}
            type="primary"
            className="h-10 text-xs"
          >
            Add new {activeTabName}
          </Button>
        )}
      </div>
      <Tabs
        defaultActiveKey={getAllConversationType?.items[0]?.id}
        items={items}
        onChange={onChange}
      />
      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="40%"
      >
        <QuestionSetForm />
      </CustomDrawerLayout>
    </div>
  );
};

export default Page;
