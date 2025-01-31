import { Button, Col, Row, Select, Space, Spin, Table } from 'antd';
import { TableColumnsType } from '@/types/table/table';
import { useGetVariablePay } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useGetAllCalculatedVpScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';

import { EmployeeDetails } from '../../../_components/employeeDetails';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { useGetSession } from '@/store/server/features/okrplanning/okr/target/queries';
import { useFilterVpScoreInstance } from '@/store/server/features/compensation/benefit/mutations';
const { Option } = Select;

const VariablePayTable = () => {
  const { data: allUsersVariablePay, isLoading } = useGetVariablePay();
  const { currentPage, pageSize, setCurrentPage, setPageSize } =
    useVariablePayStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: employeeData } = useGetAllUsers();
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: session } = useGetSession();
  const { mutate: filterVpScoreInstance } = useFilterVpScoreInstance();

  const [sessions, setSessions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  const [monthIds, setMonthIds] = useState<string[]>([]);

  const tableData: any[] =
    allUsersVariablePay?.items?.map((variablePay: any) => ({
      id: variablePay?.id,
      name: variablePay?.userId,
      VpInPercentile: variablePay?.vpScoring?.totalPercentage,
      VpInBirr: '',
      VpScore: variablePay?.vpScore,
      Benefit: '',
    })) || [];

  const allEmployeesIds: string[] = tableData.map(
    (employee: any) => employee.name,
  );

  const {
    refetch,
    isLoading: UpdatedIsLoading,
    isFetching,
  } = useGetAllCalculatedVpScore(allEmployeesIds, false);

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };
  const handleSearchChange = (value: any) => {
    setSearchQuery(value);
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text: string) => <EmployeeDetails empId={text} />,
    },
    {
      title: 'VP in %',
      dataIndex: 'VpInPercentile',
      key: 'VpInPercentile',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Total VP in Birr',
      dataIndex: 'VpInBirr',
      key: 'VpInBirr',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'VP Score',
      dataIndex: 'VpScore',
      key: 'VpScore',
      sorter: (a, b) => (a.VpScore || 0) - (b.VpScore || 0),
      render: (text: string) => <div>{text || '-'}</div>,
    },
    {
      title: 'Benefit',
      dataIndex: 'Benefit',
      key: 'Benefit',
      sorter: true,
      render: (text: string) => <div>{text || '-'}</div>,
    },
  ];

  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.firstName || ''} ${emp.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  const filteredDataSource = searchQuery
    ? tableData.filter(
        (employee: any) =>
          employee.name?.toLowerCase() === searchQuery?.toLowerCase(),
      )
    : tableData;

  const handleSelectChange = (key: string, value: string) => {
    if (key === 'sessionId') {
      setSearchValue({ ...searchValue, sessionId: value });

      const selectedSession = sessions.find((session) => session.id === value);

      if (selectedSession) {
        setMonths(selectedSession.months);
        setMonthIds(selectedSession.months.map((month: any) => month.id));
        filterVpScoreInstance({
          monthIds: selectedSession.months.map((month: any) => month.id),
        });
      } else {
        setMonths([]);
        setMonthIds([]);
      }

      setSearchValue((prevState: any) => ({
        ...prevState,
        monthId: undefined,
      }));
    } else if (key === 'monthId') {
      setSearchValue({ ...searchValue, monthId: value });

      if (!value) {
        const selectedSession = sessions.find(
          (session) => session.id === searchValue.sessionId,
        );
        if (selectedSession) {
          setMonthIds(selectedSession.months.map((month: any) => month.id));
          filterVpScoreInstance({
            monthIds: selectedSession.months.map((month: any) => month.id),
          });
        }
      } else {
        setMonthIds([value]);
        filterVpScoreInstance({ monthIds: [value] });
      }
    }
  };

  useEffect(() => {
    if (session?.items) {
      setSessions(session.items);
    }
  }, [session]);

  return (
    <Spin spinning={isLoading || UpdatedIsLoading || isFetching}>
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ flexWrap: 'wrap' }}
      >
        <Col xl={8} lg={10} md={12} sm={24} xs={24}>
          <Select
            showSearch
            allowClear
            className="min-h-12"
            placeholder="Search by name"
            onChange={handleSearchChange}
            filterOption={(input, option) => {
              const label = option?.label;
              return (
                typeof label === 'string' &&
                label.toLowerCase().includes(input.toLowerCase())
              );
            }}
            options={options}
            style={{ width: '100%', height: '48px' }}
          />
        </Col>

        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Select
            placeholder="Session"
            onChange={(value) => handleSelectChange('sessionId', value)}
            value={searchValue.sessionId}
            allowClear
            style={{ width: '100%', height: '48px' }}
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
        <Col xl={4} lg={5} md={6} sm={12} xs={24}>
          <Button
            className="min-h-12"
            style={{ width: '100%', height: '48px' }}
            type="primary"
            onClick={() => refetch()}
          >
            Refresh VP
          </Button>
        </Col>
      </Row>
      <Table
        className="mt-6"
        columns={columns}
        dataSource={filteredDataSource}
        pagination={{
          current: currentPage,
          pageSize,
          total: tableData.length,
        }}
        onChange={handleTableChange}
      />
    </Spin>
  );
};

export default VariablePayTable;
