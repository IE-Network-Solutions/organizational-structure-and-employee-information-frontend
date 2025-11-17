import React from 'react';
import { Button, Col, DatePicker, Input, Modal, Row, Select } from 'antd';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
import {
  useGetStages,
  useGetTalentPoolCategory,
} from '@/store/server/features/recruitment/candidate/queries';

import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LuSettings2 } from 'react-icons/lu';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters = () => {
  const {
    searchParams,
    setCurrentPage,
    setSearchParams,
    showMobileFilter,
    setShowMobileFilter,
  } = useTalentPoolStore();
  const { data: categoryList } = useGetTalentPoolCategory();
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

  const handleCategoryChange = (value: string) => {
    onSelectChange(value, 'talentPoolCategory');
    setCurrentPage(1);
  };

  const handleStageChange = (value: string) => {
    onSelectChange(value, 'stages');
    setCurrentPage(1);
  };

  const Filters = (
    <Row data-cy="talent-acquisition-talent-pool-filter-row" gutter={[16, 16]}>
      <Col data-cy="talent-acquisition-talent-pool-filter-col-search" lg={6} md={12} sm={24} xs={24}>
        <Input
         id={`inputSearchByNameTop${searchParams?.search || ''}`}
          data-cy="talent-acquisition-talent-pool-filter-input-search"
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

      <Col data-cy="talent-acquisition-talent-pool-filter-col-date" lg={6} md={12} sm={24} xs={24}>
        <RangePicker
            id={`inputDateRange${searchParams.date_range}`}
          data-cy="talent-acquisition-talent-pool-filter-date-picker"
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

      <Col data-cy="talent-acquisition-talent-pool-filter-col-category" lg={6} md={12} sm={24} xs={24}>
        <Select
          id={`selectCategory${searchParams?.talentPoolCategory}`}
          data-cy="talent-acquisition-talent-pool-filter-select-category"
          placeholder="Select Category"
          onChange={handleCategoryChange}
          value={searchParams?.talentPoolCategory || undefined}
          allowClear
          className="w-full h-14"
        >
          {categoryList &&
            categoryList?.items?.map((category: any) => (
              <Option key={category?.id} value={category?.id} id={`talent-acquisition-talent-pool-filter-option-category-${category?.id}`} data-cy={`talent-acquisition-talent-pool-filter-option-category-${category?.id}`}>
                {category?.title}
              </Option>
            ))}
        </Select>
      </Col>

      <Col data-cy="talent-acquisition-talent-pool-filter-col-stage" lg={6} md={12} sm={24} xs={24}>
        <Select
          id={`selectStage${searchParams?.stages}`}
          data-cy="talent-acquisition-talent-pool-filter-select-stage"
          placeholder="Select Stage"
          onChange={handleStageChange}
          value={searchParams?.stages || undefined}
          allowClear
          className="w-full h-14"
        >
          {stageList &&
            stageList?.items?.map((item: any) => (
              <Option key={item?.id} value={item?.id} id={`talent-acquisition-talent-pool-filter-option-stage-${item?.id}`} data-cy={`talent-acquisition-talent-pool-filter-option-stage-${item?.id}`}>
                {item?.title}
              </Option>
            ))}
        </Select>
      </Col>
    </Row>
  );

  return (
    <div id="talent-acquisition-talent-pool-filter-div-container" data-cy="talent-acquisition-talent-pool-filter-div-container" className="my-3">
      {isMobile || isTablet ? (
        <>
          <div id="talent-acquisition-talent-pool-filter-div-mobile-search" data-cy="talent-acquisition-talent-pool-filter-div-mobile-search" className="flex justify-end m-2 space-x-4">
            <Input
              id="talent-acquisition-talent-pool-filter-input-search-mobile"
              data-cy="talent-acquisition-talent-pool-filter-input-search-mobile"
              placeholder="Search employee"
              allowClear
              className="h-14 text-md placeholder:text-gray-400"
              value={searchParams?.search || ''}
              onChange={(e) => {
                handleSearchCandidate(e.target.value.trim(), 'search');
                setCurrentPage(1);
              }}
            />
            <div id="talent-acquisition-talent-pool-filter-div-mobile-settings" data-cy="talent-acquisition-talent-pool-filter-div-mobile-settings" className="flex items-center justify-center rounded-xl border-[1px] border-gray-200 py-3 px-5">
              <LuSettings2
                id="talent-acquisition-talent-pool-filter-button-mobile-filter"
                data-cy="talent-acquisition-talent-pool-filter-button-mobile-filter"
                onClick={() => setShowMobileFilter(true)}
                className="text-xl cursor-pointer"
              />
            </div>
          </div>
          <Modal
            data-cy="talent-acquisition-talent-pool-filter-modal-mobile"
            centered
            title="Filter"
            open={showMobileFilter}
            onCancel={() => setShowMobileFilter(false)}
            bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            footer={
              <div id="talent-acquisition-talent-pool-filter-modal-footer" data-cy="talent-acquisition-talent-pool-filter-modal-footer" className="flex justify-center items-center space-x-4">
                <Button
                  id="talent-acquisition-talent-pool-filter-button-cancel"
                  data-cy="talent-acquisition-talent-pool-filter-button-cancel"
                  type="default"
                  className="px-3"
                  onClick={() => setShowMobileFilter(false)}
                >
                  Cancel
                </Button>
                <Button id="talent-acquisition-talent-pool-filter-button-apply" data-cy="talent-acquisition-talent-pool-filter-button-apply" type="primary" className="px-3">
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
        <div id="talent-acquisition-talent-pool-filter-div-desktop" data-cy="talent-acquisition-talent-pool-filter-div-desktop">{Filters}</div>
      )}
    </div>
  );
};

export default Filters;
