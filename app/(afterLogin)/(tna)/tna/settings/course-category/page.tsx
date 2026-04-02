'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Spin } from 'antd';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import { useSetCourseCategory } from '@/store/server/features/tna/courseCategory/mutation';
import CourseCategoryCard from './_components/categoryCard';
import { CourseCategory } from '@/types/tna/course';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomLabel from '@/components/form/customLabel/customLabel';

const TnaCourseCategoryPage = () => {
  const { data, isFetching } = useGetCourseCategory({});
  const { mutate: setCourseCategory, isLoading: isSaving } =
    useSetCourseCategory();

  const [form] = Form.useForm();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const selectedCategory: CourseCategory | null = useMemo(() => {
    const items = data?.items ?? [];
    if (!selectedCategoryId) return null;
    return items.find((item) => item.id === selectedCategoryId) ?? null;
  }, [data?.items, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategory) {
      form.setFieldsValue({
        title: selectedCategory.title,
        description: selectedCategory.description ?? '',
      });
    } else {
      form.resetFields();
    }
  }, [selectedCategoryId, selectedCategory, form]);

  const handleCancel = () => {
    setSelectedCategoryId(null);
    form.resetFields();
  };

  const onFinish = (values: { title: string; description?: string }) => {
    const payload: Array<Partial<CourseCategory>> = [
      {
        ...(selectedCategoryId ? { id: selectedCategoryId } : {}),
        title: values.title,
        description: values.description ?? '',
      },
    ];

    setCourseCategory(payload, {
      onSuccess: () => {
        setSelectedCategoryId(null);
        form.resetFields();
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Error';

        NotificationMessage.error({
          message: 'Error',
          description: errorMessage,
        });
      },
    });
  };

  const isEditing = !!selectedCategoryId;

  return (
    <div id="tnaCourseCategoryPageId" data-cy="tna-course-category-page">
      <div className="flex gap-5" data-cy="tna-course-category-two-column">
        {/* Left: category list — capped at 60% of the content area */}
        <div
          className="w-[60%] border border-[#D9D9D9] rounded-lg bg-white p-4"
          data-cy="tna-course-category-list-container"
        >
          {isFetching ? (
            <div
              className="flex items-center justify-center min-h-[300px]"
              data-cy="tna-course-category-page-spinner"
            >
              <Spin spinning />
            </div>
          ) : (
            <div
              className="flex flex-col gap-3"
              data-cy="tna-course-category-list"
            >
              {(data?.items ?? []).map((item) => (
                <CourseCategoryCard
                  key={item.id}
                  item={item}
                  isActive={selectedCategoryId === item.id}
                  onEdit={(category: CourseCategory) =>
                    setSelectedCategoryId(category.id)
                  }
                  onDeleted={(deletedId: string) => {
                    if (deletedId === selectedCategoryId)
                      setSelectedCategoryId(null);
                  }}
                  data-cy={`tna-course-category-card-${item.id}`}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="flex-1 self-start border border-[#D9D9D9] rounded-lg bg-white p-5"
          data-cy="tna-course-category-form-container"
        >
          <Form
            form={form}
            requiredMark={CustomLabel}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ title: '', description: '' }}
            className="[&_.ant-form-item-label]:pb-2"
            data-cy="tna-course-category-form"
          >
            {/* Name field */}
            <Form.Item
              name="title"
              label={
                <span
                  data-cy="tna-course-category-form-name-label"
                  className="text-[14px] font-normal text-[#030712]"
                >
                  Name
                </span>
              }
              rules={[{ required: true, message: 'Required' }]}
              className="mb-6"
              id="tna-course-category-form-title-item"
              data-cy="tna-course-category-form-title-item"
            >
              <Input
                placeholder="Input"
                className="h-8 rounded-md text-[14px]"
                id="tna-course-category-form-title-input"
                data-cy="tna-course-category-form-title-input"
              />
            </Form.Item>

            {/* Description field */}
            <Form.Item
              name="description"
              label={
                <span
                  data-cy="tna-course-category-form-description-label"
                  className="text-[14px] font-normal text-[#030712]"
                >
                  Description{' '}
                  <span
                    data-cy="tna-course-category-form-description-optional"
                    className="text-[14px] font-normal text-[rgba(0,0,0,0.45)]"
                  >
                    (optional)
                  </span>
                </span>
              }
              className="mb-0"
              id="tna-course-category-form-description-item"
              data-cy="tna-course-category-form-description-item"
            >
              <Input.TextArea
                placeholder="Textarea"
                rows={4}
                className="rounded-md text-[14px]"
                id="tna-course-category-form-description-textarea"
                data-cy="tna-course-category-form-description-textarea"
              />
            </Form.Item>

            {/* Submit / Cancel */}
            <Form.Item className="mb-0 mt-6">
              <div
                className="flex justify-end gap-2"
                data-cy="tna-course-category-form-actions"
              >
                {isEditing && (
                  <Button
                    onClick={handleCancel}
                    className="h-9 px-5 rounded-md text-[14px] font-normal"
                    id="tna-course-category-form-cancel-button"
                    data-cy="tna-course-category-form-cancel-button"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSaving}
                  className="h-9 px-6 rounded-md text-[14px] font-normal"
                  id="tna-course-category-form-submit-button"
                  data-cy="tna-course-category-form-submit-button"
                >
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default TnaCourseCategoryPage;
