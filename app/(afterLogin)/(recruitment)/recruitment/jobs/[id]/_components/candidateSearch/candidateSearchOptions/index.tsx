import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useDebounce } from '@/utils/useDebounce';
import { Button, Col, DatePicker, Modal, Row, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import WhatYouNeed from '../whatYouNeed';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuSettings2 } from 'react-icons/lu';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface OptionParams {
  jobId?: string;
}

const SearchOptions: React.FC<OptionParams> = ({ jobId }) => {
  const {
    searchParams,
    setSearchParams,
    currentPage,
    pageSize,
    showMobileFilter,
    setShowMobileFilter,
  } = useCandidateState();

  const { isMobile, isTablet } = useIsMobile();

  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: jobList } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );
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

  const Filters = (
    <>
      <Row gutter={[16, 16]} className="mb-2">
        <Col lg={8} sm={24} xs={24}>
          <RangePicker
            id={`inputDateRange${searchParams.dateRange}`}
            data-cy="talent-acquisition-job-candidate-search-date-picker"
            onChange={(dates: any) => handleSearchByDateRange(dates)}
            className="w-full h-14"
            allowClear
            getPopupContainer={(triggerNode) =>
              triggerNode.parentElement || document.body
            }
          />
        </Col>
        <Col lg={16} sm={24} xs={24}>
          <Row gutter={[8, 16]}>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectJobs${searchParams.selectedJob}`}
                data-cy="talent-acquisition-job-candidate-search-select-job"
                placeholder="Select Job"
                onChange={handleJobChange}
                allowClear
                className="w-full h-14"
                disabled={!!jobId}
              >
                {jobList?.items?.map((job: any) => (
                  <Option
                    key={job?.id}
                    value={job?.id}
                    id={`talent-acquisition-job-candidate-search-option-job-${job?.id}`}
                    data-cy={`talent-acquisition-job-candidate-search-option-job-${job?.id}`}
                  >
                    {job?.jobTitle}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectDepartment${searchParams.selectedDepartment}`}
                data-cy="talent-acquisition-job-candidate-search-select-department"
                placeholder="Select Department"
                onChange={handleDepartmentChange}
                allowClear
                className="w-full h-14"
              >
                {EmployeeDepartment?.map((item: any) => (
                  <Option
                    key={item?.id}
                    value={item?.id}
                    id={`talent-acquisition-job-candidate-search-option-department-${item?.id}`}
                    data-cy={`talent-acquisition-job-candidate-search-option-department-${item?.id}`}
                  >
                    {item?.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col lg={8} sm={12} xs={24}>
              <Select
                id={`selectStage${searchParams.selectedStage}`}
                data-cy="talent-acquisition-job-candidate-search-select-stage"
                placeholder="Select Stage"
                onChange={handleStageChange}
                allowClear
                className="w-full h-14"
              >
                {stageList?.items?.map((item: any) => (
                  <Option
                    key={item?.id}
                    value={item?.id}
                    id={`talent-acquisition-job-candidate-search-option-stage-${item?.id}`}
                    data-cy={`talent-acquisition-job-candidate-search-option-stage-${item?.id}`}
                  >
                    {item?.title}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
  return (
    <div id="talent-acquisition-candidate-search-options-div-container" data-cy="talent-acquisition-candidate-search-options-div-container" className="my-3">
      {isMobile || isTablet ? (
        <>
          <div id="talent-acquisition-candidate-search-options-div-mobile-header" data-cy="talent-acquisition-candidate-search-options-div-mobile-header" className="flex justify-end m-2 space-x-4">
            <WhatYouNeed />
            <div id="talent-acquisition-candidate-search-options-div-filter-button" data-cy="talent-acquisition-candidate-search-options-div-filter-button" className="flex items-center justify-center rounded-lg border-[1px] border-gray-200 p-3">
              <LuSettings2
                id="talent-acquisition-job-candidate-search-button-mobile-filter"
                data-cy="talent-acquisition-job-candidate-search-button-mobile-filter"
                onClick={() => setShowMobileFilter(true)}
                className="text-xl cursor-pointer"
              />
            </div>
          </div>
          <Modal
            centered
            title="Filter"
            open={showMobileFilter}
            onCancel={() => setShowMobileFilter(false)}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            data-cy="talent-acquisition-job-candidate-search-modal-filter"
            footer={
              <div id="talent-acquisition-candidate-search-options-div-modal-footer" data-cy="talent-acquisition-candidate-search-options-div-modal-footer" className="flex justify-center items-center space-x-4">
                <Button
                  type="default"
                  className="px-3"
                  onClick={() => setShowMobileFilter(false)}
                  id="talent-acquisition-job-candidate-search-button-mobile-cancel"
                  data-cy="talent-acquisition-job-candidate-search-button-mobile-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  className="px-3"
                  id="talent-acquisition-job-candidate-search-button-mobile-apply"
                  data-cy="talent-acquisition-job-candidate-search-button-mobile-apply"
                >
                  Filter
                </Button>
              </div>
            }
            width="90%"
          >
            {Filters}
          </Modal>
        </>
      ) : (
        Filters
      )}
    </div>
  );
};

export default SearchOptions;
