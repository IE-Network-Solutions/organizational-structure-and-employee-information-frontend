'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Row,
  Select,
  Typography,
} from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import * as ExcelJS from 'exceljs';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import EmptyState from '@/components/empty';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import { usePayrollPayslipStore } from '@/store/uistate/features/payroll/payslips';
import { usePayrollActivityLogStore } from '@/store/uistate/features/payroll/activityLog';
import FilterPopover from '../filters/FilterPopover';
import { PAYROLL_SELECT_CLASS } from '../selectClass';
import PayslipInfoItem from '../../../_components/payslipInfoItem';

const { Text } = Typography;

const getActiveJob = (item: any) => {
  const jobs =
    item?.employeeInfo?.employeeJobInformation ||
    item?.employeeJobInformation ||
    [];
  return jobs.find((job: any) => job?.isPositionActive) || jobs[0];
};

const getEmployeeDepartmentId = (item: any) => {
  const job = getActiveJob(item);
  return (
    job?.departmentId ||
    job?.department?.id ||
    item?.employeeInfo?.departmentId ||
    item?.departmentId
  );
};

const getEmployeeDivisionId = (item: any) => {
  const job = getActiveJob(item);
  const department = job?.department;
  if (department?.level === 1) return department.id;
  return (
    department?.parentId ||
    department?.parent?.id ||
    job?.divisionId ||
    item?.employeeInfo?.divisionId ||
    item?.divisionId
  );
};

const getPayrollRecordId = (item: any) => item?.id || item?.employeeId;

const getEmployeeName = (item: any) =>
  `${item?.employeeInfo?.firstName || ''} ${item?.employeeInfo?.middleName || ''} ${item?.employeeInfo?.lastName || ''}`.trim() ||
  'Employee';

const toAmount = (value: unknown) => parseFloat(String(value || '0')).toFixed(2);

const getBenefitTotal = (breakdown: any) =>
  (breakdown?.merits?.reduce(
    (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
    0,
  ) || 0) +
  (breakdown?.variablePay
    ? parseFloat(breakdown.variablePay.amount || '0')
    : 0);

const getDeductionTotal = (breakdown: any) =>
  breakdown?.totalDeductionWithPension?.reduce(
    (acc: number, item: any) => acc + parseFloat(item.amount || '0'),
    0,
  ) || 0;

const downloadPayslipCard = async (element: HTMLElement, fileName: string) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });
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
    pdf.addImage(imgData, 'PNG', 0, -(i * pageHeight), imgWidth, imgHeight);
  }

  pdf.save(fileName);
};

interface PayslipsTabProps {
  payPeriodId: string;
  payPeriod?: PayPeriod;
  payrollItems?: any[];
  loading?: boolean;
  employeeOptions: { value: string; label: string }[];
  onEmailPayslips?: () => void;
}

