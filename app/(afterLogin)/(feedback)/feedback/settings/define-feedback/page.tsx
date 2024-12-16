'use client';
import { Button, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import CustomDrawerLayout from '@/components/common/customDrawer';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { FaPlus } from 'react-icons/fa';
import QuestionSetForm from '../_components/questionSetForm';
import { useConversationTypes } from '@/store/server/features/conversation/queries';
import { ConversationTypeItems, FeedbackTypeItems } from '@/store/server/features/conversation/conversationType/interface';
import { useEffect } from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import FeedbackTypeDetail from './_components/feedbackTypeDetail';
import CreateFeedback from './_components/createFeedback';

const Page = () => {
  const { selectedFeedback,variantType, activeTab, setActiveTab,open,setOpen,setSelectedFeedback } = ConversationStore();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();

  const onChange = (key: string) => {
    setActiveTab(key);
  };
  const onCloseHandler = () => {
    setOpen(false);
    setSelectedFeedback(null);
  };
  useEffect(() => {
    setActiveTab(getAllFeedbackTypes?.items?.[0]?.id);
  }, [getAllFeedbackTypes]);

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category || '';


  const modalHeader = (
    <div className="flex flex-col items-center justify-center text-xl font-extrabold text-gray-800 p-4">
       <p>Add New {activeTabName}</p>
       <p>{variantType} type</p>
    </div>
  );
  const items: TabsProps['items'] = getAllFeedbackTypes?.items?.map(
    (item: FeedbackTypeItems) => ({
      key: item?.id,
      label: item?.category,
      children: <FeedbackTypeDetail feedbackTypeDetail={item} />,
    }),
  );

  return (
    <div>
      <div className="flex flex-col gap-10">
        <span className="font-bold text-lg">Feedback</span>

        <div className='mt-5'>
          <Tabs
            defaultActiveKey={getAllFeedbackTypes?.items?.[0]?.id}
            items={items}
            onChange={onChange}
          />
      </div>
      </div>

      <CustomDrawerLayout
        open={open || selectedFeedback?.id}
        onClose={onCloseHandler}
        modalHeader={modalHeader}
        width="30%"
      >
        <CreateFeedback/>
      </CustomDrawerLayout>
    </div>
  );
};

export default Page;
