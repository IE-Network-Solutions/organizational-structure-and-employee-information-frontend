'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Col,
  Divider,
  Dropdown,
  Menu,
  Popover,
  Row,
  message,
} from 'antd';
import { TbFileUpload, TbLayoutList } from 'react-icons/tb';
import EmployeeAttendanceTable from './_components/employeeAttendanceTable';
import { AttendanceRequestBody } from '@/store/server/features/timesheet/attendance/interface';
import {
  UseExportAttendanceData,
  useGetAttendances,
} from '@/store/server/features/timesheet/attendance/queries';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useAttendanceImport } from '@/store/server/features/timesheet/attendance/mutation';
import { fileUpload } from '@/utils/fileUpload';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import BreakImportSidebar from './_components/breakImportSidebar';
import { HiOutlineTemplate } from 'react-icons/hi';
import { useMediaQuery } from 'react-responsive';

import AttendanceImportErrorModal from './_components/attendanceImportErrorModal';
import { LuBookmark } from 'react-icons/lu';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import IosShareIcon from '@mui/icons-material/IosShare';

const EmployeeAttendance = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 768 }); // Detect small screens

  const importAttendance = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [exportType, setExportType] = useState<'EXCEL' | 'PDF' | null>(null);
  const [isExportDisabled, setIsExportDisabled] = useState(false);
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
  const { mutate: exportAttendanceData, isLoading: isExportingData } =
    UseExportAttendanceData();
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

  const {
    setIsShowBreakAttendanceImportSidebar,
    filter,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useEmployeeAttendanceStore();

  const exportTimeoutRef = useRef<NodeJS.Timeout>();

  const onExport = async (type: 'PDF' | 'EXCEL') => {
    setExportType(type);
    try {
      exportAttendanceData(
        {
          exportType: type,
          filter: {
            ...filter,
            attendanceRecordIds:
              selectedRowKeys.length > 0
                ? selectedRowKeys.map((key) => key.toString())
                : filter?.attendanceRecordIds,
          },
        },
        {
          onSuccess: () => {
            message.success('Download completed successfully!');
            setIsExportDisabled(true);
            setTimeout(() => {
              setIsExportDisabled(false);
            }, 2000);
          },
        },
      );
    } catch (error) {
      message.error('Failed to export. Please try again.');
      setIsExportLoading(false);
      setExportType(null);
      setBodyRequest((prev) => ({
        ...prev,
        exportType: undefined,
      }));
    }
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    };
  }, []);

  // Reset export state when data is received
  useEffect(() => {
    if (data && data.file) {
      const filePath = data.file.startsWith('/') ? data.file : `/${data.file}`;
      const url = TIME_AND_ATTENDANCE_URL?.replace('/api/v1', '');
      const fileUrl = `${url}${filePath}`;

      window.open(fileUrl, '_blank');

      // Reset all export states
      setIsExportLoading(false);
      setExportType(null);
      setBodyRequest((prev) => ({
        ...prev,
        exportType: undefined,
      }));

      // Clear the timeout
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    }
  }, [data, isFetching]);

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      fileUpload(file)
        .then((res) => {
          setFile(null);
          setIsLoading(false);
          uploadImport(res.viewImage);
        })
        .catch(() => {
          setFile(null);
          setIsLoading(false);
          message.error('Failed to upload file. Please try again.');
        })
        .finally(() => {
          // Clear the file input to allow re-importing the same file
          if (importAttendance.current) {
            importAttendance.current.value = '';
          }
        });
    }
  }, [file]);

  // Dropdown Menu for Import Buttons
  const importMenu = (
    <Menu
      id="time-attendance-employee-attendance-import-menu"
      data-cy="time-attendance-employee-attendance-import-menu"
    >
      <Menu.Item
        key="1"
        icon={
          <TbFileUpload data-cy="time-attendance-employee-attendance-import-menu-attendance-item-icon" />
        }
        onClick={() => {
          if (importAttendance) {
            importAttendance.current?.click();
          }
        }}
        id="time-attendance-employee-attendance-import-menu-attendance-item"
        data-cy="time-attendance-employee-attendance-import-menu-attendance-item"
      >
        Import Attendance
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<TbFileUpload />}
        onClick={() => setIsShowBreakAttendanceImportSidebar(true)}
        id="time-attendance-employee-attendance-import-menu-break-item"
        data-cy="time-attendance-employee-attendance-import-menu-break-item"
      >
        Break Import
      </Menu.Item>
      <Menu.Item
        key="3"
        icon={<HiOutlineTemplate />}
        id="time-attendance-employee-attendance-import-menu-template-item"
        data-cy="time-attendance-employee-attendance-import-menu-template-item"
      >
        <a
          id="time-attendance-employee-attendance-import-menu-template-item-link"
          data-cy="time-attendance-employee-attendance-import-menu-template-item-link"
          href="/Attendance_Template.xlsx"
          download
        >
          Attendance Template
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <div
        id="time-attendance-employee-attendance-page-container-view"
        data-cy="time-attendance-employee-attendance-page-container-view"
      >
        {/* Header Section */}
        <div
          className="flex justify-between"
          id="time-attendance-employee-attendance-header-section"
          data-cy="time-attendance-employee-attendance-header-section"
        >
          <div
            className="flex flex-col gap-2"
            data-cy="time-attendance-employee-attendance-header-title"
          >
            <h3
              className="text-gray-900 text-xl font-bold mb-0"
              data-cy="time-attendance-employee-attendance-header-title"
              id="time-attendance-employee-attendance-header-title"
            >
              Employee Attendance
            </h3>
            <Breadcrumb
              items={[
                {
                  title: (
                    <span
                      className="text-xs sm:text-sm font-normal"
                      data-cy="time-attendance-employee-attendance-breadcrumb-title-1"
                    >
                      Time and Attendance
                    </span>
                  ),
                },
                {
                  title: (
                    <span
                      className="text-xs sm:text-sm text-[#4d4d4d] font-normal"
                      data-cy="time-attendance-employee-attendance-breadcrumb-title-2"
                    >
                      Employee Attendance
                    </span>
                  ),
                },
              ]}
            />
          </div>

          {/* Action Buttons */}
          <div
            className="flex gap-2 py-4"
            id="time-attendance-employee-attendance-actions-row"
            data-cy="time-attendance-employee-attendance-actions-row"
          >
            {/* Import Button */}
            <PermissionWrapper
              data-cy="time-attendance-employee-attendance-import-permission-wrapper"
              permissions={[Permissions.ImportEmployeeAttendanceInformation]}
            >
              <Dropdown
                overlay={importMenu}
                trigger={['click']}
                data-cy="time-attendance-employee-attendance-import-dropdown"
              >
                <Button
                  icon={
                    <IosShareIcon
                      fontSize="small"
                      data-cy="time-attendance-employee-attendance-import-button-icon"
                      className="text-[#374151] h-10"
                    />
                  }
                  loading={isLoading || isLoadingImport}
                  className={`border  border-[#d9d9d9] text-base font-normal text-[#4d4d4d] ${isSmallScreen ? 'w-10 h-10 p-0 flex items-center justify-center' : ' h-10'}`}
                  id="time-attendance-employee-attendance-import-button"
                  data-cy="time-attendance-employee-attendance-import-button"
                >
                  {!isSmallScreen && 'Import'}
                </Button>
              </Dropdown>
            </PermissionWrapper>

            {/* Export Button */}
            <PermissionWrapper
              permissions={[Permissions.ExportEmployeeAttendanceInformation]}
              data-cy="time-attendance-employee-attendance-export-permission-wrapper"
            >
              <Popover
                trigger="click"
                placement={isSmallScreen ? 'bottomLeft' : 'bottomRight'}
                title={
                  <div
                    id="time-attendance-employee-attendance-export-popover-title"
                    data-cy="time-attendance-employee-attendance-export-popover-title"
                    className="text-base text-gray-900 font-bold"
                  >
                    Export Format
                  </div>
                }
                content={
                  <div
                    id="time-attendance-employee-attendance-export-popover-content"
                    data-cy="time-attendance-employee-attendance-export-popover-content"
                    className="pt-4"
                  >
                    <Row
                      id="time-attendance-employee-attendance-export-popover-content-row"
                      data-cy="time-attendance-employee-attendance-export-popover-content-row"
                      gutter={[8, 8]}
                    >
                      <Col
                        id="time-attendance-employee-attendance-export-popover-content-row-col-1"
                        data-cy="time-attendance-employee-attendance-export-popover-content-row-col-1"
                        span={12}
                      >
                        <Button
                          size="small"
                          className="w-full flex items-center justify-center gap-1"
                          type="primary"
                          icon={
                            <TbLayoutList
                              data-cy="time-attendance-employee-attendance-export-popover-content-row-col-1-icon"
                              size={16}
                            />
                          }
                          onClick={() => onExport('EXCEL')}
                          loading={isExportingData && exportType === 'EXCEL'}
                          disabled={isExportDisabled}
                          id="time-attendance-employee-attendance-export-excel-button"
                          data-cy="time-attendance-employee-attendance-export-excel-button"
                        >
                          Excel
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          size="small"
                          className="w-full flex items-center justify-center gap-1"
                          type="primary"
                          icon={<LuBookmark size={16} />}
                          onClick={() => onExport('PDF')}
                          loading={isExportingData && exportType === 'PDF'}
                          disabled={isExportDisabled}
                          id="time-attendance-employee-attendance-export-pdf-button"
                          data-cy="time-attendance-employee-attendance-export-pdf-button"
                        >
                          PDF
                        </Button>
                      </Col>
                    </Row>
                  </div>
                }
                id="time-attendance-employee-attendance-export-popover"
                data-cy="time-attendance-employee-attendance-export-popover"
              >
                <Button
                  icon={
                    <SaveAltIcon
                      data-cy="time-attendance-employee-attendance-export-button-icon"
                      className="text-white"
                    />
                  }
                  size="large"
                  type="primary"
                  loading={isExportLoading}
                  className={`${isSmallScreen ? 'w-10 h-10 p-0 flex items-center justify-center text-base font-normal text-white' : ' h-10 text-base font-normal text-white'}`}
                  id="time-attendance-employee-attendance-export-button"
                  data-cy="time-attendance-employee-attendance-export-button"
                >
                  {!isSmallScreen && 'Export'}
                </Button>
              </Popover>
            </PermissionWrapper>
          </div>
        </div>
        <Divider />

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
          id="time-attendance-employee-attendance-import-file-input"
          data-cy="time-attendance-employee-attendance-import-file-input"
        />

        {/* Table Section */}
        <div
          id="time-attendance-employee-attendance-table-section"
          data-cy="time-attendance-employee-attendance-table-section"
        >
          <EmployeeAttendanceTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            setBodyRequest={setBodyRequest}
            isImport={isSuccess}
            data-cy="time-attendance-employee-attendance-table"
          />
        </div>
      </div>
      <BreakImportSidebar data-cy="time-attendance-employee-attendance-break-import-side-bar" />
      <AttendanceImportErrorModal data-cy="time-attendance-employee-attendance-import-error-modal" />
    </>
  );
};

export default EmployeeAttendance;
