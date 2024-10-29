import { Flex, Form, Input, Select } from 'antd';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatToOptions } from '@/helpers/formatTo';
import { IoSearch } from 'react-icons/io5';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';

interface CourseFilterProps {
  onChange: (value: CommonObject) => void;
}

const CourseFilter: FC<CourseFilterProps> = ({ onChange }) => {
  const { courseCategory } = useTnaManagementStore();
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
    >
      <Flex gap={16}>
        <Form.Item name="courseCategoryId">
          <Select
            className="control w-[170px] m-0"
            allowClear={true}
            placeholder="By Category"
            id="courseCategoryDropDownOptionId"
            options={formatToOptions(courseCategory, 'title', 'id')}
          />
        </Form.Item>
        <Form.Item name="search">
          <Input
            id="searchCourseFieldId"
            className="control w-[300px] m-0"
            placeholder="Search Course"
            allowClear={true}
            suffix={<IoSearch size={18} />}
          />
        </Form.Item>
      </Flex>
    </Form>
  );
};

export default CourseFilter;
