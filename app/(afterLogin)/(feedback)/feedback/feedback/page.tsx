'use client';
import { Button, Form, Popconfirm, Spin, Table, Tabs, Tooltip } from 'antd';
import { TabsProps } from 'antd';
import { ConversationStore } from '@/store/uistate/features/conversation';
import TabLandingLayout from '@/components/tabLanding';
import { PiPlus } from 'react-icons/pi';
import { PiExportLight } from 'react-icons/pi';
import EmployeeSearchComponent from '@/components/common/search/searchComponent';
import { useEffect, useState } from 'react';
import {
  useEmployeeDepartments,
  useGetAllUsers,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import CreateFeedbackForm from './_components/createFeedback';
import {
  useFetchAllFeedbackRecord,
  useFetchAllFeedbackRecordForExport,
} from '@/store/server/features/feedback/feedbackRecord/queries';
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
import { useFeedbackExport } from './_components/useFeedbackExport';
import NotificationMessage from '@/components/common/notification/notificationMessage';

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

  const [isExporting, setIsExporting] = useState(false);
  const { exportFeedbackData } = useFeedbackExport();
  const { refetch: refetchExportData, isLoading: isExportDataLoading } =
    useFetchAllFeedbackRecordForExport({
      variantType,
      activeTab,
      userId: 'all', // Always use 'all' for export when on All Employees tab
      empId,
      givenDate,
    });

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
  }, [getAllFeedbackTypes, userIdData, setUserId, setActiveTab]);

  const onChangeFeedbackType = (key: string) => {
    setActiveTab(key);
  };

  const handleExport = async () => {
    if (userId !== 'all') {
      return; // Only allow export on All Employees tab
    }

    setIsExporting(true);
    try {
      const exportResponse = await refetchExportData();
      const exportData = exportResponse.data;

      if (exportData?.items && exportData.items.length > 0) {
        const activeTabName =
          getAllFeedbackTypes?.items?.find(
            (item: FeedbackTypeItems) => item.id === activeTab,
          )?.category ?? 'Feedback';

        await exportFeedbackData(
          exportData.items,
          getAllUsers,
          getAllFeedbackTypes,
          EmployeeDepartment,
          variantType,
          `${activeTabName}_${variantType}`,
        );
      } else {
        // Show message if no data to export
        NotificationMessage.warning({
          message: 'No Data to Export',
          description:
            'There is no feedback data available to export with the current filters.',
        });
      }
    } catch (error) {
      NotificationMessage.error({
        message: 'Export Failed',
        description:
          'An error occurred while exporting feedback data. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
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
        <AccessGuard permissions={[Permissions.ViewAllEmployeeFeedback]} data-cy="feedback-page-access-guard">
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
          <Tooltip title={record?.reason} data-cy={`feedback-page-tooltip-${record?.reason}`}>
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
          <Tooltip title={record?.feedbackVariant.name} data-cy={`feedback-page-tooltip-${record?.feedbackVariant.name}`}>
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
          <Tooltip title={data?.name} data-cy={`feedback-page-tooltip-${data?.name}`}>
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
                <Tooltip title={record?.action} data-cy={`feedback-page-tooltip-${record?.action}`}>
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
          <div className="flex gap-2" data-cy={`feedback-feedback-page-div-action-${record?.id}`} id={`feedback-feedback-page-div-action-${record?.id}`}>
            <Popconfirm
              title="Are you sure you want to delete?"
              onConfirm={() => handleDelete(record?.id)}
              okText="Yes"
              cancelText="No"
              data-cy={`feedback-feedback-page-popconfirm-delete-${record?.id}`}
              id={`feedback-feedback-page-popconfirm-delete-${record?.id}`}
            >
              <Button
                disabled={record.issuerId !== userIdData}
                size="small"
                icon={<MdDeleteOutline />}
                danger
                type="primary"
                data-cy={`feedback-feedback-page-button-delete-${record?.id}`}
                id={`feedback-feedback-page-button-delete-${record?.id}`}
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
      data-cy="feedback-feedback-page-tab-landing-layout"
      onClickHandler={() => {}}
      title="Feedback"
      subtitle="Manage your Feedback"
      allowSearch={false}
    >
      <div className="flex justify-center sm:justify-end " data-cy="feedback-feedback-page-div-user-tabs" id="feedback-feedback-page-div-user-tabs">
        <Tabs
          defaultActiveKey="personal"
          items={items}
          onChange={onChangeUserType}
          data-cy="feedback-feedback-page-tabs-user-type"
          id="feedback-feedback-page-tabs-user-type"
        />
      </div>
      {getFeedbackCardDataLoading ? (
        <div className="flex overflow-x-auto gap-4 p-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible scrollbar-none sm:flex-none" data-cy="feedback-feedback-page-div-cards-loading" id="feedback-feedback-page-div-cards-loading">
          {Array.from({ length: 4 }).map((nonused, index) => (
            <div key={index} className="min-w-[90%] flex-shrink-0 sm:min-w-0" data-cy={`feedback-feedback-page-div-card-skeleton-${index}`} id={`feedback-feedback-page-div-card-skeleton-${index}`}>
              <FeedbackCardSkeleton data-cy={`feedback-feedback-page-div-card-skeleton-${index}`} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4  sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible scrollbar-none sm:flex-none" data-cy="feedback-feedback-page-div-cards" id="feedback-feedback-page-div-cards">
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0" data-cy="feedback-feedback-page-div-card-appreciation-issued" id="feedback-feedback-page-div-card-appreciation-issued">
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
              data-cy="feedback-feedback-page-div-card-appreciation-issued-feedback-card"
            />
          </div>
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0" data-cy="feedback-feedback-page-div-card-appreciation-received" id="feedback-feedback-page-div-card-appreciation-received">
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
              data-cy="feedback-feedback-page-div-card-appreciation-received-feedback-card"
            />
          </div>
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0" data-cy="feedback-feedback-page-div-card-reprimand-issued" id="feedback-feedback-page-div-card-reprimand-issued">
            <FeedbackCard
              appreciationPercentage={
                feedbackAnaliytics?.reprimandStats?.issued
              }
              total={feedbackAnaliytics?.reprimandStats?.totalIssued}
              contributorCount={feedbackAnaliytics?.reprimandStats?.totalIssued}
              type="reprimand"
              textType="reprimandIssued"
              data-cy="feedback-feedback-page-div-card-reprimand-issued-feedback-card"
            />
          </div>
          <div className="min-w-[90%] flex-shrink-0 sm:min-w-0" data-cy="feedback-feedback-page-div-card-reprimand-received" id="feedback-feedback-page-div-card-reprimand-received">
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
              data-cy="feedback-feedback-page-div-card-reprimand-received-feedback-card"
            />
          </div>
        </div>
      )}

      <Spin spinning={getFeedbackTypeLoading} tip="Loading..." data-cy="feedback-feedback-page-spin-feedback-types">
        <div className="flex justify-start pl-2 " data-cy="feedback-feedback-page-div-feedback-type-tabs" id="feedback-feedback-page-div-feedback-type-tabs">
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
            data-cy="feedback-feedback-page-tabs-feedback-type"
            id="feedback-feedback-page-tabs-feedback-type"
          />
        </div>
      </Spin>

      <div className="flex justify-end sm:justify-start p-2 " data-cy="feedback-feedback-page-div-variant-tabs" id="feedback-feedback-page-div-variant-tabs">
        <Tabs
          defaultActiveKey="appreciation"
          items={variantTypeItems}
          onChange={onChange}
          data-cy="feedback-feedback-page-tabs-variant-type"
          id="feedback-feedback-page-tabs-variant-type"
        />
      </div>

      <div className=" -mt-10" data-cy="feedback-feedback-page-div-main-content" id="feedback-feedback-page-div-main-content">
        <TabLandingLayout
          buttonTitle={
            <div className="text-sm hidden sm:block" data-cy="feedback-feedback-page-div-button-title" id="feedback-feedback-page-div-button-title">{variantType}</div>
          }
          buttonIcon={<PiPlus className="text-2xl font-bold ml-2" data-cy="feedback-feedback-page-icon-plus" id="feedback-feedback-page-icon-plus" />} // making the icon bold
          id="conversationLayoutId"
          data-cy="feedback-feedback-page-tab-landing-layout-main"
          onClickHandler={() => setOpen(true)}
          disabledMessage="Please select a feedback type"
          buttonDisabled={activeTab === ''}
          title={<div className="text-lg capitalize" data-cy="feedback-feedback-page-div-title" id="feedback-feedback-page-div-title">{variantType}</div>}
          subtitle={
            <div className="capitalize" data-cy="feedback-feedback-page-div-subtitle" id="feedback-feedback-page-div-subtitle">{`Given up on  ${variantType}`}</div>
          }
          allowSearch={false}
          permissionsData={[Permissions.CreateFeedback]}
        >
          <div className="flex justify-between items-center mb-4" data-cy="feedback-feedback-page-div-search-export" id="feedback-feedback-page-div-search-export">
            <div className="flex-1" data-cy="feedback-feedback-page-div-search" id="feedback-feedback-page-div-search">
              <EmployeeSearchComponent fields={searchField} data-cy="feedback-feedback-page-employee-search" />
            </div>
            {userId === 'all' && (
              <AccessGuard permissions={[Permissions.ViewAllEmployeeFeedback]} data-cy="feedback-feedback-page-btn-guard">
                <Tooltip title="Export Feedback Data" data-cy="feedback-feedback-page-tooltip-export" id="feedback-feedback-page-tooltip-export">
                  <Button
                    type="default"
                    icon={<PiExportLight size={20} />}
                    onClick={handleExport}
                    loading={isExporting || isExportDataLoading}
                    className="ml-4"
                    data-cy="feedback-feedback-page-button-export"
                    id="feedback-feedback-page-button-export"
                  >
                    Export
                  </Button>
                </Tooltip>
              </AccessGuard>
            )}
          </div>
          <div className="flex overflow-x-auto scrollbar-none w-full" data-cy="feedback-feedback-page-div-table-container" id="feedback-feedback-page-div-table-container">
            <Table
              loading={getFeedbackRecordLoading}
              dataSource={getAllFeedbackRecord?.items}
              columns={columns}
              rowClassName={() => 'h-[60px]'}
              scroll={{ x: 'max-content' }}
              className="w-full"
              pagination={false} // ✅ Disable AntD built-in pagination
              data-cy="feedback-feedback-page-table"
              id="feedback-feedback-page-table"
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
            data-cy="feedback-feedback-page-pagination"
          />
        </TabLandingLayout>
      </div>
      <div data-cy="feedback-feedback-page-div-create-form" id="feedback-feedback-page-div-create-form">
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
        <CreateFeedbackForm form={form} data-cy="feedback-feedback-page-form-create-feedback" />
        {/* </CustomDrawerLayout> */}
      </div>
    </TabLandingLayout>
  );
};

export default Page;
