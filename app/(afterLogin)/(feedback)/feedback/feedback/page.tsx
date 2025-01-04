'use client';
import { Button, Card, Popconfirm, Table, Tabs } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import { ConversationStore } from '@/store/uistate/features/conversation';
import TabLandingLayout from '@/components/tabLanding';
import { PiPlus } from 'react-icons/pi';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import { useEffect } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CreateFeedbackForm from './_components/createFeedback';
import { useFetchAllFeedbackRecord } from '@/store/server/features/feedback/feedbackRecord/queries';
import dayjs from 'dayjs';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { useDeleteFeedbackRecordById } from '@/store/server/features/feedback/feedbackRecord/mutation';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';

const Page = () => {
  const {
    open,
    setOpen,
    setVariantType,
    setSelectedFeedbackRecord,
    selectedFeedbackRecord,
    variantType,
    setActiveTab,
    activeTab,
  } = ConversationStore();
  const { data: getAllUsersData } = useGetAllUsers();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();
  const { data: getAllFeedbackRecord } = useFetchAllFeedbackRecord();
  const { mutate: deleteFeedbackRecord } = useDeleteFeedbackRecordById();

  const { data: getAllUsers } = useGetAllUsers();

  const editHandler = (record: any) => {
    setSelectedFeedbackRecord(record);
  };
  const handleDelete = (id: string) => {
    deleteFeedbackRecord(id, {
      onSuccess: () => {},
    });
  };

  const onChange = (key: string) => {
    setVariantType(key);
  };
  useEffect(() => {
    if (getAllFeedbackTypes?.items?.length) {
      setActiveTab(getAllFeedbackTypes.items[0].id);
    }
  }, [getAllFeedbackTypes]);

  const onChangeFeedbackType = (key: string) => {
    setActiveTab(key);
  };

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category ?? '';
  const handleSearchChange = () => {};

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {`${activeTabName} - ${variantType}`}
    </div>
  );

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
      title: 'Given By',
      dataIndex: 'issuerId',
      key: 'issuerId',
      render: (notused: any, record: any) => {
        const user = getAllUsers?.items?.find(
          (item: any) => item.id === record.issuerId,
        );
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown'; // Return full name or fallback
      },
    },
    {
      title: 'Type',
      dataIndex: 'feedbackTypeId',
      key: 'feedbackTypeId',
      render: (notused: any, record: any) => {
        const feedbackType = getAllFeedbackTypes?.items?.find(
          (item: any) => item.id === record.feedbackTypeId,
        );
        return feedbackType?.category || 'Unknown'; // Return the category or a fallback value
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Reciepent',
      dataIndex: 'recipientId',
      key: 'recipientId',
      render: (notused: any, record: any) => {
        const user = getAllUsers?.items?.find(
          (item: any) => item.id === record.recipientId,
        );
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown'; // Return full name or fallback
      },
    },
    {
      title: 'Given Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (notused: any, record: any) => {
        return record.createdAt
          ? dayjs(record.createdAt).format('YYYY-MM-DD')
          : 'N/A';
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (notused: any, record: any) => {
        return (
          <p className="flex gap-2">
            <AccessGuard permissions={[Permissions.UpdateAppreciation]}>
              <Button
                size="small"
                onClick={() => editHandler(record)}
                icon={<Edit2Icon className="w-4 h-4 text-xs" />}
                type="primary"
              />
            </AccessGuard>
            <AccessGuard permissions={[Permissions.UpdateAppreciation]}>
              <Popconfirm
                title="Are you sure you want to delete?"
                onConfirm={() => handleDelete(record?.id)}
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
            </AccessGuard>
          </p>
        );
      },
    },
  ];

  const searchField = [
    {
      key: 'employee',
      placeholder: 'Select Employee',
      options:
        getAllUsersData?.items?.map((item: any) => ({
          key: item?.id,
          value: `${item?.firstName} ${item?.lastName}`,
        })) ?? [], // Empty initially, will be updated dynamically
      widthRatio: 0.5,
    },
    {
      key: 'allTypes',
      placeholder: 'Select Type',
      options:
        getAllFeedbackTypes?.items?.map((feedbackType: FeedbackTypeItems) => ({
          key: feedbackType?.id,
          value: feedbackType?.category,
        })) ?? [], // Empty initially, will be updated dynamically
      widthRatio: 0.5,
    },
  ];
  return (
    <TabLandingLayout
      buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => {}}
      title="Feedback"
      subtitle="Manage your Feedback"
      allowSearch={false}
      permissionsNeeded={[Permissions.GenerateFeedbackReport]}
    >
      <div className="flex justify-end">
        <Tabs
          defaultActiveKey="personal"
          items={items}
          // onChange={onChange}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((notused, index) => (
          <Card key={index}>{index}</Card>
        ))}
      </div>

      <Tabs
        className="max-w-[850px]"
        defaultActiveKey={activeTab}
        items={getAllFeedbackTypes?.items?.map((item: FeedbackTypeItems) => ({
          key: item?.id,
          label: item?.category,
        }))}
        onChange={onChangeFeedbackType}
      />
      <Tabs
        defaultActiveKey="appreciation"
        items={variantTypeItems}
        onChange={onChange}
      />
      <div className="-mx-12 -mt-10">
        <TabLandingLayout
          buttonTitle={<div className="text-sm">{variantType}</div>}
          buttonIcon={<PiPlus />}
          id="conversationLayoutId"
          onClickHandler={() => setOpen(true)}
          title={<div className="text-lg">{variantType}</div>}
          subtitle={`Given up on  ${variantType}`}
          allowSearch={false}
          permissionsNeeded={[Permissions.CreateAppreciation]}
        >
          <EmployeeSearchComponent
            fields={searchField}
            onChange={handleSearchChange}
          />
          <Table dataSource={getAllFeedbackRecord ?? []} columns={columns} />
        </TabLandingLayout>
      </div>
      <div>
        <CustomDrawerLayout
          open={
            (open && activeTabName !== '') || selectedFeedbackRecord !== null
          }
          onClose={() => {
            setOpen(false);
            setSelectedFeedbackRecord(null);
          }}
          modalHeader={modalHeader}
          width="30%"
        >
          <CreateFeedbackForm />
        </CustomDrawerLayout>
      </div>
    </TabLandingLayout>
  );
};

export default Page;