const PayslipsTab = ({
  payPeriodId,
  payPeriod,
  payrollItems = [],
  loading,
  employeeOptions,
  onEmailPayslips,
}: PayslipsTabProps) => {
  const { isMobile, isTablet } = useIsMobile();
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [orgFilters, setOrgFilters] = useState<{
    divisionId?: string;
    departmentId?: string;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const generatedByPeriod = usePayrollPayslipStore(
    (state) => state.generatedByPeriod,
  );
  const ensureSeeded = usePayrollPayslipStore((state) => state.ensureSeeded);
  const addActivityLog = usePayrollActivityLogStore((state) => state.addLog);

  const payrollIds = useMemo(
    () => payrollItems.map(getPayrollRecordId).filter(Boolean),
    [payrollItems],
  );

  useEffect(() => {
    ensureSeeded(payPeriodId, payrollIds);
  }, [ensureSeeded, payPeriodId, payrollIds]);

  const generated = generatedByPeriod[payPeriodId];
  const generatedIdSet = useMemo(
    () => new Set(generated?.payrollIds ?? []),
    [generated],
  );

  const generatedPayslips = useMemo(() => {
    if (!generated) return [];
    return payrollItems.filter((item) =>
      generatedIdSet.has(getPayrollRecordId(item)),
    );
  }, [generated, generatedIdSet, payrollItems]);

  const filteredPayslips = useMemo(() => {
    return generatedPayslips.filter((item) => {
      if (
        employeeId &&
        item.employeeId !== employeeId &&
        item.employeeInfo?.id !== employeeId
      ) {
        return false;
      }
      if (
        orgFilters.departmentId &&
        getEmployeeDepartmentId(item) !== orgFilters.departmentId
      ) {
        return false;
      }
      if (orgFilters.divisionId) {
        const departmentId = getEmployeeDepartmentId(item);
        const divisionId = getEmployeeDivisionId(item);
        if (
          departmentId !== orgFilters.divisionId &&
          divisionId !== orgFilters.divisionId
        ) {
          return false;
        }
      }
      return true;
    });
  }, [employeeId, generatedPayslips, orgFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [employeeId, orgFilters, payPeriodId]);

  const pagedPayslips = filteredPayslips.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const salaryPeriod = payPeriod
    ? dayjs(payPeriod.startDate).format('MMM-YYYY')
    : '--';
  const payDate = payPeriod
    ? dayjs(payPeriod.updatedAt || payPeriod.endDate).format('MMM-DD-YYYY')
    : '--';

  const handleDownload = async (item: any) => {
    const recordId = getPayrollRecordId(item);
    const card = document.getElementById(
      `payroll-payslips-card-${recordId}`,
    ) as HTMLElement | null;
    if (!card) return;
    setDownloadingId(recordId);
    try {
      const firstName = item?.employeeInfo?.firstName || 'Employee';
      const lastName = item?.employeeInfo?.lastName || '';
      await downloadPayslipCard(
        card,
        `${firstName}_${lastName}_Payslip_.pdf`.replace(/\s+/g, '_'),
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExport = async () => {
    if (!filteredPayslips.length) return;
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Payslips');
      sheet.columns = [
        { header: 'Employee', key: 'employee', width: 28 },
        { header: 'Salary Period', key: 'salaryPeriod', width: 16 },
        { header: 'Pay Date', key: 'payDate', width: 16 },
        { header: 'Allowance', key: 'allowance', width: 14 },
        { header: 'Benefit', key: 'benefit', width: 14 },
        { header: 'Deduction', key: 'deduction', width: 14 },
        { header: 'Gross Earning', key: 'gross', width: 16 },
        { header: 'Net Pay', key: 'net', width: 14 },
      ];
      filteredPayslips.forEach((item) => {
        sheet.addRow({
          employee: getEmployeeName(item),
          salaryPeriod,
          payDate,
          allowance: toAmount(item.totalAllowance),
          benefit: getBenefitTotal(item.breakdown).toFixed(2),
          deduction: getDeductionTotal(item.breakdown).toFixed(2),
          gross: toAmount(item.grossSalary),
          net: toAmount(item.netPay),
        });
      });
      sheet.getRow(1).font = { bold: true };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Payroll-Payslips.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);

      addActivityLog(payPeriodId, {
        action: 'Exported',
        remarks: 'Payslips exported for this pay period.',
      });
      NotificationMessage.success({
        message: 'Export completed',
        description: 'Payslips have been exported successfully.',
      });
    } catch {
      NotificationMessage.error({
        message: 'Export Failed',
        description: 'Unable to export payslips.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasGeneratedPayslips = generatedPayslips.length > 0;

  return (
    <div
      id="payroll-payslips-tab-view-container"
      data-cy="payroll-payslips-tab-view-container"
      className="w-full"
    >
      <div
        data-cy="payroll-payslips-tab-toolbar"
        className="mb-8 flex flex-wrap items-center justify-between gap-2"
      >
        <Select
          id="payroll-payslips-search-employee-interact-select"
          data-cy="payroll-payslips-search-employee-interact-select"
          showSearch
          allowClear
          placeholder="Search Employee"
          value={employeeId}
          onChange={(value) => setEmployeeId(value || undefined)}
          options={employeeOptions}
          filterOption={(input, option) => {
            const label = option?.label;
            return (
              typeof label === 'string' &&
              label.toLowerCase().includes(input.toLowerCase())
            );
          }}
          className={PAYROLL_SELECT_CLASS}
          suffixIcon={
            <SearchOutlined
              className="text-base text-gray-400"
              data-cy="payroll-payslips-search-employee-suffix"
            />
          }
        />
        <div
          data-cy="payroll-payslips-tab-toolbar-actions"
          className="flex items-center gap-2"
        >
          <FilterPopover
            onSearch={(filters) => {
              setOrgFilters({
                divisionId: filters.divisionId || undefined,
                departmentId: filters.departmentId || undefined,
              });
            }}
            defaultValues={orgFilters}
            selectedPayPeriodId={payPeriodId}
            autoSearch={false}
            hiddenFields={[
              'yearId',
              'sessionId',
              'monthId',
              'payPeriodId',
            ]}
          />
          <Button
            type="default"
            size="large"
            className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
            icon={<MailOutlineIcon className="text-gray-600" fontSize="small" />}
            disabled={!hasGeneratedPayslips}
            onClick={onEmailPayslips}
            data-cy="payroll-payslips-tab-email-click-button"
          >
            <span
              data-cy="payroll-payslips-tab-email-label"
              className="hidden sm:inline"
            >
              Email Payslip
            </span>
          </Button>
          <Button
            type="default"
            size="large"
            className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
            icon={<SaveAltIcon className="text-gray-600" fontSize="small" />}
            loading={isExporting}
            disabled={!hasGeneratedPayslips}
            onClick={handleExport}
            data-cy="payroll-payslips-tab-export-click-button"
          >
            <span
              data-cy="payroll-payslips-tab-export-label"
              className="hidden sm:inline"
            >
              Export
            </span>
          </Button>
        </div>
      </div>

      {loading && !hasGeneratedPayslips ? (
        <EmptyState
          compact
          description="Loading payslips..."
          data-cy="payroll-payslips-loading"
        />
      ) : !hasGeneratedPayslips ? (
        <EmptyState
          compact
          title="No payslips generated"
          description="Generate payslips to view them for every employee in this pay period."
          data-cy="payroll-payslips-empty"
        />
      ) : (
        <>
          <Row
            gutter={[
              { xs: 16, sm: 24, md: 32, lg: 24 },
              { xs: 16, sm: 24, md: 32, lg: 24 },
            ]}
            data-cy="payroll-payslips-cards-row"
          >
            {pagedPayslips.map((item: any) => {
              const recordId = getPayrollRecordId(item);
              const breakdown = item.breakdown;
              const entitledBenefitTotal = getBenefitTotal(breakdown);
              const entitledDeductionTotal = getDeductionTotal(breakdown);

              return (
                <Col
                  xs={24}
                  md={12}
                  lg={8}
                  key={recordId}
                  data-cy={`payroll-payslips-card-column-${recordId}`}
                >
                  <Card
                    id={`payroll-payslips-card-${recordId}`}
                    data-cy={`payroll-payslips-card-${recordId}`}
                    title={
                      <Row justify="space-between" align="middle">
                        <Text
                          strong
                          style={{
                            fontSize: '15px',
                            color: 'rgba(0, 0, 0, 0.65)',
                            fontWeight: 600,
                          }}
                          data-cy={`payroll-payslips-card-title-${recordId}`}
                        >
                          {getEmployeeName(item)}
                        </Text>
                        <Button
                          onClick={() => handleDownload(item)}
                          loading={downloadingId === recordId}
                          icon={
                            <DownloadOutlined style={{ fontSize: '18px' }} />
                          }
                          style={{
                            backgroundColor: '#fff',
                            border: '1px solid #d9d9d9',
                            color: '#595959',
                            fontSize: '16px',
                            fontWeight: 400,
                            height: '42px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 16px',
                            boxShadow: 'none',
                          }}
                          data-html2canvas-ignore="true"
                          data-cy={`payroll-payslips-download-${recordId}`}
                        >
                          Download
                        </Button>
                      </Row>
                    }
                    bordered
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                    }}
                    headStyle={{
                      borderBottom: 'none',
                      padding: '16px 20px 0 20px',
                    }}
                    bodyStyle={{ padding: '16px 20px' }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <PayslipInfoItem label="Salary Period" value={salaryPeriod} />
                      </Col>
                      <Col span={12}>
                        <PayslipInfoItem label="Pay Date" value={payDate} />
                      </Col>
                    </Row>
                    <Divider
                      style={{ margin: '12px 0', borderColor: '#e0e0e0' }}
                    />
                    <PayslipInfoItem
                      label="Entitled Allowance"
                      value={toAmount(item.totalAllowance)}
                      large
                      tags={breakdown?.allowances?.map((allowance: any) => ({
                        label: allowance.type,
                        value: toAmount(allowance.amount),
                      }))}
                    />
                    <Divider
                      style={{ margin: '12px 0', borderColor: '#e0e0e0' }}
                    />
                    <PayslipInfoItem
                      label="Entitled Benefit"
                      value={entitledBenefitTotal.toFixed(2)}
                      large
                      tags={[
                        ...(breakdown?.merits?.map((merit: any) => ({
                          label: merit.type,
                          value: toAmount(merit.amount),
                        })) || []),
                        ...(breakdown?.variablePay
                          ? [
                              {
                                label: breakdown.variablePay.type,
                                value: toAmount(breakdown.variablePay.amount),
                              },
                            ]
                          : []),
                      ]}
                    />
                    <Divider
                      style={{ margin: '12px 0', borderColor: '#e0e0e0' }}
                    />
                    <PayslipInfoItem
                      label="Entitled Deduction"
                      value={entitledDeductionTotal.toFixed(2)}
                      large
                      tags={
                        breakdown?.totalDeductionWithPension?.map(
                          (deduction: any) => ({
                            label: deduction.type,
                            value: toAmount(deduction.amount),
                          }),
                        ) || []
                      }
                    />
                    <Divider
                      style={{ margin: '8px 0', borderColor: '#e0e0e0' }}
                    />
                    <Row gutter={16}>
                      <Col span={12}>
                        <PayslipInfoItem
                          label="Gross Earning"
                          value={toAmount(item.grossSalary)}
                        />
                      </Col>
                      <Col span={12}>
                        <PayslipInfoItem
                          label="Net Pay"
                          value={toAmount(item.netPay)}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
          {filteredPayslips.length > 0 && (
            <div
              data-cy="payroll-payslips-pagination-footer"
              className="bg-white px-0 mt-8"
            >
              {isMobile || isTablet ? (
                <CustomMobilePagination
                  data-cy="payroll-payslips-mobile-pagination"
                  totalResults={filteredPayslips.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    if (size) setPageSize(size);
                  }}
                  onShowSizeChange={(_current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              ) : (
                <CustomPagination
                  data-cy="payroll-payslips-desktop-pagination"
                  current={currentPage}
                  total={filteredPayslips.length}
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
          )}
          {hasGeneratedPayslips && filteredPayslips.length === 0 && (
            <div className="py-8" data-cy="payroll-payslips-filter-empty">
              <EmptyState
                compact
                description="No payslips match the selected filters."
                data-cy="payroll-payslips-filter-empty-state"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayslipsTab;
