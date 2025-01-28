'use client';
import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { Button, Col, Popover, Row, Space } from 'antd';
import { TbFileDownload, TbFileUpload, TbLayoutList } from 'react-icons/tb';
import EmployeeAttendanceTable from './_components/employeeAttendanceTable';
import { LuBookmark } from 'react-icons/lu';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import { useGetAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useAttendanceImport } from '@/store/server/features/timesheet/attendance/mutation';
import { fileUpload } from '@/utils/fileUpload';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import EmployeeAttendanceSideBar from './_components/sideBar';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import BreakImportSidebar from './_components/breakImportSidebar';

import AttendanceImportErrorModal from './_components/attendanceImportErrorModal';
const EmployeeAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const buttonClass = 'text-xs font-bold w-full h-[29px] min-w-[125px]';
  const importAttendance = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<any>();
  const [bodyRequest, setBodyRequest] = useState<AttendanceRequestBody>(
    {} as AttendanceRequestBody,
  );
  const { data, isFetching, refetch } = useGetAttendances(
    {},
    bodyRequest,
    true,
    false,
  );
  const {
    mutate: uploadImport,
    isLoading: isLoadingImport,
    isSuccess,
  } = useAttendanceImport();

  const { setIsShowBreakAttendanceImportSidebar } =
    useEmployeeAttendanceStore();

  useEffect(() => {
    if (data && data.file) {
      const url = new URL(TIME_AND_ATTENDANCE_URL!);
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

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      fileUpload(file).then((res) => {
        setFile(null);
        setIsLoading(false);
        uploadImport(res.data['viewImage']);
      });
    }
  }, [file]);

  const onExport = (type: 'PDF' | 'EXCEL') => {
    setBodyRequest((prev) => ({
      ...prev,
      exportType: type,
    }));
  };

  return (
    <>
      <div className="h-auto w-auto pr-6 pb-6 pl-3">
        <PageHeader
          title="Employee Attendance"
          description="Manage your Team Attendance"
        >
          <Space>
            <PermissionWrapper
              permissions={[Permissions.ImportEmployeeAttendanceInformation]}
            >
              <Button
                icon={<TbFileUpload size={18} />}
                size="large"
                id="importEmployeeAttendanceId"
                loading={isFetching || isLoading || isLoadingImport}
                onClick={() => {
                  if (importAttendance) {
                    importAttendance.current?.click();
                  }
                }}
              >
                Import
              </Button>
            </PermissionWrapper>
            <input
              type="file"
              id="fileImportInputId"
              ref={importAttendance}
              accept=".xlsx, .xls"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFile(e.target.files[0]);
                }
              }}
              hidden
            />

            {/* <Button
              icon={<TbFileUpload size={18} />}
              size="large"
              id="importEmployeeAttendanceId"
              loading={isFetching || isLoading || isLoadingImport}
              onClick={() => {
                setIsShowBreakAttendanceImportSidebar(true);
              }}
            >
              Break Import
            </Button> */}
            <PermissionWrapper
              permissions={[Permissions.ImportEmployeeAttendanceInformation]}
            >
              {' '}
              <Button
                icon={<TbFileUpload size={18} />}
                size="large"
                id="importEmployeeAttendanceId"
                loading={isFetching || isLoading || isLoadingImport}
                onClick={() => {
                  setIsShowBreakAttendanceImportSidebar(true);
                }}
              >
                Break Import
              </Button>
            </PermissionWrapper>

            <PermissionWrapper
              permissions={[Permissions.ExportEmployeeAttendanceInformation]}
            >
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
                          id="excelTypeOfFileToImportId"
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
                          id="pdfTypeOfFileToImportId"
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
                  id="exportEmployeeAttendanceId"
                  loading={isFetching || isLoading || isLoadingImport}
                >
                  Export
                </Button>
              </Popover>
            </PermissionWrapper>
          </Space>
        </PageHeader>
        <BlockWrapper className="mt-8">
          <EmployeeAttendanceTable
            setBodyRequest={setBodyRequest}
            isImport={isSuccess}
          />
        </BlockWrapper>
      </div>
      <EmployeeAttendanceSideBar />
      <BreakImportSidebar />
      <AttendanceImportErrorModal />

    </>
  );
};

export default EmployeeAttendance;
