import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Col, DatePicker, Row, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface OptionParams {
  jobId?: string;
}

const SearchOptions: React.FC<OptionParams> = ({ jobId }) => {
  const { searchParams, setSearchParams } = useCandidateState();

  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: jobList } = useGetJobs(searchParams?.whatYouNeed || '');
  const { data: stageList } = useGetStages();

  const handleSearchCandidate = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSelectChange = handleSearchCandidate;
  const onSearchChange = useDebounce(handleSearchCandidate, 2000);

  const handleSearchByDateRange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD');
      const dateRange = `${startDate} to ${endDate}`;
      onSearchChange(dateRange, 'dateRange');
    } else {
      onSearchChange('', 'dateRange');
    }
  };

  const handleJobChange = (value: string) => {
    onSelectChange(value, 'selectedJob');
  };

  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'selectedDepartment');
  };

  const handleStageChange = (value: string) => {
    onSelectChange(value, 'selectedStage');
  };
  return (
    <div className="my-3">
      <Row gutter={[16, 16]} justify="space-between">
        <Col lg={8} sm={24} xs={24}>
          <div className="w-full">
            <RangePicker
              id={`inputDateRange${searchParams.dateRange}`}
              onChange={(dates: any) => handleSearchByDateRange(dates)}
              className="w-full h-14"
              allowClear
            />
          </div>
        </Col>

        <Col lg={16} sm={24} xs={24}>
          <Row gutter={[8, 16]}>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectJobs${searchParams.selectedJob}`}
                placeholder="Select Job"
                onChange={handleJobChange}
                allowClear
                className="w-full h-14"
                disabled={!!jobId}
              >
                {jobList &&
                  jobList?.items?.map((job: any) => (
                    <Option key={job?.id} value={job?.id}>
                      {job?.jobTitle}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectDepartment${searchParams.selectedDepartment}`}
                placeholder="Select Department"
                onChange={handleDepartmentChange}
                allowClear
                className="w-full h-14"
              >
                {EmployeeDepartment &&
                  EmployeeDepartment?.map((item: any) => (
                    <Option key={item?.id} value={item?.id}>
                      {item?.name}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectStage${searchParams.selectedStage}`}
                placeholder="Select Stage"
                onChange={handleStageChange}
                allowClear
                className="w-full h-14"
              >
                {stageList &&
                  stageList?.items?.map((item: any) => (
                    <Option key={item?.id} value={item?.id}>
                      {item?.title}
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

export default SearchOptions;
