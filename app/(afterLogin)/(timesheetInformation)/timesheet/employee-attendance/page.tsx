'use client';
import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { Button, Col, Dropdown, Menu, Popover, Row, Space } from 'antd';
import { TbFileDownload, TbFileUpload, TbLayoutList } from 'react-icons/tb';
import EmployeeAttendanceTable from './_components/employeeAttendanceTable';
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
import { HiOutlineTemplate } from 'react-icons/hi';
import { useMediaQuery } from 'react-responsive';

import AttendanceImportErrorModal from './_components/attendanceImportErrorModal';
const EmployeeAttendance = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 768 }); // Detect small screens

  const importAttendance = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportType, setExportType] = useState<'EXCEL' | 'PDF' | null>(null);
  const [file, setFile] = useState<any>();
  const [bodyRequest, setBodyRequest] = useState<AttendanceRequestBody>({
    filter: {}, // Initialize with empty filter
  });
  const { data, isFetching, refetch } = useGetAttendances(
    {},
    bodyRequest,
    true,
    true,
  );
  // Log the current state of data and request
  useEffect(() => {
    if (bodyRequest.exportType) {
      refetch();
    }
  }, [bodyRequest]);

  const {
    mutate: uploadImport,
    isLoading: isLoadingImport,
    isSuccess,
  } = useAttendanceImport();

  const { setIsShowBreakAttendanceImportSidebar, filter } =
    useEmployeeAttendanceStore();

  useEffect(() => {
    if (data && data.file) {
      const filePath = data.file.startsWith('/') ? data.file : `/${data.file}`;

      const url = TIME_AND_ATTENDANCE_URL?.replace('/api/v1', '');

      const fileUrl = `${url}${filePath}`;
      // Open the file in a new window
      window.open(fileUrl, '_blank');

      // Create a temporary link to trigger the download
      // const link = document.createElement('a');
      // link.href = fileUrl;
      // link.download = `attendance_${new Date().toISOString().split('T')[0]}`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

      setIsExportLoading(false);
      setExportType(null);
      setBodyRequest((prev) => ({
        ...prev,
        exportType: undefined,
      }));
    }
  }, [data, isFetching]);

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

  const onExport = async (type: 'PDF' | 'EXCEL') => {
    try {
      setExportType(type);
      setIsExportLoading(true);
      if (!data?.items?.length) {
        return;
      }
      // Create a new request object with export type and filter
      const exportRequest: AttendanceRequestBody = {
        exportType: type,
        filter: filter,
      };
      // Set the request
      setBodyRequest(exportRequest);
    } catch (error) {
      // You might want to show an error message to the user here
      setIsExportLoading(false);
      setExportType(null);
      setBodyRequest((prev) => ({
        ...prev,
        exportType: undefined,
      }));
    }
  };

  // Dropdown Menu for Import Buttons
  const importMenu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<TbFileUpload />}
        onClick={() => {
          if (importAttendance) {
            importAttendance.current?.click();
          }
        }}
      >
        Import Attendance
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<TbFileUpload />}
        onClick={() => setIsShowBreakAttendanceImportSidebar(true)}
      >
        Import Break Attendance
      </Menu.Item>
      <Menu.Item key="3" icon={<HiOutlineTemplate />}>
        <a href="/Attendance_Template.xlsx" download>
          Attendance Template
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div className="h-auto w-auto bg-gray-100 sm:bg-white pr-3 pb-6 pl-6 sm:pl-3">
        <PageHeader
          title="Employee Attendance"
          description="Manage your Team Attendance"
        >
          <Space
            direction="vertical"
            className="w-full md:flex-row flex flex-col justify-between items-start"
          >
            <Space className="w-full justify-between md:flex-row items-start">
              {/* Import Dropdown for Small Screens */}
              {isSmallScreen ? (
                <PermissionWrapper
                  permissions={[
                    Permissions.ImportEmployeeAttendanceInformation,
                  ]}
                >
                  <Dropdown overlay={importMenu} trigger={['click']}>
                    <Button
                      icon={<TbFileUpload size={18} />}
                      size="large"
                      loading={isLoading || isLoadingImport}
                      className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-between items-center"
                    >
                      {/* Display only icons in small screens */}
                      <span className="sr-only">Import</span>
                    </Button>
                  </Dropdown>
                </PermissionWrapper>
              ) : (
                // Regular import buttons for larger screens
                <>
                  <PermissionWrapper
                    permissions={[
                      Permissions.ImportEmployeeAttendanceInformation,
                    ]}
                  >
                    <Button
                      icon={<TbFileUpload size={18} />}
                      size="large"
                      loading={isLoading || isLoadingImport}
                      onClick={() => {
                        if (importAttendance) {
                          importAttendance.current?.click();
                        }
                      }}
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Import Attendance
                    </Button>
                  </PermissionWrapper>

                  <PermissionWrapper
                    permissions={[
                      Permissions.ImportEmployeeAttendanceInformation,
                    ]}
                  >
                    <Button
                      icon={<TbFileUpload size={18} />}
                      size="large"
                      loading={isLoading || isLoadingImport}
                      onClick={() =>
                        setIsShowBreakAttendanceImportSidebar(true)
                      }
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                    >
                      Break Import
                    </Button>
                  </PermissionWrapper>

                  <PermissionWrapper
                    permissions={[
                      Permissions.ImportEmployeeAttendanceInformation,
                    ]}
                  >
                    <a href="/Attendance_Template.xlsx" download>
                      <Button
                        icon={<HiOutlineTemplate size={18} />}
                        size="large"
                        className="w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        Attendance Template
                      </Button>
                    </a>
                  </PermissionWrapper>
                </>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={importAttendance}
                accept=".xlsx, .xls"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setFile(e.target.files[0]);
                  }
                }}
                hidden
              />

              {/* Export Button with Popover */}
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
                        <Col span={24}>
                          <Button
                            size="small"
                            className="w-full"
                            type="primary"
                            icon={<TbLayoutList size={16} />}
                            onClick={() => {
                              onExport('EXCEL');
                            }}
                            loading={isExportLoading && exportType === 'EXCEL'}
                          >
                            Excel
                          </Button>
                        </Col>
                        {/* <Col span={12}>
                          <Button
                            size="small"
                            className="w-full"
                            type="primary"
                            icon={<LuBookmark size={16} />}
                            onClick={() => onExport('PDF')}
                            loading={isExportLoading && exportType === 'PDF'}
                          >
                            PDF
                          </Button>
                        </Col> */}
                      </Row>
                    </div>
                  }
                >
                  <Button
                    icon={<TbFileDownload size={18} />}
                    size="large"
                    type="primary"
                    loading={isExportLoading}
                    className="w-full sm:w-auto mt-2 sm:mt-0 p-4"
                  >
                    {!isSmallScreen ? 'Export' : ''}
                  </Button>
                </Popover>
              </PermissionWrapper>
            </Space>
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
