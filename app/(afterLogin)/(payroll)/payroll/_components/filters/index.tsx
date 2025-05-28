import { Col, Row, Select } from 'antd';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetActivePayroll,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';

const { Option } = Select;

interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
  disable?: string[];
  oneRow?: boolean;
  defaultValues?: {
    employeeId?: string;
    yearId?: string;
    sessionId?: string;
    monthId?: string;
    departmentId?: string;
    payPeriodId?: string;
  };
}

const Filters: React.FC<FiltersProps> = ({
  onSearch,
  disable = [],
  oneRow = false,
  defaultValues = {},
}) => {
  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const { data: employeeData } = useGetAllUsers();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: departmentData } = useGetDepartments();
  const { data: payroll } = useGetActivePayroll();
  const { setMonthId, setYearId, setSessionId } = useTnaReviewStore();

  // Get the selected year's sessions and months based on defaultValues
  const selectedYear = getAllFiscalYears?.items?.find(
    (year: any) => year.id === defaultValues?.yearId
  );
  const selectedSession = selectedYear?.sessions?.find(
    (session: any) => session.id === defaultValues?.sessionId
  );

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`,
      employeeData: emp,
    })) || [];

  const handleEmployeeSelect = (value: string) => {
    onSearch({ ...defaultValues, employeeId: value });
  };

  const handleSelectChange = (key: string, value: string) => {
    onSearch({ ...defaultValues, [key]: value });

    if (key === 'yearId') {
      setYearId(value);
    } else if (key === 'sessionId') {
      setSessionId(value);
    } else if (key === 'monthId') {
      setMonthId(value);
    }
  };

  return (
    <div className="mb-6">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{
          flexWrap: oneRow ? 'nowrap' : 'wrap',
          display: 'flex',
          overflowX: oneRow ? 'auto' : 'visible',
          gap: oneRow ? '4px' : '16px',
        }}
      >
        {!disable?.includes('name') && (
          <Col
            style={{
              flex: oneRow ? '0 0 auto' : '1 1 50%',
              minWidth: oneRow ? '400px' : '150px',
            }}
          >
            <Select
              showSearch
              allowClear
              className="min-h-12 w-full"
              placeholder="Search Employee"
              onChange={(value) => handleEmployeeSelect(value)}
              value={defaultValues.employeeId}
              filterOption={(input, option) => {
                const label = option?.label;
                return (
                  typeof label === 'string' &&
                  label.toLowerCase().includes(input.toLowerCase())
                );
              }}
              options={options}
            />
          </Col>
        )}

        {!disable?.includes('year') && (
          <Col
            style={{ flex: oneRow ? '0 0 auto' : '1 1 50%', minWidth: '150px' }}
          >
            <Select
              placeholder="Year"
              onChange={(value) => handleSelectChange('yearId', value)}
              value={defaultValues.yearId}
              allowClear
              style={{ width: '100%', height: '48px' }}
            >
              {getAllFiscalYears?.items?.map((year) => (
                <Option key={year.id} value={year.id}>
                  {year.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        {!disable?.includes('session') && (
          <Col
            style={{ flex: oneRow ? '0 0 auto' : '1 1 50%', minWidth: '150px' }}
          >
            <Select
              placeholder="Session"
              onChange={(value) => handleSelectChange('sessionId', value)}
              value={defaultValues.sessionId}
              allowClear
              style={{ width: '100%', height: '48px' }}
              disabled={!defaultValues.yearId}
            >
              {selectedYear?.sessions?.map((session) => (
                <Option key={session.id} value={session.id}>
                  {session.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        {!disable?.includes('month') && (
          <Col
            style={{ flex: oneRow ? '0 0 auto' : '1 1 50%', minWidth: '150px' }}
          >
            <Select
              placeholder="Month"
              onChange={(value) => handleSelectChange('monthId', value)}
              value={defaultValues.monthId}
              allowClear
              style={{ width: '100%', height: '48px' }}
              disabled={!defaultValues.sessionId}
            >
              {selectedSession?.months?.map((month) => (
                <Option key={month.id} value={month.id}>
                  {month.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        {disable?.includes('department') && (
          <Col
            style={{ flex: oneRow ? '0 0 auto' : '1 1 50%', minWidth: '150px' }}
          >
            <Select
              placeholder="Select department"
              onChange={(value) => handleSelectChange('departmentId', value)}
              value={defaultValues.departmentId}
              allowClear
              style={{ width: '100%', height: '48px' }}
            >
              {departmentData?.map((department: any) => (
                <Option key={department.id} value={department.id}>
                  {department?.name}
                </Option>
              ))}
            </Select>
          </Col>
        )}

        {!disable?.includes('payPeriod') && (
          <Col
            style={{ flex: oneRow ? '0 0 auto' : '1 1 50%', minWidth: '150px' }}
          >
            <Select
              placeholder="Pay Period"
              onChange={(value) => handleSelectChange('payPeriodId', value)}
              value={defaultValues.payPeriodId}
              allowClear
              style={{ width: '100%', height: '48px' }}
            >
              {payPeriodData?.map((period: any) => (
                <Option key={period.id} value={period.id}>
                  {dayjs(period.startDate).format('MMM DD, YYYY')} --
                  {dayjs(period.endDate).format('MMM DD, YYYY')}
                </Option>
              ))}
            </Select>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Filters;
