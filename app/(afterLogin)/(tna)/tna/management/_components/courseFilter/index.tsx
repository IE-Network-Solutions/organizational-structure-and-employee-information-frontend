import { Flex, Form, Input, Select, Tooltip, Modal, Button } from 'antd';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { formatToOptions } from '@/helpers/formatTo';
import { IoSearch } from 'react-icons/io5';
import { CommonObject } from '@/types/commons/commonObject';
import { FC, useState } from 'react';
import { IoMdSwitch } from 'react-icons/io';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CourseFilterProps {
  onChange: (value: CommonObject) => void;
}

const CourseFilter: FC<CourseFilterProps> = ({ onChange }) => {
  const { courseCategory } = useTnaManagementStore();
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempCategoryValue, setTempCategoryValue] = useState<
    string | undefined
  >(undefined);

  const handleFilterModalOpen = () => {
    setTempCategoryValue(form.getFieldValue('courseCategoryId'));
    setIsFilterModalOpen(true);
  };

  const handleFilterModalOk = () => {
    form.setFieldsValue({ courseCategoryId: tempCategoryValue });
    setIsFilterModalOpen(false);
  };

  const handleFilterModalCancel = () => {
    setIsFilterModalOpen(false);
  };

  return (
    <>
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

              <Button
                className="w-[48px] h-[54px] flex items-center justify-center p-0"
                onClick={handleFilterModalOpen}
                icon={<IoMdSwitch size={20} />}
              />
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

      {/* Filter Modal for Mobile */}
      <Modal
        title="Filter Options"
        open={isFilterModalOpen}
        onOk={handleFilterModalOk}
        onCancel={handleFilterModalCancel}
        footer={
          <div className="flex justify-center gap-2">
            <Button onClick={handleFilterModalCancel}>Cancel</Button>
            <Button type="primary" onClick={handleFilterModalOk}>
              Filter
            </Button>
          </div>
        }
      >
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Course Category
          </label>
          <Select
            className="w-full"
            allowClear
            placeholder="Select a category"
            value={tempCategoryValue}
            onChange={(value) => setTempCategoryValue(value)}
            options={formatToOptions(courseCategory, 'title', 'id')}
          />
        </div>
      </Modal>
    </>
  );
};

export default CourseFilter;
