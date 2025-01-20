import React, { useEffect, useState } from 'react';
import { Col, Row, Select } from 'antd';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';

const { Option } = Select;

interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onSearch }) => {
  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const { data: employeeData } = useGetAllUsers();
  const { data: payPeriodData } = useGetPayPeriod();

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

      const activeFiscalYear = getAllFiscalYears.items.find(
        (year: any) => year.active,
      );
      if (activeFiscalYear) {
        const activeSession = activeFiscalYear.sessions?.find(
          (session) => session.active,
        );
        const activeMonth = activeSession?.months?.find(
          (month) => month.active,
        );

        setSearchValue((prev) => ({
          ...prev,
          yearId: activeFiscalYear.id || '',
          sessionId: activeSession?.id || '',
          monthId: activeMonth?.id || '',
        }));

        setSessions(activeFiscalYear.sessions || []);
        setMonths(activeSession?.months || []);
      }
    }
  }, [getAllFiscalYears, employeeData]);

  const handleEmployeeSelect = (value: string) => {
    setSearchValue((prev) => {
      const updatedSearchValue = { ...prev, employeeId: value };
      onSearch(updatedSearchValue);
      return updatedSearchValue;
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    setSearchValue((prev) => {
      const updatedSearchValue = { ...prev, [key]: value };

      if (key === 'yearId') {
        const selectedYear = fiscalYears.find((year) => year.id === value);
        setSessions(selectedYear?.sessions || []);
        setMonths([]);
      } else if (key === 'sessionId') {
        const selectedSession = sessions.find(
          (session) => session.id === value,
        );
        setMonths(selectedSession?.months || []);
      }

      onSearch(updatedSearchValue);
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
            onChange={handleEmployeeSelect} // This is fine, assuming you pass employee ID to this function
            value={
              filteredEmployees.find(
                (employee) => employee.id === searchValue.employeeId,
              )
                ? `${
                    filteredEmployees.find(
                      (employee) => employee.id === searchValue.employeeId,
                    )?.firstName
                  } ${
                    filteredEmployees.find(
                      (employee) => employee.id === searchValue.employeeId,
                    )?.lastName
                  }`
                : ''
            }
            allowClear
            style={{ width: '100%', height: '48px' }}
            onSearch={(value) => {
              setSearchValue((prev) => ({
                ...prev,
                employeeId: value, // Update the search term directly here
              }));
            }}
          >
            {filteredEmployees
              .filter((employee) =>
                employee.firstName
                  .toLowerCase()
                  .startsWith(searchValue.employeeId?.toLowerCase() || ''),
              )
              .map((employee) => (
                <Option key={employee.id} value={employee.id}>
                  {employee.firstName} &nbsp; {employee.lastName}
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
            onChange={(value) => handleSelectChange('payPeriod', value)}
            value={searchValue.payPeriod}
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
