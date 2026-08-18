import React, { useEffect, useState, useRef } from 'react';
import {
  Form,
  Select,
  Button,
  Row,
  Col,
  ConfigProvider,
  Popover,
  Modal,
} from 'antd';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetLevel1Departments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MOCK_PAY_PERIODS } from '../payPeriodSelect/mockPayPeriods';

const { Option } = Select;

interface FilterValues {
  [key: string]: string | undefined;
  yearId?: string;
  sessionId?: string;
  divisionId?: string;
  departmentId?: string;
  payPeriodId?: string;
  monthId?: string;
}

interface FilterPopoverProps {
  onSearch: (filters: { [key: string]: string | undefined | null }) => void;
  defaultValues?: FilterValues;
  /** Pay period already chosen on the landing screen; used as the locked default. */
  selectedPayPeriodId?: string;
  /**
   * When false, do not auto-apply the active fiscal month / OPEN pay period.
   * Payroll now requires an explicit pay-period choice before loading data.
   */
  autoSearch?: boolean;
  hiddenFields?: Array<
    | 'yearId'
    | 'sessionId'
    | 'monthId'
    | 'divisionId'
    | 'departmentId'
    | 'payPeriodId'
  >;
  fiscalYearsOverride?: Array<{
    id: string;
    name: string;
    sessions?: any[];
  }>;
}

const CustomLabel = ({ title }: { title: string }) => (
  <span
    className="text-[13px] font-normal text-gray-800"
    data-cy="payroll-filter-popover-custom-label"
  >
    {title}
  </span>
);

