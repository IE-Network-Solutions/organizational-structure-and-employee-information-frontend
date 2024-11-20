'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import LeaveManagementTable from './_components/leaveManagementTable';
import { Button, Col, Input, Popover, Row, Space } from 'antd';
import { IoSearchOutline } from 'react-icons/io5';
import CustomButton from '@/components/common/buttons/customButton';
import { TbFileDownload, TbLayoutList } from 'react-icons/tb';
import { LuBookmark } from 'react-icons/lu';
import LeaveRequestManagementSidebar from './_components/leaveRequestManagementSidebar';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useEffect, useState } from 'react';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import { LeaveRequestBody } from '@/store/server/features/timesheet/leaveRequest/interface';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const LeaveManagement = () => {
  const [bodyRequest, setBodyRequest] = useState<LeaveRequestBody>(
    {} as LeaveRequestBody,
  );
  const { setLeaveTypes } = useLeaveManagementStore();
  const { data: leaveTypesData } = useGetLeaveTypes();
  const {
    data: leaveRequestData,
    isFetching,
    refetch,
  } = useGetLeaveRequest({}, bodyRequest, true, false);

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
      <div className="h-auto w-auto pr-6 pb-6 pl-3">
        <BlockWrapper>
          <PageHeader title="Leave Management">
            <Space size={20}>
              <Input
                placeholder="Search employee"
                className="h-14 text-gray-900 w-[300px]"
                suffix={<IoSearchOutline size={20} className="text-gray-900" />}
              />
              <AccessGuard permissions={[Permissions.GenerateLeaveReports]}>
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
                    title="Download CSV"
                    id="downloadCsvFileId"
                    icon={<TbFileDownload size={20} />}
                    loading={isFetching}
                  />
                </Popover>
              </AccessGuard>
            </Space>
          </PageHeader>

          <LeaveManagementTable setBodyRequest={setBodyRequest} />
        </BlockWrapper>
      </div>

      <LeaveRequestManagementSidebar />
    </>
  );
};

export default LeaveManagement;
