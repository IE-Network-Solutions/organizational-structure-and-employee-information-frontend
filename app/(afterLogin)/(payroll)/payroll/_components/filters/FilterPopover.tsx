import React, { useEffect, useState, useRef } from 'react';
import { Form, Select, DatePicker, Button, Row, Col, ConfigProvider, Popover } from 'antd';
import { X } from 'lucide-react';
import { FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetActivePayroll,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetLevel1Departments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';

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
  onSearch: (filters: { [key: string]: string }) => void;
  defaultValues?: FilterValues;
}

const CustomLabel = ({ title }: { title: string }) => (
  <span className="text-[13px] font-semibold text-gray-800">
    {title} <span className="text-red-500 ml-1">*</span>
  </span>
);

const FilterPopover: React.FC<FilterPopoverProps> = ({ onSearch, defaultValues }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<FilterValues>();

  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: departmentData } = useGetDepartments();
  const { data: level1Departments } = useGetLevel1Departments();
  
  const { searchQuery, pageSize, currentPage } = useEmployeeStore();
  const { data: payroll } = useGetActivePayroll(searchQuery, pageSize, currentPage);

  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);

  const { setMonthId, setYearId, setSessionId } = useTnaReviewStore();
  const initialSearchTriggered = useRef(false);

  useEffect(() => {
    if (getAllFiscalYears) {
      setFiscalYears(getAllFiscalYears.items || []);

      if (!form.getFieldValue('yearId') || !form.getFieldValue('sessionId') || !form.getFieldValue('monthId')) {
        const selectedYear = getAllFiscalYears.items.find(
          (year: any) => year.id === (defaultValues?.yearId || '')
        ) || getAllFiscalYears.items.find((year: any) => year.active);

        if (selectedYear) {
          const selectedSession = selectedYear.sessions?.find(
            (s: any) => s.id === (defaultValues?.sessionId || '')
          ) || selectedYear.sessions?.find((s: any) => s.active);

          const selectedMonth = selectedSession?.months?.find(
            (m: any) => m.id === (defaultValues?.monthId || '')
          ) || selectedSession?.months?.find((m: any) => m.active);

          setSessions(selectedYear.sessions || []);
          setMonths(selectedSession?.months || []);

          form.setFieldsValue({
            yearId: selectedYear.id || '',
            sessionId: selectedSession?.id || '',
            monthId: selectedMonth?.id || '',
          });

          if (!initialSearchTriggered.current) {
            onSearch(form.getFieldsValue());
            initialSearchTriggered.current = true;
          }
        }
      }
    }
  }, [getAllFiscalYears]);

  useEffect(() => {
    if (payroll?.items && payroll.items.length > 0 && !form.getFieldValue('payPeriodId')) {
      const defaultPayPeriodId = payroll.items[0]?.payPeriodId;
      if (defaultPayPeriodId) {
        form.setFieldsValue({ payPeriodId: defaultPayPeriodId });
        onSearch(form.getFieldsValue());
      }
    } else if (payPeriodData && payPeriodData.length > 0 && !form.getFieldValue('payPeriodId')) {
      const activePeriod = payPeriodData.find((p: any) => p.status === 'OPEN') || payPeriodData[0];
      if (activePeriod) {
        form.setFieldsValue({ payPeriodId: activePeriod.id });
        onSearch(form.getFieldsValue());
      }
    }
  }, [payroll?.items, payPeriodData]);

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
    onSearch(values as any);
    setOpen(false);
  };

  const onReset = () => {
    form.resetFields();
    // Maintain year and session but reset others if we want, or reset all.
    // Resetting all is the requested behavior per mockup UI.
  };

  const handleOpenChange = (newOpen: boolean) => {
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
          }
        }
      }}
    >
      <div className="bg-white p-2 w-full max-w-[500px] min-w-[320px] md:min-w-[450px] relative" data-cy="payroll-filter-popover-content">
        
        {/* Close Icon */}
        <button 
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setOpen(false)}
          data-cy="payroll-filter-popover-close-btn"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-[16px] font-bold text-gray-900 m-0 leading-tight">Filter</h2>
          <p className="text-[13px] text-gray-400 m-0 mt-1">Select All filters that apply</p>
        </div>

        {/* Filter Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          data-cy="payroll-filter-popover-form"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="yearId"
                label={<CustomLabel title="Year" />}
                rules={[{ required: true, message: 'Required' }]}
                data-cy="payroll-filter-popover-year"
              >
                <Select size="large" placeholder="Select Year" onChange={handleYearChange} allowClear>
                  {fiscalYears.map((year) => (
                    <Option key={year.id} value={year.id}>
                      {year.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="sessionId"
                label={<CustomLabel title="Session" />}
                rules={[{ required: true, message: 'Required' }]}
                data-cy="payroll-filter-popover-session"
              >
                <Select size="large" placeholder="Select Session" onChange={handleSessionChange} allowClear disabled={!form.getFieldValue('yearId')}>
                  {sessions.map((session) => (
                    <Option key={session.id} value={session.id}>
                      {session.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="divisionId"
                label={<CustomLabel title="Division" />}
                data-cy="payroll-filter-popover-division"
              >
                <Select size="large" placeholder="Select Division" allowClear>
                  {level1Departments?.map((division: any) => (
                    <Option key={division.id} value={division.id}>
                      {division?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="departmentId"
                label={<CustomLabel title="Department" />}
                data-cy="payroll-filter-popover-department"
              >
                <Select size="large" placeholder="Select Department" allowClear>
                  {departmentData?.map((department: any) => (
                    <Option key={department.id} value={department.id}>
                      {department?.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="payPeriodId"
                label={<CustomLabel title="Pay Period" />}
                data-cy="payroll-filter-popover-pay-period"
              >
                <Select size="large" placeholder="Select Pay Period" allowClear>
                  {payPeriodData?.map((period: any) => (
                    <Option key={period.id} value={period.id}>
                      {dayjs(period.startDate).format('MMM DD, YYYY')} -- {dayjs(period.endDate).format('MMM DD, YYYY')}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                name="monthId"
                label={<CustomLabel title="Month" />}
                rules={[{ required: true, message: 'Required' }]}
                data-cy="payroll-filter-popover-month"
              >
                <Select size="large" placeholder="Select Month" allowClear disabled={!form.getFieldValue('sessionId')}>
                  {months.map((month) => (
                    <Option key={month.id} value={month.id}>
                      {month.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Footer Buttons */}
          <div className="flex justify-end items-center gap-3 mt-4 pt-2 border-t border-gray-100">
            <Button size="large" onClick={onReset} className="px-6 text-gray-600 font-semibold" data-cy="payroll-filter-popover-reset-btn">
              Reset
            </Button>
            <Button 
              size="large" 
              type="primary" 
              htmlType="submit" 
              className="bg-[#254ec2] hover:bg-[#1e3e9a] border-none px-6 font-semibold shadow-none"
              data-cy="payroll-filter-popover-save-btn"
            >
              Save Filter
            </Button>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayClassName="pixel-perfect-popover"
      data-cy="payroll-filter-popover"
    >
      <Button
        id="payroll-open-filter-modal-click-button"
        data-cy="payroll-open-filter-modal-click-button"
        className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
        size="large"
        icon={<FilterOutlined className="text-gray-600" />}
      >
        Filter
      </Button>
    </Popover>
  );
};

export default FilterPopover;
