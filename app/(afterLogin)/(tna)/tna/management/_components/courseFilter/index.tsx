import { Form, Input } from 'antd';
import { useTnaManagementStore } from '@/store/uistate/features/tna/management';
import { IoSearch } from 'react-icons/io5';
import { CommonObject } from '@/types/commons/commonObject';
import { FC } from 'react';

interface CourseFilterProps {
  onChange: (value: CommonObject) => void;
}

const CourseFilter: FC<CourseFilterProps> = ({ onChange }) => {
  const { courseCategory } = useTnaManagementStore();
  const [form] = Form.useForm();

  const selectedCategory = Form.useWatch('courseCategoryId', form);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        onChange(form.getFieldsValue());
      }}
      id="tnaCourseFilterFormId"
      data-cy="tna-course-filter-form"
      className="w-full"
    >
      <div
        className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 w-full"
        data-cy="tna-course-filter-toolbar"
      >
        <Form.Item
          name="search"
          className="mb-0"
          id="tnaCourseFilterSearchItemId"
          data-cy="tna-course-filter-search-item"
        >
          <div
            className="w-full xl:w-[319px] h-[32px] rounded-[8px] border border-[#D9D9D9] bg-[#ffffff] overflow-hidden flex items-center"
            id="searchCourseFieldId"
            data-cy="search-course-field"
          >
            <Input
              bordered={false}
              placeholder="Search"
              className="h-full bg-transparent px-3 text-[16px] font-semibold text-[#262626] placeholder:text-[#BFBFBF] placeholder:font-semibold"
              data-cy="tna-course-filter-search-input"
            />
            <div
              className="w-[38px] h-full border-l border-[#D9D9D9] flex items-center justify-center shrink-0"
              data-cy="tna-course-filter-search-icon-wrap"
            >
              <IoSearch
                className="text-[#595959]"
                size={18}
                data-cy="tna-course-filter-search-icon"
              />
            </div>
          </div>
        </Form.Item>

        <Form.Item name="courseCategoryId" className="mb-0 hidden">
          <Input />
        </Form.Item>

        <div
          className="w-full xl:w-[430px] overflow-x-auto pb-1 xl:pb-0 scrollbar-hide"
          id="tnaCourseFilterCategoriesId"
          data-cy="tna-course-filter-categories-scroll"
        >
          <div
            className="flex gap-2 items-center flex-nowrap min-w-max"
            data-cy="tna-course-filter-categories-row"
          >
            <div
              onClick={() => {
                form.setFieldValue('courseCategoryId', undefined);
                onChange(form.getFieldsValue());
              }}
              className={`cursor-pointer h-[30px] px-4 rounded-[6px] border text-[12px] leading-[28px] transition-colors whitespace-nowrap shrink-0 ${
                !selectedCategory
                  ? 'bg-[#ECECEC] border-[#D9D9D9] text-[#595959]'
                  : 'bg-[#F5F5F5] border-[#D9D9D9] text-[#595959] hover:bg-[#F0F0F0]'
              }`}
              id="tnaCourseFilterCategoryAllId"
              data-cy="tna-course-filter-category-all"
            >
              All
            </div>
            {courseCategory.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  form.setFieldValue('courseCategoryId', cat.id);
                  onChange(form.getFieldsValue());
                }}
                className={`cursor-pointer h-[30px] px-4 rounded-[6px] border text-[12px] leading-[28px] transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#ECECEC] border-[#D9D9D9] text-[#595959]'
                    : 'bg-[#F5F5F5] border-[#D9D9D9] text-[#595959] hover:bg-[#F0F0F0]'
                }`}
                id={`tnaCourseFilterCategory${cat.id}Id`}
                data-cy={`tna-course-filter-category-${cat.id}`}
              >
                {cat.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Form>
  );
};

export default CourseFilter;
