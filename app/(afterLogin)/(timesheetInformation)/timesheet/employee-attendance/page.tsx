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
  Tabs,
  message,
} from 'antd';
import { TbFileUpload, TbLayoutList } from 'react-icons/tb';
import EmployeeAttendanceTable from './_components/employeeAttendanceTable';
import {
  UseExportAttendanceData,
  useExportRuleViolationsExcel,
} from '@/store/server/features/timesheet/attendance/queries';
import { useAttendanceImport } from '@/store/server/features/timesheet/attendance/mutation';
import { fileUpload } from '@/utils/fileUpload';
import PermissionWrapper from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import BreakImportSidebar from './_components/breakImportSidebar';
import { HiOutlineTemplate } from 'react-icons/hi';
import { useMediaQuery } from 'react-responsive';
import { useNotificationDeepLink } from '@/hooks/useNotificationDeepLink';

import AttendanceImportErrorModal from './_components/attendanceImportErrorModal';
import { LuBookmark } from 'react-icons/lu';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import IosShareIcon from '@mui/icons-material/IosShare';
import DriveFileMoveOutlinedIcon from '@mui/icons-material/DriveFileMoveOutlined';
import RuleViolationTable from './_components/ruleViolationTable';
import MoveToDeductionModal, {
  DeductionViolation,
} from './_components/ruleViolationTable/moveToDeductionModal';

