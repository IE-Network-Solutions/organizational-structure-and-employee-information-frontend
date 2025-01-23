import React, { useEffect, useState } from 'react';
import { Col, Row, Select } from 'antd';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetActivePayroll,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';

const { Option } = Select;

interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onSearch }) => {
  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const { data: employeeData } = useGetAllUsers();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: payroll } = useGetActivePayroll();

  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (employeeData) {
      setFilteredEmployees(employeeData.items || []);
    }
    if (getAllFiscalYears) {
      setFiscalYears(getAllFiscalYears.items || []);
    }
  }, [getAllFiscalYears, employeeData]);

  useEffect(() => {
    if (payroll?.payrolls.length > 0) {
      const defaultPayPeriodId = payroll.payrolls[0]?.payPeriodId;
      const defaultPayPeriod = payPeriodData?.find(
        (period: any) => period.id === defaultPayPeriodId,
      );

      if (defaultPayPeriod) {
        setSearchValue((prev) => ({
          ...prev,
          payPeriodId: defaultPayPeriodId,
        }));
        onSearch({
          ...searchValue,
          payPeriodId: defaultPayPeriodId,
        });
      }
    }
  }, [payroll?.payrolls, payPeriodData]);

  const handleSelectChange = (key: string, value: string) => {
    setSearchValue((prev) => {
      const updatedSearchValue = { ...prev, [key]: value };

      if (key === 'yearId') {
        const selectedYear = fiscalYears.find((year) => year.id === value);
        setSessions(selectedYear?.sessions || []);
        setMonths([]);
        updatedSearchValue.sessionId = '';
        updatedSearchValue.monthId = '';
      } else if (key === 'sessionId') {
        const selectedSession = sessions.find(
          (session) => session.id === value,
        );
        setMonths(selectedSession?.months || []);
        updatedSearchValue.monthId = '';
      }

      if (key === 'monthId' || key === 'payPeriodId' || key === 'employeeId') {
        const filteredSearchValue = {
          employeeId: updatedSearchValue.employeeId || '',
          monthId: updatedSearchValue.monthId || '',
          payPeriodId: updatedSearchValue.payPeriodId || '',
        };
        onSearch(filteredSearchValue);
      }

      return updatedSearchValue;
    });
  };

  return (
    <div className="mb-6">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ flexWrap: 'wrap' }}
      >
        <Col xl={8} lg={10} md={12} sm={24} xs={24}>
          <Select
            showSearch
            placeholder="Search by Name"
            onChange={(value) => handleSelectChange('employeeId', value)}
            value={searchValue.employeeId || ''}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            {filteredEmployees.map((employee) => (
              <Option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Year"
            onChange={(value) => handleSelectChange('yearId', value)}
            value={searchValue.yearId}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            {fiscalYears.map((year) => (
              <Option key={year.id} value={year.id}>
                {year.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Session"
            onChange={(value) => handleSelectChange('sessionId', value)}
            value={searchValue.sessionId}
            allowClear
            style={{ width: '100%', height: '48px' }}
            disabled={!searchValue.yearId}
          >
            {sessions.map((session) => (
              <Option key={session.id} value={session.id}>
                {session.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Month"
            onChange={(value) => handleSelectChange('monthId', value)}
            value={searchValue.monthId}
            allowClear
            style={{ width: '100%', height: '48px' }}
            disabled={!searchValue.sessionId}
          >
            {months.map((month) => (
              <Option key={month.id} value={month.id}>
                {month.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Pay Period"
            onChange={(value) => handleSelectChange('payPeriodId', value)}
            value={searchValue.payPeriodId}
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
      </Row>
    </div>
  );
};

export default Filters;