const FilterPopover: React.FC<FilterPopoverProps> = ({
  onSearch,
  defaultValues,
  selectedPayPeriodId,
  autoSearch = true,
  hiddenFields = [],
  fiscalYearsOverride,
}) => {
  const isFieldHidden = (field: (typeof hiddenFields)[number]) =>
    hiddenFields.includes(field);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FilterValues>();
  const { isMobile, isTablet } = useIsMobile();

  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: departmentData } = useGetDepartments();
  const { data: level1Departments } = useGetLevel1Departments();

  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);

  const { setMonthId, setYearId, setSessionId } = useTnaReviewStore();
  const initialSearchTriggered = useRef(false);

  useEffect(() => {
    const yearItems = fiscalYearsOverride?.length
      ? fiscalYearsOverride
      : getAllFiscalYears?.items;
    if (!yearItems) return;

    setFiscalYears(yearItems);

    const activeYear =
      yearItems.find(
        (year: any) => year.id === (defaultValues?.yearId || ''),
      ) || yearItems.find((year: any) => year.active);

    if (autoSearch && activeYear && sessions.length === 0) {
      const activeSession =
        activeYear.sessions?.find(
          (s: any) => s.id === (defaultValues?.sessionId || ''),
        ) || activeYear.sessions?.find((s: any) => s.active);
      setSessions(activeYear.sessions || []);
      setMonths(activeSession?.months || []);
    }

    if (!autoSearch) return;

    if (
      !form.getFieldValue('yearId') ||
      !form.getFieldValue('sessionId') ||
      !form.getFieldValue('monthId')
    ) {
      const selectedYear = activeYear;

      if (selectedYear) {
        const selectedSession =
          selectedYear.sessions?.find(
            (s: any) => s.id === (defaultValues?.sessionId || ''),
          ) || selectedYear.sessions?.find((s: any) => s.active);

        const selectedMonth =
          selectedSession?.months?.find(
            (m: any) => m.id === (defaultValues?.monthId || ''),
          ) || selectedSession?.months?.find((m: any) => m.active);

        setSessions(selectedYear.sessions || []);
        setMonths(selectedSession?.months || []);

        form.setFieldsValue({
          yearId: selectedYear.id || '',
          sessionId: selectedSession?.id || '',
          monthId: selectedMonth?.id || '',
        });

        if (!initialSearchTriggered.current) {
          const formValues = form.getFieldsValue();
          const sanitizedValues = Object.fromEntries(
            Object.entries(formValues).filter(
              ([, value]) => typeof value === 'string' && value.trim() !== '',
            ),
          ) as { [key: string]: string };
          onSearch(sanitizedValues);
          initialSearchTriggered.current = true;
        }
      }
    }
  }, [getAllFiscalYears, autoSearch, fiscalYearsOverride]);

  useEffect(() => {
    if (selectedPayPeriodId) {
      form.setFieldsValue({ payPeriodId: selectedPayPeriodId });
      return;
    }

    if (!autoSearch) return;

    if (
      payPeriodData &&
      payPeriodData.length > 0 &&
      !form.getFieldValue('payPeriodId')
    ) {
      const activePeriod =
        payPeriodData.find((p: any) => p.status === 'OPEN') || payPeriodData[0];
      if (activePeriod) {
        form.setFieldsValue({ payPeriodId: activePeriod.id });
        const formValues = form.getFieldsValue();
        const sanitizedValues = Object.fromEntries(
          Object.entries(formValues).filter(
            ([, value]) => typeof value === 'string' && value.trim() !== '',
          ),
        ) as { [key: string]: string };
        onSearch(sanitizedValues);
      }
    }
  }, [payPeriodData, selectedPayPeriodId, autoSearch]);

  const handleYearChange = (value: string) => {
    const selectedYear = fiscalYears.find((year) => year.id === value);
    setSessions(selectedYear?.sessions || []);
    setMonths([]);
    form.setFieldsValue({ sessionId: undefined, monthId: undefined });
  };

  const handleSessionChange = (value: string) => {
    const selectedSession = sessions.find((s: any) => s.id === value);
    setMonths(selectedSession?.months || []);
    form.setFieldsValue({ monthId: undefined });
  };

  const onFinish = (values: FilterValues) => {
    setMonthId(values.monthId || '');
    setYearId(values.yearId || '');
    setSessionId(values.sessionId || '');

    const sanitizedValues = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => typeof value === 'string' && value.trim() !== '',
      ),
    ) as { [key: string]: string };

    onSearch(sanitizedValues);
    setOpen(false);
  };

  const getDefaultActivePayPeriodId = (): string | undefined => {
    if (selectedPayPeriodId) return selectedPayPeriodId;
    if (!payPeriodData?.length) return undefined;
    const openPeriod = payPeriodData.find((p: any) => p.status === 'OPEN');
    return (openPeriod || payPeriodData[0])?.id;
  };

  const onReset = () => {
    const defaultPayPeriodId = getDefaultActivePayPeriodId();

    if (!autoSearch) {
      form.resetFields();
      form.setFieldsValue({ payPeriodId: defaultPayPeriodId });
      setSessions([]);
      setMonths([]);
      setMonthId('');
      setYearId('');
      setSessionId('');
      onSearch({
        yearId: undefined,
        sessionId: undefined,
        monthId: undefined,
        divisionId: undefined,
        departmentId: undefined,
        payPeriodId: defaultPayPeriodId,
      });
      return;
    }

    const fiscalItems = getAllFiscalYears?.items || [];
    const selectedYear =
      fiscalItems.find(
        (year: any) => year.id === (defaultValues?.yearId || ''),
      ) ||
      fiscalItems.find((year: any) => year.active) ||
      fiscalItems[0];

    if (!selectedYear) {
      form.resetFields();
      onSearch({
        divisionId: undefined,
        departmentId: undefined,
        payPeriodId: defaultPayPeriodId,
        monthId: undefined,
      });
      return;
    }

    const selectedSession =
      selectedYear.sessions?.find(
        (s: any) => s.id === (defaultValues?.sessionId || ''),
      ) ||
      selectedYear.sessions?.find((s: any) => s.active) ||
      selectedYear.sessions?.[0];

    const selectedMonth =
      selectedSession?.months?.find(
        (m: any) => m.id === (defaultValues?.monthId || ''),
      ) ||
      selectedSession?.months?.find((m: any) => m.active) ||
      selectedSession?.months?.[0];

    setSessions(selectedYear.sessions || []);
    setMonths(selectedSession?.months || []);

    const nextValues: FilterValues = {
      yearId: selectedYear.id || '',
      sessionId: selectedSession?.id || '',
      monthId: selectedMonth?.id || '',
      payPeriodId: defaultPayPeriodId,
      divisionId: undefined,
      departmentId: undefined,
    };

    form.setFieldsValue(nextValues);

    setMonthId(nextValues.monthId || '');
    setYearId(nextValues.yearId || '');
    setSessionId(nextValues.sessionId || '');

    onSearch({
      yearId: nextValues.yearId || undefined,
      sessionId: nextValues.sessionId || undefined,
      monthId: nextValues.monthId || undefined,
      payPeriodId: defaultPayPeriodId,
      divisionId: undefined,
      departmentId: undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.setFieldsValue({
        yearId: defaultValues?.yearId,
        sessionId: defaultValues?.sessionId,
        monthId: defaultValues?.monthId,
        divisionId: defaultValues?.divisionId,
        departmentId: defaultValues?.departmentId,
        payPeriodId: defaultValues?.payPeriodId || selectedPayPeriodId,
      });
      const selectedYear = fiscalYears.find(
        (year) => year.id === defaultValues?.yearId,
      );
      setSessions(selectedYear?.sessions || []);
      const selectedSession = selectedYear?.sessions?.find(
        (session: any) => session.id === defaultValues?.sessionId,
      );
      setMonths(selectedSession?.months || []);
    }
    setOpen(newOpen);
  };

  const content = (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'inherit',
          borderRadius: 6,
          controlHeightLG: 40,
        },
        components: {
          Form: {
            itemMarginBottom: 20,
          },
        },
      }}
      data-cy="payroll-filter-popover-content"
    >
      <div
        className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-[500px] min-w-0 sm:min-w-[320px] md:min-w-[450px] relative max-h-[calc(100vh-160px)] overflow-auto"
        data-cy="payroll-filter-popover-content"
      >
        {/* Close Icon */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(false)}
          data-cy="payroll-filter-popover-close-btn"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header Section */}
        <div className="mb-6" data-cy="payroll-filter-popover-header">
          <h2
            className="text-[16px] font-normal text-gray-900 m-0 leading-tight"
            data-cy="payroll-filter-popover-header-title"
          >
            Filter
          </h2>
          <p
            className="text-[13px] text-gray-400 m-0 mt-1"
            data-cy="payroll-filter-popover-header-subtitle"
          >
            Select All filters that apply
          </p>
        </div>

        {/* Filter Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          data-cy="payroll-filter-popover-form"
        >
          {(!isFieldHidden('yearId') || !isFieldHidden('sessionId')) && (
            <Row gutter={[16, 16]} data-cy="payroll-filter-popover-form-row">
              {!isFieldHidden('yearId') && (
                <Col xs={12} sm={12} data-cy="payroll-filter-popover-form-col">
                  <Form.Item
                    name="yearId"
                    label={<CustomLabel title="Year" />}
                    rules={
                      autoSearch
                        ? [{ required: true, message: 'Required' }]
                        : undefined
                    }
                    data-cy="payroll-filter-popover-year"
                  >
                    <Select
                      size="large"
                      placeholder="Select Year"
                      onChange={handleYearChange}
                      allowClear
                      data-cy="payroll-filter-popover-year-select"
                    >
                      {fiscalYears.map((year) => (
                        <Option
                          key={year.id}
                          value={year.id}
                          data-cy="payroll-filter-popover-year-option"
                        >
                          {year.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {!isFieldHidden('sessionId') && (
                <Col
                  xs={12}
                  sm={12}
                  data-cy="payroll-filter-popover-session-col"
                >
                  <Form.Item
                    name="sessionId"
                    label={<CustomLabel title="Session" />}
                    rules={
                      autoSearch
                        ? [{ required: true, message: 'Required' }]
                        : undefined
                    }
                    data-cy="payroll-filter-popover-session"
                  >
                    <Select
                      size="large"
                      placeholder="Select Session"
                      onChange={handleSessionChange}
                      allowClear
                      disabled={!form.getFieldValue('yearId')}
                      data-cy="payroll-filter-popover-session-select"
                    >
                      {sessions.map((session) => (
                        <Option
                          key={session.id}
                          value={session.id}
                          data-cy="payroll-filter-popover-session-option"
                        >
                          {session.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>
          )}

          {(!isFieldHidden('divisionId') || !isFieldHidden('departmentId')) && (
            <Row gutter={[16, 16]}>
              {!isFieldHidden('divisionId') && (
                <Col
                  xs={12}
                  sm={12}
                  data-cy="payroll-filter-popover-division-col"
                >
                  <Form.Item
                    name="divisionId"
                    label={<CustomLabel title="Division" />}
                    data-cy="payroll-filter-popover-division"
                  >
                    <Select
                      size="large"
                      placeholder="Select Division"
                      allowClear
                      data-cy="payroll-filter-popover-division-select"
                    >
                      {level1Departments?.map((division: any) => (
                        <Option
                          key={division.id}
                          value={division.id}
                          data-cy="payroll-filter-popover-division-option"
                        >
                          {division?.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {!isFieldHidden('departmentId') && (
                <Col
                  xs={12}
                  sm={12}
                  data-cy="payroll-filter-popover-department-col"
                >
                  <Form.Item
                    name="departmentId"
                    label={<CustomLabel title="Department" />}
                    data-cy="payroll-filter-popover-department"
                  >
                    <Select
                      size="large"
                      placeholder="Select Department"
                      allowClear
                      data-cy="payroll-filter-popover-department-select"
                    >
                      {departmentData?.map((department: any) => (
                        <Option
                          key={department.id}
                          value={department.id}
                          data-cy="payroll-filter-popover-department-option"
                        >
                          {department?.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>
          )}

          {(!isFieldHidden('payPeriodId') || !isFieldHidden('monthId')) && (
            <Row gutter={[16, 16]}>
              {!isFieldHidden('payPeriodId') && (
                <Col
                  xs={12}
                  sm={12}
                  data-cy="payroll-filter-popover-pay-period-col"
                >
                  <Form.Item
                    name="payPeriodId"
                    label={<CustomLabel title="Pay Period" />}
                    data-cy="payroll-filter-popover-pay-period"
                  >
                    <Select
                      size="large"
                      placeholder="Select Pay Period"
                      allowClear={!selectedPayPeriodId}
                      data-cy="payroll-filter-popover-pay-period-select"
                    >
                      {MOCK_PAY_PERIODS.map((period) => (
                        <Option
                          key={period.id}
                          value={period.id}
                          data-cy="payroll-filter-popover-pay-period-option"
                        >
                          {dayjs(period.startDate).format('MMM DD, YYYY')} --{' '}
                          {dayjs(period.endDate).format('MMM DD, YYYY')}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {!isFieldHidden('monthId') && (
                <Col xs={12} sm={12} data-cy="payroll-filter-popover-month-col">
                  <Form.Item
                    name="monthId"
                    label={<CustomLabel title="Month" />}
                    rules={
                      autoSearch
                        ? [{ required: true, message: 'Required' }]
                        : undefined
                    }
                    data-cy="payroll-filter-popover-month"
                  >
                    <Select
                      size="large"
                      placeholder="Select Month"
                      allowClear
                      disabled={!form.getFieldValue('sessionId')}
                      data-cy="payroll-filter-popover-month-select"
                    >
                      {months.map((month) => (
                        <Option
                          key={month.id}
                          value={month.id}
                          data-cy="payroll-filter-popover-month-option"
                        >
                          {month.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>
          )}

          {/* Footer Buttons */}
          <div
            className="flex justify-end items-center gap-3 mt-4 pt-2 border-t border-gray-100"
            data-cy="payroll-filter-popover-footer"
          >
            <Button
              type="default"
              htmlType="button"
              size="large"
              onClick={onReset}
              className="!h-9 px-4 w-[120px] sm:w-auto sm:!h-10 sm:px-6 !font-normal !text-[#4D4D4D] border border-solid !border-[#D9D9D9]"
              data-cy="payroll-filter-popover-reset-btn"
            >
              Reset
            </Button>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              className="bg-[#254ec2] hover:bg-[#1e3e9a] border-none !h-9 px-4 w-[120px] sm:w-auto sm:!h-10 sm:px-6 !font-normal shadow-none"
              data-cy="payroll-filter-popover-save-btn"
            >
              Save Filter
            </Button>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );

  // Mobile/tablet: use a centered modal so the filter can't be clipped.
  if (isMobile || isTablet) {
    return (
      <>
        <Button
          id="payroll-open-filter-modal-click-button"
          data-cy="payroll-open-filter-modal-click-button"
          className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
          size="large"
          icon={
            <FilterAltOutlinedIcon className="text-gray-600" fontSize="small" />
          }
          onClick={() => handleOpenChange(true)}
        >
          <span
            className="hidden sm:inline"
            data-cy="payroll-filter-popover-button-text"
          >
            Filter
          </span>
        </Button>

        <Modal
          open={open}
          onCancel={() => handleOpenChange(false)}
          footer={null}
          centered
          closable={false}
          width="calc(100vw - 32px)"
          rootClassName="[&_.ant-modal-content]:!rounded-xl [&_.ant-modal-content]:!overflow-hidden"
          styles={{
            body: { padding: 0 },
            content: { padding: 0, borderRadius: 12 },
          }}
          data-cy="payroll-filter-mobile-modal"
        >
          {content}
        </Modal>
      </>
    );
  }

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayClassName="pixel-perfect-popover"
      getPopupContainer={() => document.body}
      data-cy="payroll-filter-popover"
    >
      <Button
        id="payroll-open-filter-modal-click-button"
        data-cy="payroll-open-filter-modal-click-button"
        className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
        size="large"
        icon={
          <FilterAltOutlinedIcon className="text-gray-600" fontSize="small" />
        }
      >
        <span
          className="hidden sm:inline"
          data-cy="payroll-filter-popover-button-text"
        >
          Filter
        </span>
      </Button>
    </Popover>
  );
};

export default FilterPopover;
