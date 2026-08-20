'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import CustomBreadcrumb from '@/components/common/breadCramp';
import LeaveManagementTable from './_components/leaveManagementTable';
import { Button, Modal, Popover, Space, Tabs, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import LeaveRequestDetailModal from './_components/leaveRequestDetailModal';
import LeaveManagementDeepLink from './_components/LeaveManagementDeepLink';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useEffect, useState } from 'react';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import LeaveRequestSidebar from '../../my-timesheet/_components/leaveRequestSidebar';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useMediaQuery } from 'react-responsive';
import { useSetAllLeaveRequestNotification } from '@/store/server/features/timesheet/leaveRequest/mutation';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LeaveBalance from '../leave-balance/page';
import DownloadLeaveBalance from '../leave-balance/_components/Download';

const LeaveManagement = () => {
  const [bodyRequest, setBodyRequest] = useState<LeaveRequestBody>(
    {} as LeaveRequestBody,
  );
  const { setLeaveTypes, selectedRowKeys, setSelectedRowKeys } =
    useMyTimesheetStore();
  const { mutate: sendNotification, isLoading } =
    useSetAllLeaveRequestNotification();
  const [emailNotificationModalOpen, setEmailNotificationModalOpen] =
    useState(false);
  const [activeTabKey, setActiveTabKey] = useState('1');

  const { data: leaveTypesData } = useGetLeaveTypes();
  const {
    data: leaveRequestData,
    isFetching,
    refetch,
  } = useGetLeaveRequest({}, bodyRequest, true, false);
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    setLeaveTypes(leaveTypesData?.items ?? []);
  }, [leaveTypesData]);

  useEffect(() => {
    if (leaveRequestData && leaveRequestData.file) {
      downloadFile(
        leaveRequestData.file,
        leaveRequestData.file.split('/').pop() || 'downloaded_file.xlsx',
      );
    }
  }, [leaveRequestData]);

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  useEffect(() => {
    if (bodyRequest.exportType) {
      refetch().finally(() => {
        setBodyRequest((prev) => ({
          ...prev,
          exportType: undefined,
        }));
      });
    }
  }, [bodyRequest]);

  const onExport = (type: 'PDF' | 'EXCEL') => {
    setBodyRequest((prev) => ({
      ...prev,
      exportType: type,
      filter: {
        ...prev.filter,
        leaveRequestsIds:
          selectedRowKeys.length > 0
            ? selectedRowKeys.map((key) => key.toString())
            : prev.filter?.leaveRequestsIds,
      },
    }));
  };

  return (
    <>
      <div
        className="h-auto w-auto pb-6 bg-white rounded-lg"
        id="time-attendance-leave-management-page-container"
        data-cy="time-attendance-leave-management-page-container"
      >
        <BlockWrapper
          data-cy="time-attendance-leave-management-block-wrapper"
          className="bg-white px-0 py-2"
        >
          <div
            className="mb-4"
            data-cy="time-attendance-leave-management-header"
          >
            {activeTabKey === '1' && (
              <CustomBreadcrumb
                title="Leave Management"
                subtitle="Time and Attendance / Leave Management"
                titleExtra={
                  <Space
                    size={20}
                    id="time-attendance-leave-management-header-actions"
                    data-cy="time-attendance-leave-management-header-actions"
                  >
                    <Tooltip
                      id="time-attendance-leave-management-email-notification-button-tooltip"
                      data-cy="time-attendance-leave-management-email-notification-button-tooltip"
                      color="white"
                      title={
                        <span
                          data-cy="timesheet-leave-management-leaves-page-tsx-page-span-118"
                          className="text-black text-sm"
                        >
                          Send an email for leave approvers who have not taken
                          action on pending leave requests
                        </span>
                      }
                    >
                      <Button
                        type="default"
                        id="emailNotification"
                        data-cy="time-attendance-leave-management-email-notification-button"
                        className={
                          isSmallScreen
                            ? 'w-10 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center transition-colors [&_.ant-btn-icon]:text-primary hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF]'
                            : 'h-10 min-h-10 rounded-lg border border-gray-200 bg-white px-4 gap-2 text-sm text-gray-700 font-normal flex items-center transition-colors [&_.ant-btn-icon]:text-primary hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF]'
                        }
                        icon={
                          <span
                            className="inline-flex items-center justify-center shrink-0 text-inherit py-3"
                            data-cy="time-attendance-leave-management-email-notification-button-icon-wrapper"
                          >
                            <LocalPostOfficeIcon
                              data-cy="time-attendance-leave-management-email-notification-button-icon"
                              fontSize="small"
                              className="!text-[16px]"
                            />
                          </span>
                        }
                        onClick={() => setEmailNotificationModalOpen(true)}
                        loading={isLoading}
                      >
                        {!isSmallScreen && (
                          <span
                            className="leading-none"
                            data-cy="time-attendance-leave-management-email-notification-label"
                          >
                            Email Notification
                          </span>
                        )}
                      </Button>
                    </Tooltip>
                    <Popover
                      data-cy="time-attendance-leave-management-export-popover"
                      trigger="click"
                      placement="bottom"
                      align={{ offset: [0, 4] }}
                      content={
                        <div
                          className="flex flex-col gap-1 min-w-[120px] py-1"
                          id="time-attendance-leave-management-export-popover-content"
                          data-cy="time-attendance-leave-management-export-popover-content"
                        >
                          <button
                            type="button"
                            id="excelFileTypeToExportId"
                            data-cy="time-attendance-leave-management-export-popover-xlsx"
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-left text-sm font-normal text-gray-600 shadow-sm border border-gray-200 hover:border-[#4096FF] hover:text-[#4096FF] transition-colors"
                            onClick={() => onExport('EXCEL')}
                          >
                            XLSX
                          </button>
                          <button
                            type="button"
                            id="pdfFileTypeToExportId"
                            data-cy="time-attendance-leave-management-export-popover-pdf"
                            className="w-full rounded-lg bg-white px-4 py-2.5 text-left text-sm font-normal text-gray-600 shadow-sm border border-gray-200 hover:border-[#4096FF] hover:text-[#4096FF] transition-colors"
                            onClick={() => onExport('PDF')}
                          >
                            PDF
                          </button>
                        </div>
                      }
                    >
                      <Button
                        type="default"
                        id="downloadCsvFileId"
                        data-cy="time-attendance-leave-management-download-csv-button"
                        className="bg-primary text-white border-0 hover:!bg-[#4096FF] hover:!text-white hover:[&_.ant-btn-icon]:!text-white hover:opacity-100"
                        icon={
                          <SaveAltIcon
                            data-cy="time-attendance-leave-management-download-csv-button-icon"
                            fontSize="small"
                            className="!text-[20px]"
                          />
                        }
                        loading={isFetching}
                      >
                        {!isSmallScreen && (
                          <span
                            className="leading-none"
                            data-cy="time-attendance-leave-management-export-label"
                          >
                            Export
                          </span>
                        )}
                      </Button>
                    </Popover>
                  </Space>
                }
              />
            )}

            {activeTabKey === '2' && (
              <CustomBreadcrumb
                title="Leave Balance"
                subtitle="Time and Attendance / Leave Balance"
                titleExtra={
                  <Space
                    size={20}
                    id="time-attendance-leave-management-header-actions"
                    data-cy="time-attendance-leave-management-header-actions"
                  >
                    <div
                      className="mb-2 flex justify-between"
                      id="time-attendance-leave-balance-header-row"
                      data-cy="time-attendance-leave-balance-header-row"
                    >
                      <div
                        id="time-attendance-leave-balance-download-container"
                        data-cy="time-attendance-leave-balance-download-container"
                      >
                        <DownloadLeaveBalance data-cy="time-attendance-leave-balance-download-button" />
                      </div>
                    </div>
                  </Space>
                }
              />
            )}
          </div>
          <Tabs
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            items={[
              {
                key: '1',
                label: (
                  <span
                    data-cy="time-attendance-leave-management-tab-label"
                    className={`${
                      activeTabKey === '1'
                        ? 'font-bold text-base'
                        : 'font-normal text-base'
                    }`}
                  >
                    Leave Management
                  </span>
                ),
                children: (
                  <LeaveManagementTable
                    data-cy="time-attendance-leave-management-table"
                    setBodyRequest={setBodyRequest}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                  />
                ),
              },
              {
                key: '2',
                label: (
                  <span
                    data-cy="time-attendance-leave-balance-tab-label"
                    className={`${
                      activeTabKey === '2'
                        ? 'font-bold text-base'
                        : 'font-normal text-base'
                    }`}
                  >
                    Leave Balance
                  </span>
                ),
                children: <LeaveBalance />,
              },
            ]}
          />
          {/* <LeaveManagementTable
            data-cy="time-attendance-leave-management-table"
            setBodyRequest={setBodyRequest}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          /> */}
        </BlockWrapper>
      </div>

      <Modal
        open={emailNotificationModalOpen}
        onCancel={() => setEmailNotificationModalOpen(false)}
        title={
          <div data-cy="time-attendance-leave-management-email-notification-modal-title-wrapper">
            <div
              className="text-base font-bold text-gray-900"
              data-cy="time-attendance-leave-management-email-notification-modal-title"
            >
              Notification
            </div>
            <div
              className="text-sm text-gray-500 font-normal mt-0.5"
              data-cy="time-attendance-leave-management-email-notification-modal-subtitle"
            >
              Leave Approval Notification
            </div>
          </div>
        }
        closeIcon={
          <CloseOutlined data-cy="time-attendance-leave-management-email-notification-modal-close" />
        }
        footer={
          <div
            className="flex justify-end gap-2"
            data-cy="time-attendance-leave-management-email-notification-modal-footer"
          >
            <Button
              onClick={() => setEmailNotificationModalOpen(false)}
              data-cy="time-attendance-leave-management-email-notification-modal-cancel"
              className="border-gray-300 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                const selectedIds =
                  selectedRowKeys.length > 0
                    ? selectedRowKeys.map((key) => key.toString())
                    : undefined;
                sendNotification(
                  { leaveRequestIds: selectedIds },
                  {
                    onSuccess: () => setEmailNotificationModalOpen(false),
                  },
                );
              }}
              loading={isLoading}
              data-cy="time-attendance-leave-management-email-notification-modal-send"
              className="bg-[#3636F0] hover:!bg-[#2d2dbf] border-none"
            >
              Send Email
            </Button>
          </div>
        }
        width={500}
        centered
        className="rounded-xl"
        data-cy="time-attendance-leave-management-email-notification-modal"
      >
        <p
          className="text-gray-700 text-sm mb-0"
          data-cy="time-attendance-leave-management-email-notification-modal-body"
        >
          This will send an email notification to the approver for all pending
          leave requests. Do you want to continue?
        </p>
      </Modal>

      <LeaveManagementDeepLink />
      <LeaveRequestDetailModal data-cy="time-attendance-leave-request-detail-modal" />
      <LeaveRequestSidebar data-cy="time-attendance-leave-management-request-sidebar" />
    </>
  );
};

export default LeaveManagement;
