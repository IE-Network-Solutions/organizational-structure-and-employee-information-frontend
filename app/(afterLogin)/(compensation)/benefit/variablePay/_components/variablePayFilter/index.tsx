import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAllCalculatedVpScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Col, Row, Select, Spin } from 'antd';
import React from 'react';

const { Option } = Select;

interface VPFilterParams {
  tableData: any;
}

const VariablePayFilter: React.FC<VPFilterParams> = ({ tableData }) => {
  const {
    searchParams,
    setSearchParams,
    setOpenModal,
    sessionMonths,
    setSessionMonths,
  } = useVariablePayStore();

  const { data: employeeData } = useGetAllUsers();
  const { data: activeCalender } = useGetActiveFiscalYears();

  const allEmployeesIds: string[] = tableData.map(
    (employee: any) => employee.name,
  );
  const {
    refetch,
    isLoading: refreshLoading,
    isFetching,
  } = useGetAllCalculatedVpScore(allEmployeesIds, false);

  const handleSearchEmployee = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSearchChange = useDebounce(handleSearchEmployee, 2000);

  const handleSessionChange = (sessionId: string) => {
    const selectedSession = activeCalender?.sessions?.find(
      (session) => session?.id === sessionId,
    );

    if (selectedSession) {
      const allMonthIds = selectedSession?.months?.map((month) => month?.id);
      setSearchParams('selectedSession', sessionId);
      setSearchParams(
        'selectedMonth',
        allMonthIds ? allMonthIds.join(',') : '',
      );

      setSessionMonths(selectedSession?.months || []);
    } else {
      setSessionMonths([]); // clear months if no session is selected
      setSearchParams('selectedSession', '');
      setSearchParams('selectedMonth', '');
    }
  };

  const handleMonthChange = (monthId: string) => {
    const selectedMonth = activeCalender?.sessions
      ?.flatMap((session) => session.months)
      ?.find((month) => month?.id === monthId);

    if (selectedMonth) {
      setSearchParams('selectedMonth', [monthId].join(','));
    }
  };

  const handleSearchInput = (
    value: string,
    keyValue: keyof typeof searchParams,
  ) => {
    onSearchChange(value, keyValue);
  };

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.firstName || ''} ${emp.lastName}`,
      employeeData: emp,
    })) || [];

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  return (
    <Row gutter={[10, 16]} className="mt-5">
      <Col xs={24} sm={24} md={8} lg={8} xl={8}>
        <Select
          showSearch
          allowClear
          className="w-full h-14"
          placeholder="Search by name"
          onChange={(value) => handleSearchInput(value, 'employeeName')}
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
      <Col xs={24} sm={24} md={16} lg={16} xl={16}>
        <Row gutter={[10, 16]}>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Select
              id={`selectSession${searchParams?.selectedSession}`}
              placeholder="Select Session"
              onChange={handleSessionChange}
              allowClear
              className="w-full h-14"
            >
              {activeCalender?.sessions?.map((session) => (
                <Option key={session?.id} value={session?.id}>
                  {session?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Select
              id={`selectMonth${searchParams?.selectedMonth}`}
              placeholder="Select Month"
              onChange={handleMonthChange}
              allowClear
              className="w-full h-14"
              disabled={
                !searchParams?.selectedSession || sessionMonths.length === 0
              }
            >
              {sessionMonths.map((month) => (
                <Option key={month?.id} value={month?.id}>
                  {month?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Button
              className="w-full h-14"
              type="primary"
              onClick={() => refetch()}
              disabled={refreshLoading || isFetching}
            >
              {refreshLoading || isFetching ? <Spin /> : 'Refresh VP'}
            </Button>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6} xl={6}>
            <Button
              className="w-full h-14"
              type="primary"
              onClick={handleOpenModal}
            >
              Send to payroll
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default VariablePayFilter;
