import React, { useEffect } from 'react';
import { Col, Row, Select } from 'antd';
import {
  useGetPayPeriod,
  useGetActivePayroll,
} from '@/store/server/features/payroll/payroll/queries';
import dayjs from 'dayjs';
import { useFiltersStore } from '@/store/uistate/features/payroll/paySlip';

const { Option } = Select;

interface FiltersProps {
  onSearch: (filters: { [key: string]: string }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onSearch }) => {
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: payroll } = useGetActivePayroll();

  const searchValue = useFiltersStore((state) => state.searchValue);
  const setSearchValue = useFiltersStore((state) => state.setSearchValue);

  useEffect(() => {
    if (payroll?.payrolls.length > 0) {
      const defaultPayPeriodId = payroll.payrolls[0]?.payPeriodId;
      const defaultPayPeriod = payPeriodData?.find(
        (period: any) => period.id === defaultPayPeriodId,
      );

      if (defaultPayPeriod) {
        setSearchValue('payPeriodId', defaultPayPeriodId);
        onSearch({
          ...searchValue,
          payPeriodId: defaultPayPeriodId,
        });
      }
    }
  }, [payroll?.payrolls, payPeriodData, onSearch, setSearchValue, searchValue]);

  const handleSelectChange = (key: string, value: string) => {
    setSearchValue(key, value);
    onSearch({ ...searchValue, [key]: value });
  };

  return (
    <div className="mb-6">
      <Row gutter={[16, 16]} align="top" className="justify-end m-2">
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
                {dayjs(period.startDate).format('MMM DD, YYYY')} --{' '}
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
