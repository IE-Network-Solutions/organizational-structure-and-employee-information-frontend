'use client';
import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { Button, Col, Popover, Row, Space } from 'antd';
import { TbFileDownload, TbFileUpload, TbLayoutList } from 'react-icons/tb';
import EmployeeAttendanceTable from './_components/employeeAttendanceTable';
import { LuBookmark } from 'react-icons/lu';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { TIME_AND_ATTENDANCE_MODE_URL } from '@/utils/constants';
const EmployeeAttendance = () => {
  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';
  const [bodyRequest, setBodyRequest] = useState<AttendanceRequestBody>(
    {} as AttendanceRequestBody,
  );
  const { data, isFetching, refetch } = useGetAttendances(
    {},
    bodyRequest,
    true,
    false,
  );

  useEffect(() => {
    if (data && data.file) {
      const url = new URL(TIME_AND_ATTENDANCE_MODE_URL!);
      window.open(`${url.origin}/${data.file}`, '_blank');
    }
  }, [data]);

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
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Employee Attendance"
        description="Manage your Team Attendance"
      >
        <Space>
          <Button
            icon={<TbFileUpload size={18} />}
            size="large"
            loading={isFetching}
          >
            Import
          </Button>
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
            <Button
              icon={<TbFileDownload size={18} />}
              size="large"
              type="primary"
              loading={isFetching}
            >
              Export
            </Button>
          </Popover>
        </Space>
      </PageHeader>
      <BlockWrapper className="mt-8">
        <EmployeeAttendanceTable setBodyRequest={setBodyRequest} />
      </BlockWrapper>
    </div>
  );
};

export default EmployeeAttendance;
