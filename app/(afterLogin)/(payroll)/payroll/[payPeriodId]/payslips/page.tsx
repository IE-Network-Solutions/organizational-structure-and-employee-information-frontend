'use client';

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  notification,
} from 'antd';
import {
  DownloadOutlined,
  FileSyncOutlined,
  MailOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import EmptyState from '@/components/empty';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import FilterPopover from '../../_components/filters/FilterPopover';
import PayrollDetails from '../../../employee-information/[id]/_components/PayrollDetails';
import {
  useGetActivePayroll,
  useGetActivePayrollsForExport,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import {
  usePublishPayslips,
  useUnpublishPayslips,
  useSendingPayrollPayslip,
} from '@/store/server/features/payroll/payroll/mutation';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { PaySlipData } from '@/store/server/features/payroll/payroll/interface';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';

const { Text } = Typography;

function mergePayrollFilterState(
  prev: { [key: string]: string },
  partial: { [key: string]: string | undefined | null },
): { [key: string]: string } {
  const merged = { ...prev };
  for (const [key, val] of Object.entries(partial)) {
    if (
      val === undefined ||
      val === null ||
      (typeof val === 'string' && val.trim() === '')
    ) {
      delete merged[key];
    } else {
      merged[key] = val;
    }
  }
  return merged;
}

const formatAmount = (value: string | number | undefined | null) =>
  parseFloat(String(value || '0')).toFixed(2);

const InfoItem = ({
  label,
  value,
  tags,
}: {
  label: string;
  value: string | number;
  tags?: { label: string; value: string | number }[];
}) => (
  <div className="mb-3" data-cy="payroll-payslip-info-item">
    <Text className="mb-1 block text-sm text-black/65">{label}</Text>
    <Text className="mb-1 block text-base text-black/65">{value}</Text>
    {tags && tags.length > 0 && (
      <Space wrap size={[8, 8]}>
        {tags.map((tag, index) => (
          <Tag
            key={`${tag.label}-${index}`}
            className="m-0 max-w-[220px] truncate border-0 bg-black/[0.02] text-black/65"
          >
            {tag.label}: {tag.value}
          </Tag>
        ))}
      </Space>
    )}
  </div>
);

const PayrollPeriodPayslipsPage = () => {
  const params = useParams();
  const payPeriodId = String(params?.payPeriodId || '');
  const { isMobile, isTablet } = useIsMobile();
  const { pageSize, currentPage, setCurrentPage, setPageSize } =
    usePayrollStore();
  const { setSearchQuery } = useEmployeeStore();

  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>(
    payPeriodId ? { payPeriodId } : {},
  );
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [payslipPayroll, setPayslipPayroll] = useState<any>(null);
  const [payslipPeriod, setPayslipPeriod] = useState<any>(null);
  const pendingDownloadRef = useRef(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  const searchQuery = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (payPeriodId) queryParams.append('payPeriodId', payPeriodId);
    if (employeeId) queryParams.append('employeeId', employeeId);
    if (searchValue.divisionId)
      queryParams.append('divisionId', searchValue.divisionId);
    if (searchValue.departmentId)
      queryParams.append('departmentId', searchValue.departmentId);
    const qs = queryParams.toString();
    return qs ? `&${qs}` : '';
  }, [
    payPeriodId,
    employeeId,
    searchValue.divisionId,
    searchValue.departmentId,
  ]);

  useEffect(() => {
    setSearchQuery(searchQuery);
  }, [searchQuery, setSearchQuery]);

  const { data: payPeriodData } = useGetPayPeriod();
  const {
    data: payroll,
    isLoading,
    refetch,
  } = useGetActivePayroll(searchQuery, pageSize, currentPage);
  const { data: payrollForExport } = useGetActivePayrollsForExport(searchQuery);
  const { data: allEmployees } = useGetAllUsersData();
  const { mutate: sendPaySlip, isLoading: isSending } =
    useSendingPayrollPayslip();
  const { mutate: publishPayslips, isLoading: isPublishingPayslips } =
    usePublishPayslips();
  const { mutate: unpublishPayslips, isLoading: isUnpublishingPayslips } =
    useUnpublishPayslips();

  const selectedPayPeriod = (payPeriodData || []).find(
    (period: { id: string }) => period.id === payPeriodId,
  );

  const templatePayroll = payslipPayroll;
  const templatePeriod = payslipPeriod ?? selectedPayPeriod;
  const templateEmployee = templatePayroll?.employeeInfo;

  const rows = useMemo(() => {
    return (payroll?.items || []).map((item: any) => {
      const employee =
        item.employeeInfo ||
        (allEmployees?.items || []).find(
          (emp: any) => emp.id === item.employeeId,
        );
      return {
        ...item,
        key: item.id || item.employeeId,
        employeeInfo: employee,
      };
    });
  }, [payroll?.items, allEmployees?.items]);

  const exportRows = useMemo(() => {
    return (payrollForExport?.items || []).map((item: any) => {
      const employee =
        item.employeeInfo ||
        (allEmployees?.items || []).find(
          (emp: any) => emp.id === item.employeeId,
        );
      return {
        ...item,
        employeeInfo: employee,
      };
    });
  }, [payrollForExport?.items, allEmployees?.items]);

  const hasPayslips = rows.length > 0;
  const payslipsPublished = selectedPayPeriod?.payslipsPublished === true;
  const isTogglingAccess = isPublishingPayslips || isUnpublishingPayslips;
  const totalEmployees =
    (searchValue.divisionId
      ? payrollForExport?.divisionUsers?.length
      : allEmployees?.items?.length) ?? 0;

  const employeeOptions = (
    searchValue.divisionId && payroll?.divisionUsers
      ? payroll.divisionUsers
      : allEmployees?.items || []
  ).map((emp: any) => ({
    value: emp.id,
    label:
      `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp?.lastName || ''}`.trim(),
  }));

  const selectedRows = useMemo(() => {
    if (selectedKeys.length === 0) return exportRows.length ? exportRows : rows;
    const source = exportRows.length ? exportRows : rows;
    return source.filter((item: any) =>
      selectedKeys.includes(item.id || item.employeeId),
    );
  }, [selectedKeys, exportRows, rows]);

  const handleFilterSearch = (partial: {
    [key: string]: string | undefined | null;
  }) => {
    const merged = mergePayrollFilterState(searchValue, {
      ...partial,
      payPeriodId,
    });
    setSearchValue(merged);
    setSelectedKeys([]);
    setCurrentPage(1);
  };

  const toggleSelect = (key: React.Key, checked: boolean) => {
    setSelectedKeys((prev) =>
      checked ? [...prev, key] : prev.filter((item) => item !== key),
    );
  };

  const sendingPaySlipHandler = (payrollData: any[]) => {
    const values: PaySlipData[] = payrollData.map((item: any) => ({
      payrollId: item.id,
      payPeriodId: item.payPeriodId || payPeriodId,
      employeeId: item.employeeInfo?.id || item.employeeId,
    }));
    if (values.length) sendPaySlip({ values });
  };

  const handlePublishPayslips = () => {
    if (!hasPayslips) {
      notification.info({
        message: 'Payroll not generated',
        description:
          'Generate payroll on the Payroll tab first, then return here to release payslips to employees.',
      });
      return;
    }
    publishPayslips(payPeriodId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleUnpublishPayslips = () => {
    unpublishPayslips(payPeriodId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const downloadPayslip = (payrollItem?: any, period?: any) => {
    pendingDownloadRef.current = true;
    setPayslipPayroll({
      ...(payrollItem || {}),
      employeeInfo: payrollItem?.employeeInfo || null,
    });
    setPayslipPeriod(period || selectedPayPeriod);
  };

  useLayoutEffect(() => {
    if (!pendingDownloadRef.current || !payslipRef.current) return;
    pendingDownloadRef.current = false;

    const payslipElement = payslipRef.current as HTMLElement;
    html2canvas(payslipElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const totalPages = Math.ceil(imgHeight / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const yPosition = -(i * pageHeight);
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);
      }

      const periodLabel = templatePeriod?.startDate
        ? dayjs(templatePeriod.startDate).format('MMMM-YYYY')
        : '';
      pdf.save(
        `${templatePayroll?.employeeInfo?.firstName || 'Employee'}_${
          templatePayroll?.employeeInfo?.lastName || ''
        }_Payslip_${periodLabel}.pdf`,
      );
    });
  }, [payslipPayroll, payslipPeriod, templatePayroll, templatePeriod]);

  const getBenefitTotal = (breakdown: any) =>
    (breakdown?.merits?.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0,
    ) || 0) + Number(breakdown?.variablePay?.amount || 0);

  const getDeductionTotal = (breakdown: any) =>
    breakdown?.totalDeductionWithPension?.reduce(
      (sum: number, item: any) => sum + Number(item.amount || 0),
      0,
    ) || 0;

  return (
    <div
      className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6"
      data-cy="payroll-period-payslips-page"
    >
      <div
        className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
        data-cy="payroll-period-payslips-toolbar"
      >
        <Select
          showSearch
          allowClear
          className="max-w-xs min-h-[40px] min-w-[240px] sm:min-w-[280px] [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!rounded-lg"
          placeholder="Search Employee"
          value={employeeId}
          onChange={(value) => {
            setEmployeeId(value || undefined);
            setCurrentPage(1);
            setSelectedKeys([]);
          }}
          filterOption={(input, option) => {
            const label = option?.label;
            return (
              typeof label === 'string' &&
              label.toLowerCase().includes(input.toLowerCase())
            );
          }}
          options={employeeOptions}
          suffixIcon={
            <span
              className="flex h-full items-center border-l border-gray-200 pl-3 text-gray-400"
              data-cy="payroll-payslips-search-suffix-icon"
            >
              <SearchOutlined className="text-base" />
            </span>
          }
          data-cy="payroll-payslips-search-employee"
        />

        <div
          className="flex flex-wrap items-center gap-2"
          data-cy="payroll-payslips-toolbar-actions"
        >
          <FilterPopover
            onSearch={handleFilterSearch}
            defaultValues={{ ...searchValue, payPeriodId }}
          />

          <AccessGuard
            permissions={[
              Permissions.GeneratePayroll,
              Permissions.DeletePayroll,
            ]}
          >
            {payslipsPublished ? (
              <Popconfirm
                title="Revoke employee access to payslips for this pay period?"
                okText="Revoke access"
                cancelText="Cancel"
                onConfirm={handleUnpublishPayslips}
              >
                <Button
                  className="flex h-10 items-center gap-2 rounded-[6px] border-gray-200 px-3 font-medium text-gray-600 md:px-4"
                  icon={<FileSyncOutlined />}
                  loading={isTogglingAccess}
                  disabled={!hasPayslips}
                  data-cy="payroll-payslips-revoke-access-button"
                >
                  <span
                    className="hidden sm:inline"
                    data-cy="payroll-payslips-revoke-access-label"
                  >
                    Revoke Payslip Access
                  </span>
                </Button>
              </Popconfirm>
            ) : (
              <Button
                className="flex h-10 items-center gap-2 rounded-[6px] border-gray-200 px-3 font-medium text-gray-600 md:px-4"
                icon={<FileSyncOutlined />}
                loading={isTogglingAccess}
                onClick={handlePublishPayslips}
                data-cy="payroll-payslips-release-access-button"
              >
                <span
                  className="hidden sm:inline"
                  data-cy="payroll-payslips-release-access-label"
                >
                  Release Payslip Access
                </span>
              </Button>
            )}
          </AccessGuard>

          <AccessGuard permissions={[Permissions.SendPayslipEmail]}>
            <Button
              className="flex h-10 items-center gap-2 rounded-[6px] border-gray-200 px-3 font-medium text-gray-600 md:px-4"
              icon={<MailOutlined />}
              disabled={!hasPayslips}
              loading={isSending}
              onClick={() => setEmailModalOpen(true)}
              data-cy="payroll-payslips-email-button"
            >
              <span
                className="hidden sm:inline"
                data-cy="payroll-payslips-email-button-label"
              >
                Email Payslip
              </span>
            </Button>
          </AccessGuard>
        </div>
      </div>

      {isLoading ? (
        <div
          className="py-16 text-center text-gray-500"
          data-cy="payroll-payslips-loading"
        >
          Loading payslips…
        </div>
      ) : !hasPayslips ? (
        <EmptyState
          title="No payslips generated"
          description="Generate payroll on the Payroll tab, then use Release Payslip Access to let employees view their payslips."
          compact
        />
      ) : (
        <>
          <Row gutter={[16, 16]} data-cy="payroll-payslips-card-grid">
            {rows.map((record: any) => {
              const breakdown = record.breakdown || {};
              const key = record.id || record.employeeId;
              const fullName = [
                record.employeeInfo?.firstName,
                record.employeeInfo?.middleName,
                record.employeeInfo?.lastName,
              ]
                .filter(Boolean)
                .join(' ')
                .trim();

              return (
                <Col key={key} xs={24} md={12} xl={8}>
                  <Card
                    bordered
                    className="h-full"
                    style={{
                      borderRadius: 8,
                      border: '1px solid #e0e0e0',
                    }}
                    styles={{
                      header: {
                        borderBottom: 'none',
                        padding: '16px 20px 0 20px',
                      },
                      body: { padding: '0 20px 20px 20px' },
                    }}
                    title={
                      <div
                        className="flex items-start justify-between gap-2"
                        data-cy={`payroll-payslip-card-header-${key}`}
                      >
                        <div
                          className="flex min-w-0 items-start gap-2"
                          data-cy={`payroll-payslip-card-title-${key}`}
                        >
                          <Checkbox
                            checked={selectedKeys.includes(key)}
                            onChange={(e) =>
                              toggleSelect(key, e.target.checked)
                            }
                            data-cy={`payroll-payslip-select-${key}`}
                          />
                          <Text
                            strong
                            className="truncate text-[15px] text-black/65"
                          >
                            {fullName || 'Employee'}
                          </Text>
                        </div>
                        <Button
                          onClick={() =>
                            downloadPayslip(record, selectedPayPeriod)
                          }
                          icon={
                            <DownloadOutlined style={{ fontSize: '16px' }} />
                          }
                          data-cy={`payroll-payslip-download-${key}`}
                          style={{
                            backgroundColor: '#fff',
                            border: '1px solid #d9d9d9',
                            color: '#595959',
                            fontSize: '14px',
                            fontWeight: 400,
                            height: '36px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 12px',
                            boxShadow: 'none',
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    }
                    data-cy={`payroll-payslip-card-${key}`}
                  >
                    <Row gutter={[16, 8]}>
                      <Col span={12}>
                        <InfoItem
                          label="Salary Period"
                          value={
                            selectedPayPeriod?.startDate
                              ? dayjs(selectedPayPeriod.startDate).format(
                                  'MMM-YYYY',
                                )
                              : '—'
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <InfoItem
                          label="Pay Date"
                          value={
                            selectedPayPeriod?.endDate
                              ? dayjs(selectedPayPeriod.endDate).format(
                                  'MMM-DD-YYYY',
                                )
                              : '—'
                          }
                        />
                      </Col>
                    </Row>
                    <Divider className="!my-2" />
                    <InfoItem
                      label="Entitled Allowance"
                      value={formatAmount(record.totalAllowance)}
                      tags={breakdown?.allowances?.map((a: any) => ({
                        label: a.type,
                        value: formatAmount(a.amount),
                      }))}
                    />
                    <Divider className="!my-2" />
                    <InfoItem
                      label="Entitled Benefit"
                      value={formatAmount(getBenefitTotal(breakdown))}
                      tags={[
                        ...(breakdown?.merits?.map((m: any) => ({
                          label: m.type,
                          value: formatAmount(m.amount),
                        })) || []),
                        ...(breakdown?.variablePay
                          ? [
                              {
                                label: breakdown.variablePay.type,
                                value: formatAmount(
                                  breakdown.variablePay.amount,
                                ),
                              },
                            ]
                          : []),
                        ...(breakdown?.incentives
                          ? [
                              {
                                label: breakdown.incentives.type || 'Incentive',
                                value: formatAmount(
                                  breakdown.incentives.amount,
                                ),
                              },
                            ]
                          : []),
                      ]}
                    />
                    <Divider className="!my-2" />
                    <InfoItem
                      label="Entitled Deduction"
                      value={formatAmount(
                        record.totalDeductions || getDeductionTotal(breakdown),
                      )}
                      tags={
                        breakdown?.totalDeductionWithPension?.map((d: any) => ({
                          label: d.type,
                          value: formatAmount(d.amount),
                        })) || []
                      }
                    />
                    <Divider className="!my-2" />
                    <Row gutter={16}>
                      <Col span={12}>
                        <InfoItem
                          label="Gross Earning"
                          value={formatAmount(record.grossSalary)}
                        />
                      </Col>
                      <Col span={12}>
                        <InfoItem
                          label="Net Pay"
                          value={formatAmount(record.netPay)}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <div className="mt-6" data-cy="payroll-payslips-pagination">
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={payroll?.meta?.totalItems || 0}
                pageSize={pageSize}
                currentPage={currentPage}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size) setPageSize(size);
                }}
                onShowSizeChange={(unusedCurrent, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            ) : (
              <CustomPagination
                current={currentPage}
                total={payroll?.meta?.totalItems || 0}
                pageSize={pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size) setPageSize(size);
                }}
                onShowSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </>
      )}

      <Modal
        title="Email Payslips"
        open={emailModalOpen}
        onCancel={() => setEmailModalOpen(false)}
        centered
        width={470}
        footer={[
          <Button key="cancel" onClick={() => setEmailModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            loading={isSending}
            disabled={selectedRows.length === 0}
            onClick={() => {
              sendingPaySlipHandler(selectedRows);
              setEmailModalOpen(false);
            }}
          >
            Send
          </Button>,
        ]}
        data-cy="payroll-payslips-email-modal"
      >
        <p
          className="m-0 max-w-[360px] text-base leading-6 text-gray-600"
          data-cy="payroll-payslips-email-modal-description"
        >
          You are about to send payslips to {selectedRows.length} selected
          employee{selectedRows.length === 1 ? '' : 's'}
          {selectedKeys.length === 0 ? ` (all in current result)` : ''} out of{' '}
          {totalEmployees} total employees.
        </p>
      </Modal>

      {/* Hidden Payslip for PDF generation — same layout as My Payroll */}
      <div
        className="h-0 overflow-hidden"
        data-cy="payroll-payslips-hidden-payslip-wrapper"
      >
        <div
          ref={payslipRef}
          className="p-4"
          style={{
            width: '210mm',
            minWidth: '210mm',
            maxWidth: '210mm',
            backgroundColor: '#ffffff',
          }}
          data-cy="payroll-payslips-payslip-content"
        >
          <header
            className="mb-4 border-b pb-4 text-center"
            data-cy="payroll-payslips-payslip-header"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="payroll-payslips-payslip-title"
            >
              Payslip for the month of{' '}
              <span
                className="text-violet-500"
                data-cy="payroll-payslips-payslip-period"
              >
                {dayjs(templatePeriod?.startDate).format('MMMM-YYYY')}
              </span>
            </h2>
          </header>
          <div
            className="flex justify-between"
            data-cy="payroll-payslips-payslip-summary"
          >
            <div
              className="mx-2 flex flex-col gap-2"
              data-cy="payroll-payslips-payslip-employee-info"
            >
              <div
                className="text-xl font-bold"
                data-cy="payroll-payslips-payslip-summary-heading"
              >
                Employee Pay Summary
              </div>
              <div
                className="flex w-full gap-6"
                data-cy="payroll-payslips-payslip-employee-details"
              >
                <div
                  className="flex flex-col gap-2"
                  data-cy="payroll-payslips-payslip-labels"
                >
                  <Text>Employee name:</Text>
                  <Text>Job title:</Text>
                  <Text>Pay period:</Text>
                  <Text>Pay Date:</Text>
                </div>
                <div
                  className="flex flex-col gap-2 font-bold"
                  data-cy="payroll-payslips-payslip-values"
                >
                  <Text>
                    {[
                      templateEmployee?.firstName,
                      templateEmployee?.middleName,
                      templateEmployee?.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </Text>
                  <Text>
                    {
                      templateEmployee?.employeeJobInformation?.find(
                        (job: any) => job.isPositionActive,
                      )?.position?.name
                    }
                  </Text>
                  <Text>
                    {dayjs(templatePeriod?.startDate).format('MMM-YYYY')}
                  </Text>
                  <Text>
                    {dayjs(
                      templatePeriod?.endDate || templatePeriod?.updatedAt,
                    ).format('MMM-DD-YYYY')}
                  </Text>
                </div>
              </div>
            </div>
            <div
              className="m-2 flex flex-col items-center justify-center"
              data-cy="payroll-payslips-payslip-net-pay"
            >
              <span
                className="text-xl font-bold"
                data-cy="payroll-payslips-payslip-net-pay-label"
              >
                Employee Net Pay
              </span>
              <span
                className="mb-2 text-4xl font-bold text-violet-500"
                data-cy="payroll-payslips-payslip-net-pay-value"
              >
                {templatePayroll?.netPay}
              </span>
              <span
                className="text-xl font-bold"
                data-cy="payroll-payslips-payslip-basic-salary-label"
              >
                Employee Basic Salary
              </span>
              <span
                className="text-2xl font-bold"
                data-cy="payroll-payslips-payslip-basic-salary-value"
              >
                {
                  templatePayroll?.employeeInfo?.basicSalaries?.[0]?.basicSalary
                }{' '}
              </span>
            </div>
          </div>
          <Divider className="my-2" />
          <header
            className="mb-2 border-b pb-2"
            data-cy="payroll-payslips-payslip-earnings-header"
          >
            <h2
              className="text-xl font-semibold"
              data-cy="payroll-payslips-payslip-earnings-title"
            >
              Employee Earnings
            </h2>
          </header>
          <div
            className="flex w-full flex-col gap-4"
            data-cy="payroll-payslips-payslip-earnings"
          >
            <div
              className="my-2 flex items-center justify-between pl-4"
              data-cy="payroll-payslips-payslip-allowance-header"
            >
              <Text className="text-xl">Employee Allowance</Text>
              <Text className="pr-10 text-xl">Amount</Text>
            </div>
            <div
              className="flex justify-between"
              data-cy="payroll-payslips-payslip-allowance-rows"
            >
              <div
                className="flex flex-col gap-2 pl-4"
                data-cy="payroll-payslips-payslip-allowance-types"
              >
                {templatePayroll?.breakdown?.allowances?.map(
                  (item: any, index: number) => (
                    <Text key={index}>{item.type}</Text>
                  ),
                )}
              </div>
              <div
                className="flex flex-col gap-2 pr-10 text-right font-bold"
                data-cy="payroll-payslips-payslip-allowance-amounts"
              >
                {templatePayroll?.breakdown?.allowances?.map(
                  (item: any, index: number) => (
                    <Text key={index}>
                      {parseFloat(item.amount || '0').toFixed(2)}
                    </Text>
                  ),
                )}
              </div>
            </div>
          </div>
          <PayrollDetails activeMergedPayroll={templatePayroll || undefined} />
        </div>
      </div>
    </div>
  );
};

export default PayrollPeriodPayslipsPage;
