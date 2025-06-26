'use client';
import { Button, Form, Popconfirm, Spin, Table, Tabs, Tooltip } from 'antd';
import { TabsProps } from 'antd';
import { ConversationStore } from '@/store/uistate/features/conversation';
import TabLandingLayout from '@/components/tabLanding';
import { PiPlus } from 'react-icons/pi';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import { useEffect } from 'react';
import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import CreateFeedbackForm from './_components/createFeedback';
import { useFetchAllFeedbackRecord } from '@/store/server/features/feedback/feedbackRecord/queries';
import dayjs from 'dayjs';
import { MdDeleteOutline } from 'react-icons/md';
import { useDeleteFeedbackRecordById } from '@/store/server/features/feedback/feedbackRecord/mutation';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { FeedbackService } from './_components/feedbackAnalytics';
import { FeedbackCard, FeedbackCardSkeleton } from './_components/feedbackCard';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import CustomPagination from '@/components/customPagination';

const Page = () => {
  const {
    setOpen,
    setVariantType,
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
  const userIdData = useAuthenticationStore.getState().userId;

  const { data: getAllUsersData } = useGetAllUsers();
  const { data: getAllFeedbackTypes, isLoading: getFeedbackTypeLoading } =
    useFetchAllFeedbackTypes();
  const { data: getAllFeedbackRecord, isLoading: getFeedbackRecordLoading } =
    useFetchAllFeedbackRecord({
      variantType,
      activeTab,
      userId,
      pageSize,
      empId,
      page,
      givenDate,
    });
  const {
    data: getAllFeedbackCardData,
    isLoading: getFeedbackCardDataLoading,
  } = useFetchAllFeedbackRecord({ variantType, activeTab, empId, userId });

  const [form] = Form.useForm();

  const { mutate: deleteFeedbackRecord } = useDeleteFeedbackRecordById();
  const { data: EmployeeDepartment } = useEmployeeDepartments();

  const { data: getAllUsers } = useGetAllUsers();
  const feedbackAnaliytics = FeedbackService?.getFeedbackStats(
    getAllFeedbackCardData?.items,
    userId,
  );

  const handleDelete = (id: string) => {
    deleteFeedbackRecord(id, {
      onSuccess: () => {},
    });
  };

  const onChange = (key: string) => {
    setVariantType(key === 'appreciation' ? 'appreciation' : 'reprimand');
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

  // const activeTabName =
  //   getAllFeedbackTypes?.items?.find(
  //     (item: FeedbackTypeItems) => item.id === activeTab,
  //   )?.category ?? '';

  // const modalHeader = (
  //   <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
  //     {`${activeTabName} - ${variantType}`}
  //   </div>
  // );

  const items: TabsProps['items'] = [
    {
      key: 'all',
      label: (
        <AccessGuard permissions={[Permissions.ViewAllEmployeeFeedback]}>
          All Employees
        </AccessGuard>
      ),
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
        return user
          ? `${user?.firstName} ${user?.middleName} ${user?.lastName}`
          : 'Unknown';
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
        return user
          ? `${user?.firstName} ${user?.middleName} ${user?.lastName}`
          : 'Unknown';
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
        return feedbackType?.category || 'Unknown';
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (notused: any, record: any) => {
        return record.reason ? (
          <Tooltip title={record?.reason}>
            {record?.reason?.length >= 40
              ? record?.reason?.slice(0, 40) + '....'
              : record?.reason}
          </Tooltip>
        ) : (
          'N/A'
        );
      },
    },
    {
      title: 'Objective',
      dataIndex: 'objective',
      key: 'objective',
      render: (notused: any, record: any) => {
        return record.feedbackVariant.name ? (
          <Tooltip title={record?.feedbackVariant.name}>
            {record?.feedbackVariant.name?.length >= 40
              ? record?.feedbackVariant.name?.slice(0, 40) + '....'
              : record?.feedbackVariant.name}
          </Tooltip>
        ) : (
          'N/A'
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (notused: any, record: any) => {
        const data = EmployeeDepartment?.find(
          (item: any) =>
            item.id === record.feedbackVariant?.perspective?.departmentId,
        );
        return data?.name ? (
          <Tooltip title={data?.name}>
            {data?.name?.length >= 40
              ? data?.name?.slice(0, 40) + '....'
              : data?.name}
          </Tooltip>
        ) : (
          '-'
        );
      },
    },

    ...(variantType !== 'appreciation'
      ? [
          {
            title: 'Action To be Taken',
            dataIndex: 'action',
            key: 'actionToBeTaken',
            render: (notused: any, record: any) => {
              return record.action ? (
                <Tooltip title={record?.action}>
                  {record?.action?.length >= 40
                    ? record?.action?.slice(0, 40) + '....'
                    : record?.action}
                </Tooltip>
              ) : (
                'N/A'
              );
            },
          },
        ]
      : []),

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
      key: 'actionButtons',
      render: (notused: any, record: any) => {
        return (
          <div className="flex gap-2">
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
          </div>
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
          value: `${item?.firstName} ${item?.middleName} ${item?.lastName}`,
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
      <div className="flex justify-center sm:justify-end ">
        <Tabs
          defaultActiveKey="personal"
          items={items}
          onChange={onChangeUserType}
        />
      </div>
      {getFeedbackCardDataLoading ? (
        <div className="flex overflow-x-auto gap-4 p-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible scrollbar-none sm:flex-none">
          {Array.from({ length: 4 }).map((nonused, index) => (
            <div key={index} className="min-w-[90%] flex-shrink-0 sm:min-w-0">
              <FeedbackCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4  sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible scrollbar-none sm:flex-none">
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0">
            <FeedbackCard
              appreciationPercentage={
                feedbackAnaliytics?.appreciationStats?.issued
              }
              total={feedbackAnaliytics?.appreciationStats?.totalIssued}
              contributorCount={
                feedbackAnaliytics?.appreciationStats?.totalIssued
              }
              type="appreciation"
              textType="appreciationIssued"
            />
          </div>
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0">
            <FeedbackCard
              appreciationPercentage={
                feedbackAnaliytics?.appreciationStats?.received
              }
              total={feedbackAnaliytics?.appreciationStats?.totalReceived}
              contributorCount={
                feedbackAnaliytics?.appreciationStats?.totalReceived
              }
              type="appreciation"
              textType="appreciationReceived"
            />
          </div>
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0">
            <FeedbackCard
              appreciationPercentage={
                feedbackAnaliytics?.reprimandStats?.issued
              }
              total={feedbackAnaliytics?.reprimandStats?.totalIssued}
              contributorCount={feedbackAnaliytics?.reprimandStats?.totalIssued}
              type="reprimand"
              textType="reprimandIssued"
            />
          </div>
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0">
            <FeedbackCard
              appreciationPercentage={
                feedbackAnaliytics?.reprimandStats?.received
              }
              total={feedbackAnaliytics?.reprimandStats?.totalReceived}
              contributorCount={
                feedbackAnaliytics?.reprimandStats?.totalReceived
              }
              type="reprimand"
              textType="reprimandReceived"
            />
          </div>
        </div>
      )}

      <Spin spinning={getFeedbackTypeLoading} tip="Loading...">
        <div className="flex justify-start pl-2 ">
          <Tabs
            className="max-w-[850px]"
            defaultActiveKey={activeTab}
            items={getAllFeedbackTypes?.items?.map(
              (item: FeedbackTypeItems) => ({
                key: item?.id,
                label: item?.category,
              }),
            )}
            onChange={onChangeFeedbackType}
          />
        </div>
      </Spin>

      <div className="flex justify-end sm:justify-start p-2 ">
        <Tabs
          defaultActiveKey="appreciation"
          items={variantTypeItems}
          onChange={onChange}
        />
      </div>

      <div className=" -mt-10">
        <TabLandingLayout
          buttonTitle={
            <div className="text-sm hidden sm:block">{variantType}</div>
          }
          buttonIcon={<PiPlus className="text-2xl font-bold ml-2" />} // making the icon bold
          id="conversationLayoutId"
          onClickHandler={() => setOpen(true)}
          disabledMessage="Please select a feedback type"
          buttonDisabled={activeTab === ''}
          title={<div className="text-lg capitalize">{variantType}</div>}
          subtitle={
            <div className="capitalize">{`Given up on  ${variantType}`}</div>
          }
          allowSearch={false}
          permissionsData={[Permissions.CreateFeedback]}
        >
          <EmployeeSearchComponent fields={searchField} />
          <div className="flex overflow-x-auto scrollbar-none w-full">
            <Table
              loading={getFeedbackRecordLoading}
              dataSource={getAllFeedbackRecord?.items}
              columns={columns}
              rowClassName={() => 'h-[60px]'}
              scroll={{ x: 'max-content' }}
              className="w-full"
              pagination={false} // ✅ Disable AntD built-in pagination
            />
          </div>

          <CustomPagination
            current={page}
            total={getAllFeedbackRecord?.meta?.totalItems || 0}
            pageSize={pageSize}
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }}
            onShowSizeChange={(size: number) => {
              setPageSize(size);
              setPage(1); // Reset to first page on page size change
            }}
          />
        </TabLandingLayout>
      </div>
      <div>
        {/* <CustomDrawerLayout
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
        > */}
        <CreateFeedbackForm form={form} />
        {/* </CustomDrawerLayout> */}
      </div>
    </TabLandingLayout>
  );
};

export default Page;
