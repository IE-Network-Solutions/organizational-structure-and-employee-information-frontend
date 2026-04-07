'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import LeaveManagementTable from './_components/leaveManagementTable';
import { Button, Col, Popover, Row, Space, Tooltip } from 'antd';
import CustomButton from '@/components/common/buttons/customButton';
import { TbFileDownload, TbLayoutList } from 'react-icons/tb';
import { LuBookmark } from 'react-icons/lu';
import LeaveRequestManagementSidebar from './_components/leaveRequestManagementSidebar';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useEffect, useState } from 'react';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import LeaveRequestSidebar from '../../my-timesheet/_components/leaveRequestSidebar';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useMediaQuery } from 'react-responsive';
import { useSetAllLeaveRequestNotification } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { MdMarkEmailRead } from 'react-icons/md';

const LeaveManagement = () => {
  const [bodyRequest, setBodyRequest] = useState<LeaveRequestBody>(
    {} as LeaveRequestBody,
  );
  const { setLeaveTypes, selectedRowKeys, setSelectedRowKeys } =
    useMyTimesheetStore();
  const { mutate: sendNotification, isLoading } =
    useSetAllLeaveRequestNotification();

  const { data: leaveTypesData } = useGetLeaveTypes();
  const {
    data: leaveRequestData,
    isFetching,
    refetch,
  } = useGetLeaveRequest({}, bodyRequest, true, false);
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';

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
          className="bg-white p-2"
        >
          <PageHeader
            data-cy="time-attendance-leave-management-header"
            title="Leave Management"
            horizontalPadding="px-0"
          >
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
                    className="text-black font-Manrope text-sm"
                  >
                    Send an email for leave approvers who have not taken action
                    on pending leave requests
                  </span>
                }
              >
                <CustomButton
                  title={!isSmallScreen ? 'Email Reminder' : ' '}
                  id="emailNotification"
                  data-cy="time-attendance-leave-management-email-notification-button"
                  className={isSmallScreen ? 'w-10 h-10' : ''}
                  icon={
                    <MdMarkEmailRead
                      data-cy="time-attendance-leave-management-email-notification-button-icon"
                      size={20}
                    />
                  }
                  onClick={() => {
                    const selectedIds =
                      selectedRowKeys.length > 0
                        ? selectedRowKeys.map((key) => key.toString())
                        : undefined;
                    sendNotification({
                      leaveRequestIds: selectedIds,
                    });
                  }}
                  loading={isLoading}
                />
              </Tooltip>
              <Popover
                data-cy="time-attendance-leave-management-export-popover"
                trigger="click"
                placement="bottomRight"
                title={
                  <div
                    className="text-base text-gray-900 font-bold"
                    id="time-attendance-leave-management-export-popover-title"
                    data-cy="time-attendance-leave-management-export-popover-title"
                  >
                    What file you want to export?
                  </div>
                }
                content={
                  <div
                    className="pt-4"
                    id="time-attendance-leave-management-export-popover-content"
                    data-cy="time-attendance-leave-management-export-popover-content"
                  >
                    <Row
                      gutter={20}
                      id="time-attendance-leave-management-export-popover-row"
                      data-cy="time-attendance-leave-management-export-popover-row"
                    >
                      <Col
                        span={12}
                        id="time-attendance-leave-management-export-popover-row-col-1"
                        data-cy="time-attendance-leave-management-export-popover-row-col-1"
                      >
                        <Button
                          size="small"
                          id="excelFileTypeToExportId"
                          data-cy="time-attendance-leave-management-export-popover-row-col-1-button"
                          className={buttonClass}
                          type="primary"
                          icon={
                            <TbLayoutList
                              data-cy="time-attendance-leave-management-export-popover-row-col-1-icon"
                              size={16}
                            />
                          }
                          onClick={() => onExport('EXCEL')}
                        >
                          Excel
                        </Button>
                      </Col>
                      <Col
                        span={12}
                        id="time-attendance-leave-management-export-popover-row-col-2"
                        data-cy="time-attendance-leave-management-export-popover-row-col-2"
                      >
                        <Button
                          size="small"
                          id="pdfFileTypeToExportId"
                          data-cy="time-attendance-leave-management-export-popover-row-col-2-button"
                          className={buttonClass}
                          type="primary"
                          icon={
                            <LuBookmark
                              data-cy="time-attendance-leave-management-export-popover-row-col-2-icon"
                              size={16}
                            />
                          }
                          onClick={() => onExport('PDF')}
                        >
                          PDF
                        </Button>
                      </Col>
                    </Row>
                  </div>
                }
              >
                <CustomButton
                  title={!isSmallScreen ? 'Download CSV' : ' '} // Hide text on small screens
                  id="downloadCsvFileId"
                  data-cy="time-attendance-leave-management-download-csv-button"
                  className={isSmallScreen ? 'w-10 h-10' : ''}
                  icon={
                    <TbFileDownload
                      data-cy="time-attendance-leave-management-download-csv-button-icon"
                      size={20}
                    />
                  }
                  loading={isFetching}
                />
              </Popover>
            </Space>
          </PageHeader>

          <LeaveManagementTable
            data-cy="time-attendance-leave-management-table"
            setBodyRequest={setBodyRequest}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          />
        </BlockWrapper>
      </div>

      <LeaveRequestManagementSidebar data-cy="time-attendance-leave-management-request-management-sidebar" />
      <LeaveRequestSidebar data-cy="time-attendance-leave-management-request-sidebar" />
    </>
  );
};

export default LeaveManagement;
