import React, { useEffect, useState } from 'react';
import { Col, Row, Select } from 'antd';
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
  const { data: payPeriodData } = useGetPayPeriod();
  const { data: payroll } = useGetActivePayroll();

  const [searchValue, setSearchValue] = useState<{ [key: string]: string }>({});

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
      onSearch(updatedSearchValue);
      return updatedSearchValue;
    });
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
