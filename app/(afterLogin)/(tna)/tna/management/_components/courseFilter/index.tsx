import { Flex, Form, Input, Select, Tooltip } from 'antd';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatToOptions } from '@/helpers/formatTo';
import { IoSearch } from 'react-icons/io5';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';
import { IoMdSwitch } from 'react-icons/io';
import { useIsMobile } from '@/components/common/hooks/useIsMobile';

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
    >
      <Flex gap={16} vertical={isMobile} style={{ width: '100%' }}>
        {isMobile ? (
          <div className="flex gap-2">
            {/* Search input first on mobile */}
            <Form.Item name="search" style={{ width: '100%' }}>
              <Input
                id="searchCourseFieldId"
                className="control w-full m-0"
                placeholder="Search Course"
                allowClear
                suffix={<IoSearch size={18} />}
              />
            </Form.Item>

            <Form.Item name="courseCategoryId">
              <Tooltip title="Filter by Category">
                <Select
                  className="control m-0 h-[54px] w-[48px] mx-auto p-0"
                  placeholder=""
                  dropdownMatchSelectWidth={false}
                  suffixIcon={
                    <div className="flex items-center justify-center w-full h-full">
                      <IoMdSwitch size={20} />
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
            <Form.Item name="courseCategoryId">
              <Select
                className="control w-full m-0"
                allowClear
                placeholder="By Category"
                id="courseCategoryDropDownOptionId"
                options={formatToOptions(courseCategory, 'title', 'id')}
              />
            </Form.Item>

            <Form.Item name="search" style={{ width: '100%' }}>
              <Input
                id="searchCourseFieldId"
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