const EmployeeAttendance = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 768 }); // Detect small screens

  const importAttendance = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState<'EXCEL' | 'PDF' | null>(null);
  const [isExportDisabled, setIsExportDisabled] = useState(false);
  const [file, setFile] = useState<any>();

  const { mutate: exportAttendanceData, isLoading: isExportingData } =
    UseExportAttendanceData();
  const {
    mutate: exportRuleViolationsExcel,
    isLoading: isExportingRuleViolations,
  } = useExportRuleViolationsExcel();

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
    violationFilters,
  } = useEmployeeAttendanceStore();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const { tab: deepLinkTab } = useNotificationDeepLink();

  useEffect(() => {
    if (deepLinkTab === 'violations' || deepLinkTab === '2') {
      setActiveTabKey('2');
    } else if (deepLinkTab === 'attendance' || deepLinkTab === '1') {
      setActiveTabKey('1');
    }
  }, [deepLinkTab]);
  const [isBulkMoveToDeductionModalOpen, setIsBulkMoveToDeductionModalOpen] =
    useState(false);
  const [bulkDeductionViolations, setBulkDeductionViolations] = useState<
    DeductionViolation[]
  >([]);

  const onExportRuleViolations = () => {
    exportRuleViolationsExcel(violationFilters, {
      onSuccess: () => {
        message.success('Download completed successfully!');
      },
      onError: () => {
        message.error('Failed to export. Please try again.');
      },
    });
  };

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
      setExportType(null);
    }
  };

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
      <style data-cy="time-attendance-employee-attendance-page-styles">{`
     .full-bleed-header-divider {
          width: calc(100% + 48px) !important;
          margin-left: -24px !important;
          margin-right: -24px !important;
          min-width: calc(100% + 48px) !important;
        }
        @media (max-width: 768px) {
          .full-bleed-header-divider {
            width: calc(100% + 48px) !important;
            margin-left: -24px !important;
            margin-right: -24px !important;
          }
        }
      `}</style>
      <div
        id="time-attendance-employee-attendance-page-container-view"
        data-cy="time-attendance-employee-attendance-page-container-view"
      >
        {/* Header Section */}
        <div
          className="flex justify-between pt-6"
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
          {activeTabKey === '1' && (
            <div
              className="flex gap-2"
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
                    loading={isExportingData}
                    className={`${isSmallScreen ? 'w-10 h-10 p-0 flex items-center justify-center text-base font-normal text-white' : ' h-10 text-base font-normal text-white'}`}
                    id="time-attendance-employee-attendance-export-button"
                    data-cy="time-attendance-employee-attendance-export-button"
                  >
                    {!isSmallScreen && 'Export'}
                  </Button>
                </Popover>
              </PermissionWrapper>
            </div>
          )}
          {activeTabKey === '2' && (
            <div
              id="time-attendance-rule-violation-actions-row"
              data-cy="time-attendance-rule-violation-actions-row"
            >
              <PermissionWrapper
                permissions={[Permissions.ExportEmployeeAttendanceInformation]}
                data-cy="time-attendance-rule-violation-export-permission-wrapper"
              >
                <Button
                  icon={
                    <SaveAltIcon
                      data-cy="time-attendance-rule-violation-export-button-icon"
                      className="text-white"
                    />
                  }
                  size="large"
                  type="primary"
                  loading={isExportingRuleViolations}
                  onClick={onExportRuleViolations}
                  className={`${isSmallScreen ? 'w-10 h-10 p-0 flex items-center justify-center text-base font-normal text-white' : ' h-10 text-base font-normal text-white'}`}
                  id="time-attendance-rule-violation-export-button"
                  data-cy="time-attendance-rule-violation-export-button"
                >
                  {!isSmallScreen && 'Export'}
                </Button>
              </PermissionWrapper>
            </div>
          )}
        </div>
        <Divider
          className="full-bleed-header-divider"
          style={{ margin: '24px 0 24px 0', borderColor: '#f0f0f0' }}
        />

        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          tabBarExtraContent={
            activeTabKey === '2' && (selectedRowKeys?.length ?? 0) > 0 ? (
              <div
                className="flex items-center gap-4"
                data-cy="time-attendance-rule-violation-tabbar-bulk-actions-container"
              >
                <Button
                  type="link"
                  onClick={() => setSelectedRowKeys([])}
                  className="h-8 px-0 text-sm font-normal !text-[#1677FF]"
                  data-cy="time-attendance-rule-violation-tabbar-bulk-clear-selection-button"
                >
                  Clear Selection
                </Button>
                <Button
                  type="link"
                  className="h-8 px-0 text-sm font-normal !text-[#1677FF]"
                  icon={<DriveFileMoveOutlinedIcon fontSize="small" />}
                  onClick={() => setIsBulkMoveToDeductionModalOpen(true)}
                  data-cy="time-attendance-rule-violation-tabbar-bulk-move-to-deduction-button"
                >
                  Move to Deduction
                </Button>
              </div>
            ) : null
          }
          items={[
            {
              key: '1',
              label: (
                <span
                  data-cy="time-attendance-attendance-tab-label"
                  className={`${
                    activeTabKey === '1'
                      ? 'font-bold text-base'
                      : 'font-normal text-base'
                  }`}
                >
                  Attendance
                </span>
              ),
              children: (
                <EmployeeAttendanceTable
                  selectedRowKeys={selectedRowKeys}
                  setSelectedRowKeys={setSelectedRowKeys}
                  isImport={isSuccess}
                  data-cy="time-attendance-employee-attendance-table"
                />
              ),
            },
            {
              key: '2',
              label: (
                <span
                  data-cy="time-attendance-rule-violation-tab-label"
                  className={`${
                    activeTabKey === '2'
                      ? 'font-bold text-base'
                      : 'font-normal text-base'
                  }`}
                >
                  Rule Violation
                </span>
              ),
              children: (
                <RuleViolationTable
                  selectedRowKeys={selectedRowKeys}
                  setSelectedRowKeys={setSelectedRowKeys}
                  isImport={isSuccess}
                  onSelectedViolationsChange={setBulkDeductionViolations}
                  data-cy="time-attendance-rule-violation-table"
                />
              ),
            },
          ]}
        />
        <MoveToDeductionModal
          open={isBulkMoveToDeductionModalOpen}
          violations={bulkDeductionViolations}
          onClose={() => setIsBulkMoveToDeductionModalOpen(false)}
          onSuccess={() => {
            setIsBulkMoveToDeductionModalOpen(false);
            setSelectedRowKeys([]);
            setBulkDeductionViolations([]);
          }}
        />

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
      </div>
      <BreakImportSidebar data-cy="time-attendance-employee-attendance-break-import-side-bar" />
      <AttendanceImportErrorModal data-cy="time-attendance-employee-attendance-import-error-modal" />
    </>
  );
};

export default EmployeeAttendance;
