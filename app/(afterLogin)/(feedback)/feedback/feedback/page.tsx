'use client';
import { Button, Form, Popconfirm, Spin, Table, Tabs, Tooltip } from 'antd';
import { TabsProps } from 'antd'; // Import TabsProps only if you need it.
import { ConversationStore } from '@/store/uistate/features/conversation';
import TabLandingLayout from '@/components/tabLanding';
import { PiPlus } from 'react-icons/pi';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import { useEffect, useState } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
// import { FeedbackTypeItems } from '@/store/server/features/conversation/conversationType/interface';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CreateFeedbackForm from './_components/createFeedback';
import { useFetchAllFeedbackRecord } from '@/store/server/features/feedback/feedbackRecord/queries';
import dayjs from 'dayjs';
import { Edit2Icon } from 'lucide-react';
import { MdDeleteOutline } from 'react-icons/md';
import { useDeleteFeedbackRecordById } from '@/store/server/features/feedback/feedbackRecord/mutation';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const Page = () => {
  const {
    open,
    setOpen,
    setVariantType,
    setSelectedFeedbackRecord,
    selectedFeedbackRecord,
    variantType,
    setUserId,
    userId,
    setActiveTab,
    activeTab,
    empId,
    setEmpId,
    givenDate,
    setGivenDate,
    pageSize,
    setPageSize,
    page,
    setPage,
  } = ConversationStore();
  const [form] = Form.useForm();
  const { data: getAllUsersData } = useGetAllUsers();
  const { data: getAllFeedbackTypes, isLoading: getFeedbackTypeLoading } =
    useFetchAllFeedbackTypes();
  const { data: getAllFeedbackRecord, isLoading: getFeedbackRecordLoading } =
    useFetchAllFeedbackRecord(pageSize, page, empId || '', givenDate);
  const { mutate: deleteFeedbackRecord } = useDeleteFeedbackRecordById();

  const { data: getAllUsers } = useGetAllUsers();
  const userIdData = useAuthenticationStore.getState().userId;
  const [filteredFeedbackRecord, setFilteredFeedbackRecord] = useState<any>([]);
  const editHandler = (record: any) => {
    setSelectedFeedbackRecord(record);
  };
  const handleDelete = (id: string) => {
    deleteFeedbackRecord(id, {
      onSuccess: () => {},
    });
  };

  useEffect(() => {
    let data = getAllFeedbackRecord?.items ?? []; // Default to an empty array if data is undefined
    // Filter by variantType

    if (variantType) {
      data = data.filter(
        (item: any) => item?.feedbackVariant?.variant === variantType,
      );
    }

    // Filter by activeTab
    if (activeTab) {
      data = data.filter((item: any) => item?.feedbackTypeId === activeTab);
    }

    // // Filter by userId
    if (userId !== 'all') {
      data = data.filter(
        (item: any) =>
          item?.recipientId === userId || item?.issuerId === userId,
      );
    }

    // Update the state with the filtered data
    setFilteredFeedbackRecord(data);
  }, [getAllFeedbackRecord, variantType, activeTab, userId, userIdData]);

  const onChange = (key: string) => {
    setVariantType(key);
  };
  const onChangeUserType = (key: string) => {
    const data = key === 'personal' ? userIdData : 'all';
    setUserId(data);
  };

  useEffect(() => {
    setUserId(userIdData);
    if (getAllFeedbackTypes?.items?.length > 0) {
      setActiveTab(getAllFeedbackTypes.items[0].id);
    }
  }, [getAllFeedbackTypes, userIdData]);

  const onChangeFeedbackType = (key: string) => {
    setActiveTab(key);
  };

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category ?? '';

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
      title: 'Issued To',
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
      render: (notused: any, record: any) => {
        return record.reason ? (
          <Tooltip title={record?.reason}>
            {record?.reason?.length >= 40
              ? record?.reason?.slice(0, 40) + '....'
              : record?.reason}{' '}
          </Tooltip>
        ) : (
          'N/A'
        );
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
            <Button
              disabled={record.issuerId !== userIdData}
              size="small"
              onClick={() => editHandler(record)}
              icon={<Edit2Icon className="w-4 h-4 text-xs" />}
              type="primary"
            />
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => handleDelete(record?.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                disabled={record.issuerId !== userIdData}
                size="small"
                icon={<MdDeleteOutline />}
                danger
                type="primary"
              />
            </Popconfirm>
          </p>
        );
      },
    },
  ];

  const searchField = [
    {
      key: 'employee',
      type: 'select',
      placeholder: 'Select Employee',
      options:
        getAllUsersData?.items?.map((item: any) => ({
          key: item?.id,
          value: `${item?.firstName} ${item?.lastName}`,
        })) ?? [], // Empty initially, will be updated dynamically
      widthRatio: 0.5,
      onChange: (value: string) => setEmpId(value),
    },
    {
      key: 'allTypes',
      type: 'start-end-date',
      placeholder: 'Select Type',
      options:
        getAllFeedbackTypes?.items?.map((feedbackType: FeedbackTypeItems) => ({
          key: feedbackType?.id,
          value: feedbackType?.category,
        })) ?? [], // Empty initially, will be updated dynamically
      widthRatio: 0.5,
      onChange: (value: string) => setGivenDate(value),
    },
  ];
  return (
    <TabLandingLayout
      // buttonTitle="Generate report"
      id="conversationLayoutId"
      onClickHandler={() => {}}
      title="Feedback"
      subtitle="Manage your Feedback"
      allowSearch={false}
    >
      <div className="flex justify-end">
        <Tabs
          defaultActiveKey="personal"
          items={items}
          onChange={onChangeUserType}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* {Array.from({ length: 4 }).map((notused, index) => (
          <Card key={index} className="bg-gray-100">
            <div className="flex justify-between">
              <Avatar className="bg-gray-300 text-green-800 -mt-2">
                <LuAward />
              </Avatar>
              <p className="flex text-xs text-gray-400">
                <span className="flex text-green-800 mx-2">
                  <FaLongArrowAltUp /> 12.7%
                </span>
                Vs Last Week
              </p>
            </div>
            <p className="text-gray-400 capitalize my-1">
              Total number of appreciations received
            </p>
            <p className="font-bold text-lg">010</p>
            <p className="flex justify-end text-xs text-gray-400 space-x-2">
              <LuUsers />
              <span>87 employees contributed</span>
            </p>
          </Card>
        ))} */}
      </div>
      <Spin spinning={getFeedbackTypeLoading} tip="Loading...">
        <Tabs
          className="max-w-[850px]"
          defaultActiveKey={activeTab}
          items={getAllFeedbackTypes?.items?.map((item: FeedbackTypeItems) => ({
            key: item?.id,
            label: item?.category,
          }))}
          onChange={onChangeFeedbackType}
        />
      </Spin>
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
          disabledMessage="Please select a feedback type"
          buttonDisabled={activeTab === ''}
          title={<div className="text-lg capitalize">{variantType}</div>}
          subtitle={
            <div className="capitalize">{`Given up on  ${variantType}`}</div>
          }
          allowSearch={false}
        >
          <EmployeeSearchComponent fields={searchField} />
          <Table
            loading={getFeedbackRecordLoading}
            dataSource={filteredFeedbackRecord}
            columns={columns}
            pagination={{
              showSizeChanger: true, // Enables "page size" dropdown
              showQuickJumper: true, // Enables jumping to a specific page
              pageSizeOptions: ['10', '20', '50', '100'], // Page size options
              defaultPageSize: 10, // Default page size
              total: filteredFeedbackRecord?.items?.length || 0, // Total number of items
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`, // Display pagination info
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
                // Optional: Implement server-side pagination logic here if needed
              },
            }}
          />
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
            form.resetFields();
          }}
          modalHeader={modalHeader}
          width="40%"
        >
          <CreateFeedbackForm form={form} />
        </CustomDrawerLayout>
      </div>
    </TabLandingLayout>
  );
};

export default Page;
