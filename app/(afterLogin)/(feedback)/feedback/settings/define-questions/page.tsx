'use client';
import { Button, Tabs } from 'antd';
import { TabsProps } from 'antd';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { FaPlus } from 'react-icons/fa';
import QuestionSetForm from '../_components/questionSetForm';
import { useEffect } from 'react';
import ConversationTypeDetail from './_components/ConversationTypeDetail/conversationTypeDetail';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useConversationTypes } from '@/store/server/features/CFR/conversation/queries';
import { ConversationTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';

const Page = () => {
  const { setOpen, activeTab, setActiveTab } = ConversationStore();
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

  // const modalHeader = (
  //   <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
  //     Add New {activeTabName}
  //   </div>
  // );

  const items: TabsProps['items'] = getAllConversationType?.items?.map(
    (item: ConversationTypeItems) => ({
      key: item?.id,
      label: item?.name,
      children: <ConversationTypeDetail id={item?.id} />,
    }),
  );

  return (
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between">
        <span className="font-bold text-lg">Questions</span>
        <AccessGuard permissions={[Permissions.createConversationSet]}>
          {activeTab !== '' && (
            <Button
              icon={<FaPlus />}
              onClick={() => setOpen(true)}
              type="primary"
              className="h-10 text-xs"
            >
              <span className="hidden md:inline">
                Add new {activeTabName} question-set
              </span>
            </Button>
          )}
        </AccessGuard>
      </div>
      <Tabs
        defaultActiveKey={getAllConversationType?.items[0]?.id}
        items={items}
        onChange={onChange}
      />
      <QuestionSetForm />
    </div>
  );
};

export default Page;
