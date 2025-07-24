import React, { useEffect, useState } from 'react';
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
import { useGetLevel1Departments } from '@/store/server/features/employees/employeeManagment/department/queries';
import useEmployeeStore from '@/store/uistate/features/payroll/employeeInfoStore';

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
    divisionId?: string;
    payPeriodId?: string;
  };
}

const Filters: React.FC<FiltersProps> = ({
  onSearch,
  disable = [],
  // oneRow = false,
  defaultValues,
}) => {
  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const { data: employeeData } = useGetAllUsers();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: departmentData } = useGetDepartments();
  const { data: level1Departments } = useGetLevel1Departments();
  const { searchQuery, pageSize, currentPage } = useEmployeeStore();
  const { data: payroll } = useGetActivePayroll(
    searchQuery,
    pageSize,
    currentPage,
  );
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({
    ...defaultValues,
  });

  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const { setMonthId, setYearId, setSessionId } = useTnaReviewStore();

  useEffect(() => {
    setMonthId(searchValue.monthId);
    setYearId(searchValue.yearId);
    setSessionId(searchValue.sessionId);
  }, [searchValue]);
  useEffect(() => {
    if (getAllFiscalYears) {
      setFiscalYears(getAllFiscalYears.items || []);

      // Only set initial values if not already set
      if (
        !searchValue.yearId ||
        !searchValue.sessionId ||
        !searchValue.monthId
      ) {
        const selectedYear =
          getAllFiscalYears.items.find(
            (year: any) => year.id === (defaultValues?.yearId || ''),
          ) || getAllFiscalYears.items.find((year: any) => year.active);

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

          setSearchValue((prev) => ({
            ...prev,
            yearId: prev.yearId || selectedYear.id || '',
            sessionId: prev.sessionId || selectedSession?.id || '',
            monthId: prev.monthId || selectedMonth?.id || '',
          }));
        }
      } else {
        // If yearId/sessionId/monthId are already set, update sessions/months for the selected year/session
        const selectedYear = getAllFiscalYears.items.find(
          (year: any) => year.id === searchValue.yearId,
        );
        setSessions(selectedYear?.sessions || []);
        const selectedSession = selectedYear?.sessions?.find(
          (s: any) => s.id === searchValue.sessionId,
        );
        setMonths(selectedSession?.months || []);
      }
    }
  }, [getAllFiscalYears]);

  useEffect(() => {
    if (payroll?.items.length > 0) {
      const defaultPayPeriodId = payroll.items[0]?.payPeriodId;

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
  }, [payroll?.items, payPeriodData]);

  const handleEmployeeSelect = (value: string) => {
    setSearchValue((prev) => {
      const updatedSearchValue = { ...prev, employeeId: value };
      onSearch(updatedSearchValue);
      return updatedSearchValue;
    });
  };

  const handleSelectChange = (key: string, value: string) => {
    if (key === 'yearId') {
      const selectedYear = fiscalYears.find((year) => year.id === value);
      const isDifferentYear = searchValue.yearId !== value;

      setSessions(selectedYear?.sessions || []);
      setMonths([]);

      setSearchValue((prev) => {
        const updated = {
          ...prev,
          yearId: value,
          sessionId: isDifferentYear ? '' : prev.sessionId,
          monthId: '',
        };
        onSearch(updated);
        return updated;
      });
    } else if (key === 'sessionId') {
      const selectedSession = sessions.find((s: any) => s.id === value);
      const isDifferentSession = searchValue.sessionId !== value;

      setMonths(selectedSession?.months || []);

      setSearchValue((prev) => {
        const updated = {
          ...prev,
          sessionId: value,
          monthId: isDifferentSession ? '' : prev.monthId,
        };
        onSearch(updated);
        return updated;
      });
    } else if (key === 'monthId') {
      setSearchValue((prev) => {
        const updated = {
          ...prev,
          monthId: value,
        };
        onSearch(updated);
        return updated;
      });
    } else if (key === 'departmentId') {
      setSearchValue((prev) => {
        const updated = {
          ...prev,
          departmentId: value,
        };
        onSearch(updated);
        return updated;
      });
    } else if (key === 'divisionId') {
      setSearchValue((prev) => {
        const updated = {
          ...prev,
          divisionId: value,
        };
        onSearch(updated);
        return updated;
      });
    } else if (key === 'payPeriodId') {
      setSearchValue((prev) => {
        const updated = {
          ...prev,
          payPeriodId: value,
        };
        onSearch(updated);
        return updated;
      });
    }
  };

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  return (
    <div className="mb-6">
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        // style={{
        //   flexWrap: oneRow ? 'nowrap' : 'wrap',
        //   display: 'flex',
        //   overflowX: oneRow ? 'auto' : 'visible',
        //   gap: oneRow ? '4px' : '16px',
        // }}
      >
        {!disable?.includes('name') && (
          <Col
            // style={{
            //   flex: oneRow ? '0 0 auto' : '1 1 50%',
            //   minWidth: oneRow ? '400px' : '150px',
            // }}
            xs={24}
            sm={24}
            md={6}
            lg={6}
            xl={6}
          >
            <Select
              showSearch
              allowClear
              className="min-h-12 w-full"
              placeholder="Search Employee"
              onChange={(value) => handleEmployeeSelect(value)}
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
        <Col xs={24} sm={24} md={18} lg={18} xl={18}>
          <Row gutter={[16, 16]} justify="end">
            {!disable?.includes('year') && (
              <Col
                // style={{
                //   flex: oneRow ? '0 0 auto' : '1 1 50%',
                //   minWidth: '150px',
                // }}
                xs={24}
                sm={24}
                md={4}
                lg={4}
                xl={4}
              >
                <Select
                  placeholder="Year"
                  onChange={(value) => {
                    setYearId(value);
                    handleSelectChange('yearId', value);
                  }}
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
            )}

            {!disable?.includes('session') && (
              <Col
                // style={{
                //   flex: oneRow ? '0 0 auto' : '1 1 50%',
                //   minWidth: '150px',
                // }}
                xs={24}
                sm={24}
                md={4}
                lg={4}
                xl={4}
              >
                <Select
                  placeholder="Session"
                  onChange={(value) => {
                    setSessionId(value);
                    handleSelectChange('sessionId', value);
                  }}
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
            )}

            {!disable?.includes('month') && (
              <Col
                // style={{
                //   flex: oneRow ? '0 0 auto' : '1 1 50%',
                //   minWidth: '150px',
                // }}
                xs={24}
                sm={24}
                md={3}
                lg={3}
                xl={3}
              >
                <Select
                  placeholder="Month"
                  onChange={(value) => {
                    setMonthId(value);
                    handleSelectChange('monthId', value);
                  }}
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
            )}

            {!disable?.includes('division') && (
              <Col xs={24} sm={24} md={3} lg={3} xl={3}>
                <Select
                  placeholder="Select division"
                  onChange={(value) => handleSelectChange('divisionId', value)}
                  value={searchValue.divisionId}
                  allowClear
                  style={{ width: '100%', height: '48px' }}
                >
                  {level1Departments?.map((division: any) => (
                    <Option key={division.id} value={division.id}>
                      {division?.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}

            {!disable?.includes('department') && (
              <Col
                // style={{
                //   flex: oneRow ? '0 0 auto' : '1 1 50%',
                //   minWidth: '150px',
                // }}
                xs={24}
                sm={24}
                md={3}
                lg={3}
                xl={3}
              >
                <Select
                  placeholder="Select department"
                  onChange={(value) =>
                    handleSelectChange('departmentId', value)
                  }
                  value={searchValue.departmentId}
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
                // style={{
                //   flex: oneRow ? '0 0 auto' : '1 1 50%',
                //   minWidth: '150px',
                // }}
                xs={24}
                sm={24}
                md={6}
                lg={6}
                xl={6}
              >
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
            )}
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Filters;
