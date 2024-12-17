'use client';
import { Button, Card, Drawer, Table, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import { FaPlus } from 'react-icons/fa';
import { ConversationStore } from '@/store/uistate/features/conversation';

import AccessGuard from '@/utils/permissionGuard';
import TabLandingLayout from '@/components/tabLanding';
import { PiPlus } from 'react-icons/pi';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import { useEffect } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import { FeedbackTypeItems } from '@/store/server/features/conversation/conversationType/interface';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CreateFeedbackForm from './_components/createFeedback';

const Page = () => {
  const { open, setOpen,setVariantType,variantType,setActiveTab,activeTab} =
    ConversationStore();
    const {data:getAllUsersData}=useGetAllUsers();
     const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();

  const onChange = (key: string) => {
      setVariantType(key);
  };
  useEffect(()=>setActiveTab(getAllFeedbackTypes?.items?.[0]?.id),[]);
  const onChangeFeedbackType = (key: string) => {
    setActiveTab(key);
};

 const activeTabName=getAllFeedbackTypes?.items?.find((item:FeedbackTypeItems)=>item?.id===activeTab)?.category
  const handleSearchChange = () => {};

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {`${activeTabName} - ${variantType}`}
    </div>
  );


  console.log(activeTab,"activeTab");
  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: 'All Employees',
    },
    {
      key: 'personal',
      label: 'Personal',
    },
  ];
  const variantTypeItems: TabsProps['items'] = [
    {
      key: 'appreciation',
      label: 'Appreciation',
    },
    {
      key: 'reprimand',
      label: 'Reprimand',
    },
  ];

  const columns = [
    {
      title: 'givenBy',
      dataIndex: 'issuerId',
      key: 'issurerId',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Given Date',
      dataIndex: 'givenDate',
      key: 'givenDate',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
  ]

  const searchField=[
    {
      key: 'employee',
      placeholder: 'Select Employee',
      options: getAllUsersData?.items?.map((item:any)=>
           ({key:item?.id,value:`${item?.firstName} ${item?.lastName}`})) ?? [], // Empty initially, will be updated dynamically
      widthRatio: 0.5,
    },
    {
      key: 'allTypes',
      placeholder: 'Select Type',
      options: getAllFeedbackTypes?.items?.map((feedbackType:FeedbackTypeItems)=>
            ({key:feedbackType?.id,value:feedbackType?.category}))??[], // Empty initially, will be updated dynamically
      widthRatio: 0.5,
    },
  ]
  return (
  <TabLandingLayout
    buttonTitle="Generate report"
    id="conversationLayoutId"
    enableButton={false}
    onClickHandler={() => {}}
    title="Feedback"
    subtitle="Manage your Feedback"
    allowSearch={false}
  >
    <div className='flex justify-end'>
    <Tabs
        defaultActiveKey="personal"
        items={items}
        // onChange={onChange}
      />
      </div>
     <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
     {Array.from({ length: 4 }).map((_, index) => (
        <Card>

        </Card>
      ))}
    </div> 

      <Tabs
        className="max-w-[850px]"
        defaultActiveKey={activeTab}
        items={getAllFeedbackTypes?.items?.map((item:FeedbackTypeItems)=>({key:item?.id,label:item?.category}))}
        onChange={onChangeFeedbackType}
      />
      <Tabs
        defaultActiveKey="appreciation"
        items={variantTypeItems}
        onChange={onChange}
      />
      <div className='-mx-12 -mt-10'>
        <TabLandingLayout
          buttonTitle={<div className='text-sm'>{variantType}</div>}
          buttonIcon={<PiPlus/>}
          id="conversationLayoutId"
          onClickHandler={() => setOpen(true)}
          title={<div className='text-lg'>{variantType}</div>}
          subtitle={`Given up on  ${variantType}`}
          allowSearch={false}
        >
          <EmployeeSearchComponent
            fields={searchField}
            onChange={handleSearchChange}
          />
          <Table dataSource={[]} columns={columns} />;
        </TabLandingLayout>
    </div>
    <div>

      <CustomDrawerLayout
        open={open}
        onClose={() => setOpen(false)}
        modalHeader={modalHeader}
        width="30%"
      >
        <CreateFeedbackForm/>
      </CustomDrawerLayout>
      {/* <Drawer
        title={modalHeader}
        onClose={() => setOpenRecognitionType(false)}
        open={openRecognitionType}
      >
      </Drawer> */}
    </div>
  </TabLandingLayout>

  );
};

export default Page;