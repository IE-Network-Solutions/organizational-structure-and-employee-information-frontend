'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import LeaveManagementTable from './_components/leaveManagementTable';
import { Button, Col, Popover, Row, Space } from 'antd';
import CustomButton from '@/components/common/buttons/customButton';
import { TbFileDownload, TbLayoutList } from 'react-icons/tb';
import { LuBookmark } from 'react-icons/lu';
import LeaveRequestManagementSidebar from './_components/leaveRequestManagementSidebar';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useEffect, useState } from 'react';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import LeaveRequestSidebar from '../../my-timesheet/_components/leaveRequestSidebar';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useMediaQuery } from 'react-responsive';

const LeaveManagement = () => {
  const [bodyRequest, setBodyRequest] = useState<LeaveRequestBody>(
    {} as LeaveRequestBody,
  );
  const { setLeaveTypes } = useMyTimesheetStore();
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
      const url = new URL(TIME_AND_ATTENDANCE_URL!);
      window.open(`${url.origin}/${leaveRequestData.file}`, '_blank');
    }
  }, [leaveRequestData]);

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
    }));
  };

  return (
    <>
      <div className="h-auto w-auto pb-6">
        <BlockWrapper>
          <PageHeader title="Leave Management">
            <Space size={20}>
              <Popover
                trigger="click"
                placement="bottomRight"
                title={
                  <div className="text-base text-gray-900 font-bold">
                    What file you want to export?
                  </div>
                }
                content={
                  <div className="pt-4">
                    <Row gutter={20}>
                      <Col span={12}>
                        <Button
                          size="small"
                          id="excelFileTypeToExportId"
                          className={buttonClass}
                          type="primary"
                          icon={<TbLayoutList size={16} />}
                          onClick={() => onExport('EXCEL')}
                        >
                          Excel
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          size="small"
                          id="pdfFileTypeToExportId"
                          className={buttonClass}
                          type="primary"
                          icon={<LuBookmark size={16} />}
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
                  className={isSmallScreen ? 'w-[65px]' : ''}
                  icon={<TbFileDownload size={20} />}
                  loading={isFetching}
                />
              </Popover>
            </Space>
          </PageHeader>

          <LeaveManagementTable setBodyRequest={setBodyRequest} />
        </BlockWrapper>
      </div>

      <LeaveRequestManagementSidebar />
      <LeaveRequestSidebar />
    </>
  );
};

export default LeaveManagement;
