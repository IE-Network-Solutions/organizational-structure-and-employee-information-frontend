import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { Col, Row, Select } from 'antd';
import React from 'react';

const { Option } = Select;

const OkrSearch: React.FC = () => {
  const { searchObjParams, setSearchObjParams } = useOKRStore();

  const { data: Metrics } = useGetMetrics();
  const { data: allUsers } = useGetAllUsers();
  const { data: Departments } = useGetUserDepartment();
  const DepartmentWithUsers = Departments?.filter(
    (i: any) => i.users?.length > 0,
  );
  const handleFilter = async (
    value: string,
    keyValue: keyof typeof searchObjParams,
  ) => {
    setSearchObjParams(keyValue, value);
  };

  const onSelectChange = handleFilter;
  const handleUserChangeChange = (value: string) => {
    onSelectChange(value, 'userId');
  };
  const handleMetricChange = (value: string | '') => {
    onSelectChange(value, 'metricTypeId');
  };
  const handleDepartmentChange = (value: string | '') => {
    onSelectChange(value, 'departmentId');
  };

  return (
    <div>
      <Row gutter={[16, 24]} justify="space-between">
        <Col lg={10} sm={24} xs={24}>
          <div className="w-full">
            <Select
              showSearch
              placeholder="Select a person"
              className="w-full h-14"
              allowClear
              onChange={handleUserChangeChange}
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={allUsers?.items?.map((item: any) => ({
                ...item,
                value: item?.id,
                label: item?.firstName + ' ' + item?.lastName,
              }))}
            />
          </div>
        </Col>

        <Col lg={11} sm={24} xs={24}>
          <Row gutter={[8, 16]}>
            <Col lg={12} sm={12} xs={24}>
              <Select
                id={`selectDepartment${searchObjParams.userId}`}
                placeholder="Select Department"
                onChange={handleDepartmentChange}
                allowClear
                className="w-full h-14"
              >
                {DepartmentWithUsers?.map((item: any) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={12} sm={12} xs={24}>
              <Select
                id={`selectBranches${searchObjParams.metricTypeId}`}
                placeholder="By Metric Type"
                onChange={(val) => {
                  handleMetricChange(val);
                }}
                allowClear
                className="w-full h-14"
              >
                {Metrics?.items?.map((item: any) => (
                  <Option key={item?.id} value={item?.id}>
                    {item?.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default OkrSearch;
