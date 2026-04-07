import { Flex, Form, Input, Select, Tooltip } from 'antd';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatToOptions } from '@/helpers/formatTo';
import { IoSearch } from 'react-icons/io5';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';
import { IoMdSwitch } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CourseFilterProps {
  onChange: (value: CommonObject) => void;
}

const CourseFilter: FC<CourseFilterProps> = ({ onChange }) => {
  const { courseCategory } = useTnaManagementStore();
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();

  return (
    <Form
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
      id="tnaCourseFilterFormId"
      data-cy="tna-course-filter-form"
    >
      <Flex
        gap={16}
        vertical={isMobile}
        style={{ width: '100%' }}
        id="tnaCourseFilterFlexId"
        data-cy="tna-course-filter-flex"
      >
        {isMobile ? (
          <div
            className="flex gap-2"
            id="tnaCourseFilterMobileId"
            data-cy="tna-course-filter-mobile"
          >
            {/* Search input first on mobile */}
            <Form.Item
              name="search"
              style={{ width: '100%' }}
              id="tnaCourseFilterSearchItemMobileId"
              data-cy="tna-course-filter-search-item-mobile"
            >
              <Input
                id="searchCourseFieldId"
                data-cy="search-course-field"
                className="control w-full m-0"
                placeholder="Search Course"
                allowClear
                suffix={<IoSearch size={18} />}
              />
            </Form.Item>

            <Form.Item
              name="courseCategoryId"
              id="tnaCourseFilterCategoryItemMobileId"
              data-cy="tna-course-filter-category-item-mobile"
            >
              <Tooltip
                title="Filter by Category"
                id="tnaCourseFilterCategoryTooltipMobileId"
                data-cy="tna-course-filter-category-tooltip-mobile"
              >
                <Select
                  className="control m-0 h-[54px] w-[48px] mx-auto p-0"
                  placeholder=""
                  dropdownMatchSelectWidth={false}
                  id="tnaCourseFilterCategorySelectMobileId"
                  data-cy="tna-course-filter-category-select-mobile"
                  suffixIcon={
                    <div
                      className="flex items-center justify-center w-full h-full"
                      id="tnaCourseFilterCategoryIconMobileId"
                      data-cy="tna-course-filter-category-icon-mobile"
                    >
                      <IoMdSwitch
                        size={20}
                        data-cy="tna-course-filter-category-icon-mobile-icon"
                        id="tnaCourseFilterCategoryIconMobileIconId"
                      />
                    </div>
                  }
                  allowClear
                  options={formatToOptions(courseCategory, 'title', 'id')}
                />
              </Tooltip>
            </Form.Item>
          </div>
        ) : (
          <>
            {/* Normal order on desktop */}
            <Form.Item
              name="courseCategoryId"
              id="tnaCourseFilterCategoryItemId"
              data-cy="tna-course-filter-category-item"
            >
              <Select
                className="control w-full m-0"
                allowClear
                placeholder="By Category"
                id="courseCategoryDropDownOptionId"
                data-cy="course-category-dropdown-option"
                options={formatToOptions(courseCategory, 'title', 'id')}
              />
            </Form.Item>

            <Form.Item
              name="search"
              style={{ width: '100%' }}
              id="tnaCourseFilterSearchItemId"
              data-cy="tna-course-filter-search-item"
            >
              <Input
                id="searchCourseFieldId"
                data-cy="search-course-field"
                className="control w-full m-0"
                placeholder="Search Course"
                allowClear
                suffix={<IoSearch size={18} />}
              />
            </Form.Item>
          </>
        )}
      </Flex>
    </Form>
  );
};

export default CourseFilter;
