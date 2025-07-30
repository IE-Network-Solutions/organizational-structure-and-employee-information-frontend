import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAllCalculatedVpScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Col, Modal, Row, Select, Spin } from 'antd';
import React from 'react';
import { AiOutlineReload } from 'react-icons/ai';
import { LuSettings2 } from 'react-icons/lu';
import { MdOutlineUploadFile } from 'react-icons/md';

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
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useAllAllowanceStore();

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
      label: `${emp?.firstName || ''} ${emp?.middleName || ''} ${emp.lastName || ''}`,
      employeeData: emp,
    })) || [];

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  return (
    <div data-testid="variable-pay-filter-container">
      <Row gutter={[10, 16]} className="mt-5">
        {/* Mobile layout: visible only on mobile */}
        <Col
          xs={24}
          className="flex items-center gap-2 md:hidden"
          data-testid="mobile-filter-layout"
        >
          {/* Search Select */}
          <Select
            showSearch
            allowClear
            className="flex-1 h-10"
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
            data-testid="mobile-employee-search"
          />

          {/* Toggle filter icon */}
          <Button
            type="default"
            className="flex justify-center w-10 h-10 hover:bg-gray-100 border-gray-200"
            icon={<LuSettings2 />}
            onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
            data-testid="mobile-filter-toggle"
          />

          {/* Refresh icon button */}
          <Button
            title="Refresh VP"
            type="text"
            size="small"
            className="w-10 h-10"
            icon={<AiOutlineReload size={24} className="text-gray-600" />}
            onClick={() => refetch()}
            disabled={refreshLoading || isFetching}
            data-testid="mobile-refresh-button"
          />

          {/* Send to payroll icon button */}
          <Button
            title="Send to Payroll"
            type="text"
            size="small"
            className="w-10 h-10"
            icon={<MdOutlineUploadFile size={24} />}
            onClick={handleOpenModal}
            data-testid="mobile-send-payroll-button"
          />
        </Col>

        {/* Desktop layout: visible from md and up */}
        <Col
          xs={24}
          className="hidden md:flex gap-4"
          data-testid="desktop-filter-layout"
        >
          {/* Search Select */}
          <Col md={5}>
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
              data-testid="desktop-employee-search"
            />
          </Col>

          {/* Session Select */}
          <Col md={5}>
            <Select
              placeholder="Select Session"
              onChange={handleSessionChange}
              allowClear
              className="w-full h-14"
              data-testid="session-select"
            >
              {activeCalender?.sessions?.map((session) => (
                <Option key={session?.id} value={session?.id}>
                  {session?.name}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Month Select */}
          <Col md={4}>
            <Select
              placeholder="Select Month"
              onChange={handleMonthChange}
              allowClear
              className="w-full h-14"
              disabled={
                !searchParams?.selectedSession || sessionMonths.length === 0
              }
              data-testid="month-select"
            >
              {sessionMonths.map((month) => (
                <Option key={month?.id} value={month?.id}>
                  {month?.name}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Refresh Button */}
          <Col md={4}>
            <Button
              title="Refresh VP"
              className="w-full h-14"
              type="primary"
              onClick={() => refetch()}
              disabled={refreshLoading || isFetching}
              data-testid="desktop-refresh-button"
            >
              <span className="truncate">
                {refreshLoading || isFetching ? <Spin /> : 'Refresh VP'}
              </span>
            </Button>
          </Col>

          {/* Send to Payroll Button */}
          <Col md={4}>
            <Button
              title="Send to Payroll"
              className="w-full h-14 flex items-center justify-center gap-2"
              type="primary"
              onClick={handleOpenModal}
              data-testid="desktop-send-payroll-button"
            >
              <span className="truncate">Send to Payroll</span>
            </Button>
          </Col>
        </Col>
      </Row>

      <Modal
        centered
        title="Filter Employees"
        open={isMobileFilterVisible}
        onCancel={() => setIsMobileFilterVisible(false)}
        width="85%"
        data-testid="mobile-filter-modal"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-3"
              onClick={() => setIsMobileFilterVisible(false)}
              data-testid="mobile-filter-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-3"
              data-testid="mobile-filter-apply"
            >
              Filter
            </Button>
          </div>
        }
      >
        <Select
          id={`selectSession${searchParams?.selectedSession}`}
          placeholder="Select Session"
          onChange={handleSessionChange}
          allowClear
          className="w-full h-14 mb-2"
          data-testid="mobile-session-select"
        >
          {activeCalender?.sessions?.map((session) => (
            <Option key={session?.id} value={session?.id}>
              {session?.name}
            </Option>
          ))}
        </Select>
        <Select
          id={`selectMonth${searchParams?.selectedMonth}`}
          placeholder="Select Month"
          onChange={handleMonthChange}
          allowClear
          className="w-full h-14"
          disabled={
            !searchParams?.selectedSession || sessionMonths.length === 0
          }
          data-testid="mobile-month-select"
        >
          {sessionMonths.map((month) => (
            <Option key={month?.id} value={month?.id}>
              {month?.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default VariablePayFilter;
