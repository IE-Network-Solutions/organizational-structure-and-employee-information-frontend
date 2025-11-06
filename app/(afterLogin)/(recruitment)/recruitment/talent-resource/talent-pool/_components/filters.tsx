import React from 'react';
import { Button, Col, DatePicker, Input, Modal, Row, Select } from 'antd';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
import { useGetStages } from '@/store/server/features/recruitment/candidate/queries';

import dayjs from 'dayjs';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { useEmployeeDepartments } from '@/store/server/features/feedback/category/queries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuSettings2 } from 'react-icons/lu';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters = () => {
  const {
    searchParams,
    page,
    currentPage,
    setCurrentPage,
    setSearchParams,
    showMobileFilter,
    setShowMobileFilter,
  } = useTalentPoolStore();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: jobList } = useGetJobs(
    searchParams?.date_range || '',
    currentPage,
    page,
  );
  const { data: stageList } = useGetStages();
  const { isMobile, isTablet } = useIsMobile();

  const handleSearchCandidate = async (
    value: string | boolean,
    keyValue: keyof typeof searchParams,
  ) => {
    setSearchParams(keyValue, value);
  };

  const onSelectChange = handleSearchCandidate;

  const handleSearchByDateRange = (dates: [any, any] | null) => {
    if (dates && dates.length === 2) {
      const startDate = dayjs(dates[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dates[1]).format('YYYY-MM-DD');
      const dateRange = `${startDate} to ${endDate}`;
      setSearchParams('date_range', dateRange);
    } else {
      setSearchParams('date_range', '');
    }
    setCurrentPage(1);
  };

  const handleJobChange = (value: string) => {
    onSelectChange(value, 'job');
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    onSelectChange(value, 'department');
    setCurrentPage(1);
  };

  const handleStageChange = (value: string) => {
    onSelectChange(value, 'stages');
    setCurrentPage(1);
  };

  const Filters = (
    <Row gutter={[16, 16]} justify="space-between">
      <Col lg={8} sm={24} xs={24}>
        <Input
          id={`inputSearchByNameTop${searchParams?.search || ''}`}
          placeholder="Search by name"
          allowClear
          className="h-14 text-md placeholder:text-gray-400"
          value={searchParams?.search || ''}
          onChange={(e) => {
            handleSearchCandidate(e.target.value.trim(), 'search');
            setCurrentPage(1);
          }}
        />
      </Col>

      <Col lg={16} sm={24} xs={24}>
        <Row gutter={[8, 16]}>
          <Col lg={6} sm={12} xs={24}>
            <RangePicker
              id={`inputDateRange${searchParams.date_range}`}
              onChange={(dates: any) => handleSearchByDateRange(dates)}
              value={
                searchParams.date_range
                  ? (searchParams.date_range
                      .split(' to ')
                      .map((date: string) => dayjs(date)) as [
                      dayjs.Dayjs | null,
                      dayjs.Dayjs | null,
                    ])
                  : null
              }
              className="w-full h-14"
              allowClear
              getPopupContainer={(triggerNode) =>
                (triggerNode as any).parentElement || document.body
              }
            />
          </Col>
          <Col lg={6} sm={12} xs={24}>
            <Select
              id={`selectJobs${searchParams?.job}`}
              placeholder="Select Job"
              onChange={handleJobChange}
              value={searchParams?.job || undefined}
              allowClear
              className="w-full h-14"
            >
              {jobList &&
                jobList?.items?.map((job: any) => (
                  <Option key={job?.id} value={job?.id}>
                    {job?.jobTitle}
                  </Option>
                ))}
            </Select>
          </Col>

          <Col lg={6} sm={12} xs={24}>
            <Select
              id={`selectDepartment${searchParams?.department}`}
              placeholder="Select Department"
              onChange={handleDepartmentChange}
              value={searchParams?.department || undefined}
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
          <Col lg={6} sm={12} xs={24}>
            <Select
              id={`selectStage${searchParams?.stages}`}
              placeholder="Select Stage"
              onChange={handleStageChange}
              value={searchParams?.stages || undefined}
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
  );

  return (
    <div className="my-3">
      {isMobile || isTablet ? (
        <>
          <div className="flex justify-end m-2 space-x-4">
            <Input
              placeholder="Search employee"
              allowClear
              className="h-14 text-md placeholder:text-gray-400"
              value={searchParams?.search || ''}
              onChange={(e) => {
                handleSearchCandidate(e.target.value.trim(), 'search');
                setCurrentPage(1);
              }}
            />
            <div className="flex items-center justify-center rounded-xl border-[1px] border-gray-200 py-3 px-5">
              <LuSettings2
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
            footer={
              <div className="flex justify-center items-center space-x-4">
                <Button
                  type="default"
                  className="px-3"
                  onClick={() => setShowMobileFilter(false)}
                >
                  Cancel
                </Button>
                <Button type="primary" className="px-3">
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
        <>{Filters}</>
      )}
    </div>
  );
};

export default Filters;
