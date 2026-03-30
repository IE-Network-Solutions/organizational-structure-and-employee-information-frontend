import React, { useState, useEffect } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Row,
  Select,
} from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { useTalentPoolStore } from '@/store/uistate/features/recruitment/talentPool';
import {
  useGetStages,
  useGetTalentPoolCategory,
} from '@/store/server/features/recruitment/candidate/queries';
import dayjs from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { DATE_FORMAT } from '@/utils/constants';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Filters = () => {
  const { searchParams, setCurrentPage, setSearchParams } =
    useTalentPoolStore();
  const { data: categoryList } = useGetTalentPoolCategory();
  const { data: stageList } = useGetStages();
  const { isMobile } = useIsMobile();
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [mobileStartDate, setMobileStartDate] = useState<dayjs.Dayjs | null>(
    null,
  );
  const [mobileEndDate, setMobileEndDate] = useState<dayjs.Dayjs | null>(null);

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

  const labelClassName = 'text-sm font-medium text-gray-800 mb-2 block';
  const inputClassName = 'w-full h-10 rounded-md border-gray-300';

  const handleResetFilters = () => {
    setSearchParams('date_range', '');
    setSearchParams('talentPoolCategory', '');
    setSearchParams('stages', '');
    // Also clear local mobile date picker state so UI resets correctly on mobile
    setMobileStartDate(null);
    setMobileEndDate(null);
    setCurrentPage(1);
  };

  // Keep mobile date pickers in sync with the stored date_range string
  useEffect(() => {
    if (searchParams.date_range) {
      const [start, end] = searchParams.date_range
        .split(' to ')
        .map((date: string) => dayjs(date)) as [
        dayjs.Dayjs | null,
        dayjs.Dayjs | null,
      ];
      setMobileStartDate(start);
      setMobileEndDate(end);
    } else {
      setMobileStartDate(null);
      setMobileEndDate(null);
    }
  }, [searchParams.date_range]);

  const filterDropdownContent = (
    <div
      data-cy="talent-acquisition-talent-pool-filter-container"
      className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[360px] max-w-[420px] overflow-hidden"
    >
      {/* Header */}
      <div
        data-cy="talent-acquisition-talent-pool-filter-header"
        className="px-6 pt-5 pb-1 relative"
      >
        <button
          type="button"
          onClick={() => setFilterDropdownOpen(false)}
          className="absolute top-5 right-6 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          aria-label="Close filter"
          data-cy="talent-acquisition-talent-pool-filter-button-close"
        >
          <CloseOutlined className="text-base" />
        </button>
        <h3
          data-cy="talent-acquisition-talent-pool-filter-title"
          className="text-xl font-semibold text-gray-900 pr-8"
        >
          Filter
        </h3>
        <p
          data-cy="talent-acquisition-talent-pool-filter-description"
          className="text-sm text-gray-500 mt-1"
        >
          Select all filters that apply
        </p>
      </div>

      {/* Filter fields */}
      <div
        data-cy="talent-acquisition-talent-pool-filter-fields"
        className="px-6 py-4"
      >
        <Row
          data-cy="talent-acquisition-talent-pool-filter-row"
          gutter={[16, 16]}
        >
          <Col
            span={12}
            data-cy="talent-acquisition-talent-pool-filter-col-category"
          >
            <label
              data-cy="talent-acquisition-talent-pool-filter-label-category"
              className={labelClassName}
            >
              Category
            </label>
            <Select
              id={`selectCategory${searchParams?.talentPoolCategory}`}
              data-cy="talent-acquisition-talent-pool-filter-select-category"
              placeholder="Select Category"
              onChange={handleCategoryChange}
              value={searchParams?.talentPoolCategory || undefined}
              allowClear
              className={inputClassName}
              size="large"
            >
              {categoryList &&
                categoryList?.items?.map((category: any) => (
                  <Option
                    key={category?.id}
                    value={category?.id}
                    id={`talent-acquisition-talent-pool-filter-option-category-${category?.id}`}
                    data-cy={`talent-acquisition-talent-pool-filter-option-category-${category?.id}`}
                  >
                    {category?.title}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col
            span={12}
            data-cy="talent-acquisition-talent-pool-filter-col-stage"
          >
            <label
              data-cy="talent-acquisition-talent-pool-filter-label-stage"
              className={labelClassName}
            >
              Stage
            </label>
            <Select
              id={`selectStage${searchParams?.stages}`}
              data-cy="talent-acquisition-talent-pool-filter-select-stage"
              placeholder="Select Stage"
              onChange={handleStageChange}
              value={searchParams?.stages || undefined}
              allowClear
              className={inputClassName}
              size="large"
            >
              {stageList &&
                stageList?.items?.map((item: any) => (
                  <Option
                    key={item?.id}
                    value={item?.id}
                    id={`talent-acquisition-talent-pool-filter-option-stage-${item?.id}`}
                    data-cy={`talent-acquisition-talent-pool-filter-option-stage-${item?.id}`}
                  >
                    {item?.title}
                  </Option>
                ))}
            </Select>
          </Col>
          <Col
            span={24}
            data-cy="talent-acquisition-talent-pool-filter-col-date"
          >
            {!isMobile && (
              <label
                data-cy="talent-acquisition-talent-pool-filter-label-date"
                className={labelClassName}
              >
                Date
              </label>
            )}
            {!isMobile && (
              <RangePicker
                size="small"
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
                className={inputClassName}
                allowClear
              />
            )}

            {isMobile && (
              <>
                <Form.Item
                  name="startDate"
                  id="time-attendance-history-table-filter-mobile-start-date"
                  data-cy="time-attendance-history-table-filter-mobile-start-date"
                >
                  <label
                    data-cy="talent-acquisition-talent-pool-filter-start-date"
                    className={labelClassName}
                  >
                    Start Date
                  </label>
                  <DatePicker
                    className="w-full h-[40px]"
                    placeholder="Start Date"
                    format={DATE_FORMAT}
                    value={mobileStartDate}
                    onChange={(date) => {
                      setMobileStartDate(date);
                      const start = date;
                      const end = mobileEndDate;
                      handleSearchByDateRange(
                        start && end ? [start, end] : null,
                      );
                    }}
                    id="time-attendance-history-table-filter-mobile-start-date-picker"
                    data-cy="time-attendance-history-table-filter-mobile-start-date-picker"
                  />
                </Form.Item>

                <Form.Item
                  name="endDate"
                  id="time-attendance-history-table-filter-mobile-end-date"
                  data-cy="time-attendance-history-table-filter-mobile-end-date"
                >
                  <label
                    data-cy="talent-acquisition-talent-pool-filter-end-date"
                    className={labelClassName}
                  >
                    End Date
                  </label>
                  <DatePicker
                    className="w-full h-[40px]"
                    placeholder="End Date"
                    format={DATE_FORMAT}
                    value={mobileEndDate}
                    onChange={(date) => {
                      setMobileEndDate(date);
                      const start = mobileStartDate;
                      const end = date;
                      handleSearchByDateRange(
                        start && end ? [start, end] : null,
                      );
                    }}
                    id="time-attendance-history-table-filter-mobile-end-date-picker"
                    data-cy="time-attendance-history-table-filter-mobile-end-date-picker"
                  />
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
      </div>

      {/* Footer */}
      <div
        data-cy="talent-acquisition-talent-pool-filter-footer"
        className="px-6 py-4 flex justify-end gap-2"
      >
        <Button
          type="default"
          onClick={handleResetFilters}
          className="h-8 border-[1px] border-[#d9d9d9] font-normal"
          data-cy="talent-acquisition-talent-pool-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          className="h-8 font-normal"
          onClick={() => setFilterDropdownOpen(false)}
          data-cy="talent-acquisition-talent-pool-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      id="talent-acquisition-talent-pool-filter-div-container"
      data-cy="talent-acquisition-talent-pool-filter-div-container"
      className="flex items-center justify-between py-2"
    >
      <div
        data-cy="talent-acquisition-talent-pool-filter-input-search-container"
      >
        <Input
          id={`inputSearchByNameTop${searchParams?.search || ''}`}
          data-cy="talent-acquisition-talent-pool-filter-input-search"
          placeholder="Search by name"
          allowClear
          className="h-8 max-w-[300px]"
          value={searchParams?.search || ''}
          onChange={(e) => {
            handleSearchCandidate(e.target.value.trim(), 'search');
            setCurrentPage(1);
          }}
          suffix={
            <div
              data-cy="talent-acquisition-talent-pool-filter-input-search-suffix-icon-div"
              className="text-gray-400 border-l p-2"
            >
              <SearchOutlined />
            </div>
          }
        />
      </div>

      <Dropdown
        data-cy="talent-acquisition-talent-pool-filter-div-desktop"
        trigger={['click']}
        open={filterDropdownOpen}
        onOpenChange={setFilterDropdownOpen}
        dropdownRender={() => filterDropdownContent}
      >
        <Button
          className="border border-[#d9d9d9] font-normal text-sm text-[#4d4d4d]"
          icon={<FilterAltOutlinedIcon className="text-[#374151] text-base" />}

        >
          {!isMobile && 'Filter'}
        </Button>
      </Dropdown>
    </div>
  );
};

export default Filters;
