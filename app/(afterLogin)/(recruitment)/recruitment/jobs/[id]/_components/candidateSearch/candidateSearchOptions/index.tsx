import { useEmployeeDepartments } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Modal,
  Popover,
  Row,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import WhatYouNeed from '../whatYouNeed';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuSettings2, LuFilter } from 'react-icons/lu';
import { LocationType } from '@/types/enumTypes';
import { CloseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface OptionParams {
  jobId?: string;
  /** When true, only render the filter row (no mobile header/modal). Used inside card toolbar. */
  embedded?: boolean;
}

const SearchOptions: React.FC<OptionParams> = ({ jobId, embedded = false }) => {
  void embedded;
  const {
    searchParams,
    setSearchParams,
    currentPage,
    pageSize,
    showMobileFilter,
    setShowMobileFilter,
  } = useCandidateState();
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { isMobile, isTablet } = useIsMobile();
  const useFilterModal = !!jobId;

  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: jobList } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );
  const { data: stageList } = useGetStages();

  useEffect(() => {
    if (filterModalOpen || showMobileFilter) {
      const [startStr, endStr] = (searchParams?.dateRange || '').split(' to ');
      form.setFieldsValue({
        department: searchParams?.selectedDepartment || undefined,
        job: searchParams?.selectedJob || undefined,
        status: searchParams?.selectedStage || undefined,
        type: undefined,
        date: startStr && endStr ? [dayjs(startStr), dayjs(endStr)] : undefined,
      });
    }
  }, [filterModalOpen, showMobileFilter, searchParams, form]);

  const handleResetFilter = () => {
    form.resetFields();
    setSearchParams('dateRange', '');
    setSearchParams('selectedJob', '');
    setSearchParams('selectedDepartment', '');
    setSearchParams('selectedStage', '');
  };

  const handleSaveFilter = () => {
    const values = form.getFieldsValue();
    if (values.date && values.date.length === 2) {
      const dateRange = `${dayjs(values.date[0]).format('YYYY-MM-DD')} to ${dayjs(values.date[1]).format('YYYY-MM-DD')}`;
      setSearchParams('dateRange', dateRange);
    } else {
      setSearchParams('dateRange', '');
    }
    setSearchParams('selectedJob', values.job ?? '');
    setSearchParams('selectedDepartment', values.department ?? '');
    setSearchParams('selectedStage', values.status ?? '');
    setFilterModalOpen(false);
    setShowMobileFilter(false);
  };

  const filterModalTitle = (
    <div data-cy="talent-acquisition-job-candidate-search-filter-modal-title-wrap">
      <div
        className="text-lg font-semibold text-gray-900"
        data-cy="talent-acquisition-job-candidate-search-filter-modal-title"
      >
        Filter
      </div>
      <div
        className="text-sm font-normal text-gray-500 mt-0.5"
        data-cy="talent-acquisition-job-candidate-search-filter-modal-subtitle"
      >
        Select All filters that apply
      </div>
    </div>
  );

  const filterFormContent = (
    <Form form={form} layout="vertical" className="mt-2 min-w-0 max-w-full">
      <Row gutter={16} className="!max-w-full">
        <Col xs={24} sm={12}>
          <Form.Item name="department" label="Department">
            <Select
              placeholder="Select department"
              allowClear
              className="w-full h-10"
              data-cy="talent-acquisition-job-candidate-search-select-department"
            >
              {EmployeeDepartment?.map((item: any) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="job" label="Job">
            <Select
              placeholder="Select job"
              allowClear
              className="w-full h-10"
              disabled={!!jobId}
              data-cy="talent-acquisition-job-candidate-search-select-job"
            >
              {jobList?.items?.map((job: any) => (
                <Option key={job?.id} value={job?.id}>
                  {job?.jobTitle}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="status" label="Status">
            <Select
              placeholder="Select status"
              allowClear
              className="w-full h-10"
              data-cy="talent-acquisition-job-candidate-search-select-stage"
            >
              {stageList?.items?.map((item: any) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="type" label="Type">
            <Select
              placeholder="Select type"
              allowClear
              className="w-full h-10"
              data-cy="talent-acquisition-job-candidate-search-select-type"
            >
              {Object.values(LocationType).map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} span={24}>
          <Form.Item name="date" label="Date">
            <RangePicker
              className="w-full h-10 [&_.ant-picker]:!flex [&_.ant-picker]:!flex-nowrap [&_.ant-picker-input>input]:!min-w-0"
              allowClear
              getPopupContainer={(triggerNode) =>
                triggerNode.parentElement || document.body
              }
              data-cy="talent-acquisition-job-candidate-search-date-picker"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  const filterModalFooter = (
    <div
      className="flex justify-end gap-2"
      data-cy="talent-acquisition-job-candidate-search-filter-modal-footer"
    >
      <Button
        type="default"
        onClick={handleResetFilter}
        className="border-gray-300 text-gray-700"
        data-cy="talent-acquisition-jobs-filter-modal-reset"
      >
        Reset
      </Button>
      <Button
        type="primary"
        onClick={handleSaveFilter}
        className="!bg-[#6366F1] hover:!bg-[#4F46E5] border-0"
        data-cy="talent-acquisition-jobs-filter-modal-save"
      >
        Save Filter
      </Button>
    </div>
  );

  const openFilter = () => {
    if (isMobile || isTablet) {
      setShowMobileFilter(true);
    } else {
      setFilterModalOpen(true);
    }
  };

  const closeFilter = () => {
    setFilterModalOpen(false);
    setShowMobileFilter(false);
  };

  const handleDepartmentChange = (value: string) =>
    setSearchParams('selectedDepartment', value ?? '');
  const handleJobChange = (value: string) =>
    setSearchParams('selectedJob', value ?? '');
  const handleStageChange = (value: string) =>
    setSearchParams('selectedStage', value ?? '');
  const handleSearchByDateRange = (
    dates: [dayjs.Dayjs, dayjs.Dayjs] | null,
  ) => {
    if (dates && dates.length === 2) {
      const dateRange = `${dayjs(dates[0]).format('YYYY-MM-DD')} to ${dayjs(dates[1]).format('YYYY-MM-DD')}`;
      setSearchParams('dateRange', dateRange);
    } else {
      setSearchParams('dateRange', '');
    }
  };

  const inlineFilters = (
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
              value={searchParams?.selectedJob || undefined}
              allowClear
              className="w-full h-14"
            >
              {jobList?.items?.map((job: any) => (
                <Option key={job?.id} value={job?.id}>
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
              value={searchParams?.selectedDepartment || undefined}
              allowClear
              className="w-full h-14"
            >
              {EmployeeDepartment?.map((item: any) => (
                <Option key={item?.id} value={item?.id}>
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
              value={searchParams?.selectedStage || undefined}
              allowClear
              className="w-full h-14"
            >
              {stageList?.items?.map((item: any) => (
                <Option key={item?.id} value={item?.id}>
                  {item?.title}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  return (
    <div
      id="talent-acquisition-candidate-search-options-div-container"
      data-cy="talent-acquisition-candidate-search-options-div-container"
      className={useFilterModal ? '' : 'my-3'}
    >
      {useFilterModal ? (
        <>
          {isMobile || isTablet ? (
            <>
              <Button
                icon={<LuFilter className="w-4 h-4" />}
                className="!h-11 !border-gray-300 text-gray-700"
                onClick={openFilter}
                data-cy="talent-acquisition-job-candidate-search-button-filter"
              >
                Filter
              </Button>
              <Modal
                title={filterModalTitle}
                open={showMobileFilter}
                onCancel={closeFilter}
                footer={filterModalFooter}
                centered
                width="90%"
                closeIcon={<CloseOutlined className="text-gray-500" />}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
                data-cy="talent-acquisition-job-candidate-search-modal-filter"
              >
                {filterFormContent}
              </Modal>
            </>
          ) : (
            <Popover
              open={filterModalOpen}
              onOpenChange={(open) => {
                if (!open) setFilterModalOpen(false);
              }}
              trigger="click"
              placement="bottomRight"
              align={{ offset: [0, 8] }}
              content={
                <div
                  className="w-[560px] max-w-[90vw] max-h-[70vh] overflow-y-auto overflow-x-hidden min-w-0"
                  data-cy="talent-acquisition-job-candidate-search-modal-filter"
                >
                  {filterModalTitle}
                  {filterFormContent}
                  <div
                    className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200"
                    data-cy="talent-acquisition-job-candidate-search-filter-modal-actions"
                  >
                    <Button
                      type="default"
                      onClick={handleResetFilter}
                      className="border-gray-300 text-gray-700"
                      data-cy="talent-acquisition-jobs-filter-modal-reset"
                    >
                      Reset
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        handleSaveFilter();
                        setFilterModalOpen(false);
                      }}
                      className="!bg-[#6366F1] hover:!bg-[#4F46E5] border-0"
                      data-cy="talent-acquisition-jobs-filter-modal-save"
                    >
                      Save Filter
                    </Button>
                  </div>
                </div>
              }
            >
              <Button
                icon={<LuFilter className="w-4 h-4" />}
                className="!h-11 !border-gray-300 text-gray-700"
                onClick={() => setFilterModalOpen(true)}
                data-cy="talent-acquisition-job-candidate-search-button-filter"
              >
                Filter
              </Button>
            </Popover>
          )}
        </>
      ) : isMobile || isTablet ? (
        <>
          <div
            id="talent-acquisition-candidate-search-options-div-mobile-header"
            data-cy="talent-acquisition-candidate-search-options-div-mobile-header"
            className="flex justify-end m-2 space-x-4"
          >
            <WhatYouNeed />
            <div
              id="talent-acquisition-candidate-search-options-div-filter-button"
              data-cy="talent-acquisition-candidate-search-options-div-filter-button"
              className="flex items-center justify-center rounded-lg border-[1px] border-gray-200 p-3"
            >
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
            title={filterModalTitle}
            open={showMobileFilter}
            onCancel={() => setShowMobileFilter(false)}
            footer={filterModalFooter}
            bodyStyle={{
              maxHeight: '70vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
            data-cy="talent-acquisition-job-candidate-search-modal-filter"
            width={480}
            style={{ maxWidth: '90vw' }}
            closeIcon={<CloseOutlined className="text-gray-500" />}
          >
            <div
              className="min-w-0 max-w-full overflow-x-hidden"
              data-cy="talent-acquisition-job-candidate-search-filter-modal-body"
            >
              {filterFormContent}
            </div>
          </Modal>
        </>
      ) : (
        inlineFilters
      )}
    </div>
  );
};

export default SearchOptions;
