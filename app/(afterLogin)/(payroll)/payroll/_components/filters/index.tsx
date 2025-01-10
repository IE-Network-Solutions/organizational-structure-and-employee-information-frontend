import React, { useEffect, useState } from 'react';
import { Col, Input, Row, Select } from 'antd';
import { useGetAllFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';

const { Option } = Select;

interface FiltersProps {
  onSearch: (key: string, value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ onSearch }) => {
  const { data: getAllFiscalYears } = useGetAllFiscalYears();
  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);

  useEffect(() => {
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

        setSearchValue({
          yearId: activeFiscalYear.id || '',
          sessionId: activeSession?.id || '',
          monthId: activeMonth?.id || '',
        });

        setSessions(activeFiscalYear.sessions || []);
        setMonths(activeSession?.months || []);
      }
    }
  }, [getAllFiscalYears]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue((prev) => ({ ...prev, employeeId: value }));
    onSearch('employeeId', value);
  };

  const handleSelectChange = (key: string, value: string) => {
    setSearchValue((prev) => ({ ...prev, [key]: value }));

    if (key === 'yearId') {
      const selectedYear = fiscalYears.find((year) => year.id === value);
      setSessions(selectedYear?.sessions || []);
      setMonths([]);
    } else if (key === 'sessionId') {
      const selectedSession = sessions.find((session) => session.id === value);
      setMonths(selectedSession?.months || []);
    }

    onSearch(key, value);
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
          <Input
            placeholder="Search by Name"
            onChange={handleInputChange}
            allowClear
            style={{ height: '48px' }}
          />
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
            onChange={() => {}}
            allowClear
            style={{ width: '100%', height: '48px' }}
          >
            <Option value="Bi-Weekly">Bi-Weekly</Option>
            <Option value="Monthly">Monthly</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
};

export default Filters;
