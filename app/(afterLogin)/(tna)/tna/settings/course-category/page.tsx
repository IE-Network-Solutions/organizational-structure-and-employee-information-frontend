'use client';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Button, Form, Input, Modal, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';
import { useSetCourseCategory } from '@/store/server/features/tna/courseCategory/mutation';
import CourseCategoryCard from './_components/categoryCard';
import { CourseCategory } from '@/types/tna/course';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import EmptyState from '@/components/empty';
import CourseCategoryPageSkeleton from './_components/courseCategoryPageSkeleton';

const PAGE_SIZE = 10;

function useLgUp() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') {
        return () => {};
      }
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () =>
      typeof window !== 'undefined'
        ? window.matchMedia('(min-width: 1024px)').matches
        : true,
    () => true,
  );
}

const TnaCourseCategoryPage = () => {
  const isLgUp = useLgUp();
  const { data, isLoading: isCourseCategoryLoading } = useGetCourseCategory(
    {},
  );
  const { mutate: setCourseCategory, isLoading: isSaving } =
    useSetCourseCategory();

  const courseCategoryCreateRequestedAt = useTnaSettingsStore(
    (s) => s.courseCategoryCreateRequestedAt,
  );

  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const lastCreateSignalRef = useRef(0);

  const selectedCategory: CourseCategory | null = useMemo(() => {
    const items = data?.items ?? [];
    if (!selectedCategoryId) return null;
    return items.find((item) => item.id === selectedCategoryId) ?? null;
  }, [data?.items, selectedCategoryId]);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description ?? '').toLowerCase().includes(q),
    );
  }, [data?.items, search]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [search, data?.items?.length]);

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

  useEffect(() => {
    if (isLgUp) {
      setMobileModalOpen(false);
    }
  }, [isLgUp]);

  useEffect(() => {
    if (isLgUp) {
      setSearch('');
    }
  }, [isLgUp]);

  useEffect(() => {
    if (
      !isLgUp &&
      courseCategoryCreateRequestedAt > 0 &&
      courseCategoryCreateRequestedAt !== lastCreateSignalRef.current
    ) {
      lastCreateSignalRef.current = courseCategoryCreateRequestedAt;
      setSelectedCategoryId(null);
      form.resetFields();
      setMobileModalOpen(true);
    }
  }, [courseCategoryCreateRequestedAt, isLgUp, form]);

  const handleCancel = () => {
    setSelectedCategoryId(null);
    form.resetFields();
  };

  const closeMobileComposer = () => {
    setMobileModalOpen(false);
    handleCancel();
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
        if (!isLgUp) {
          closeMobileComposer();
        } else {
          setSelectedCategoryId(null);
          form.resetFields();
        }
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

  const hasCategoryRows = (data?.items?.length ?? 0) > 0;
  const isSearchFilteredEmpty =
    hasCategoryRows && filteredItems.length === 0;

  const openCreateCategory = () => {
    setSelectedCategoryId(null);
    form.resetFields();
    if (!isLgUp) {
      setMobileModalOpen(true);
    }
  };

  const formFields = (
    <>
      <Form.Item
        name="title"
        label={
          <span
            data-cy="tna-course-category-form-name-label"
            className="text-[13px] lg:text-[14px] font-normal text-[#030712]"
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
          className="h-10 rounded-md text-[13px] lg:text-[14px]"
          id="tna-course-category-form-title-input"
          data-cy="tna-course-category-form-title-input"
        />
      </Form.Item>

      <Form.Item
        name="description"
        label={
          <span
            data-cy="tna-course-category-form-description-label"
            className="text-[13px] lg:text-[14px] font-normal text-[#030712]"
          >
            Description{' '}
            <span
              data-cy="tna-course-category-form-description-optional"
              className="text-[13px] lg:text-[14px] font-normal text-[rgba(0,0,0,0.45)]"
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
          className="rounded-md text-[13px] lg:text-[14px]"
          id="tna-course-category-form-description-textarea"
          data-cy="tna-course-category-form-description-textarea"
        />
      </Form.Item>
    </>
  );

  const desktopForm = (
    <div
      className="hidden lg:block flex-1 self-start border border-[#D9D9D9] rounded-lg bg-white p-5"
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
        {formFields}
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
  );

  return (
    <div id="tnaCourseCategoryPageId" data-cy="tna-course-category-page">
      {isCourseCategoryLoading ? (
        <CourseCategoryPageSkeleton />
      ) : (
        <div
          className="flex flex-col lg:flex-row gap-4 lg:gap-5"
          data-cy="tna-course-category-two-column"
        >
          <div
            className="w-full lg:w-[60%] border border-[#D9D9D9] rounded-lg bg-white p-3 lg:p-4"
            data-cy="tna-course-category-list-container"
          >
            <Input
              allowClear
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<SearchOutlined className="text-[rgba(0,0,0,0.45)]" />}
              className="mb-3 rounded-md text-[13px] lg:hidden"
              data-cy="tna-course-category-search-input"
              id="tnaCourseCategorySearchInputId"
            />
            {filteredItems.length === 0 ? (
              <div
                className="w-full min-h-[200px] flex items-center justify-center"
                data-cy="tna-course-category-list-empty"
                id="tnaCourseCategoryListEmptyId"
              >
                <EmptyState
                  title={
                    isSearchFilteredEmpty
                      ? 'No categories match your search'
                      : 'No course categories yet'
                  }
                  description={
                    isSearchFilteredEmpty
                      ? 'Try a different search term.'
                      : isLgUp
                        ? 'Use the form on the right to create your first category.'
                        : 'Create a category to organize your courses.'
                  }
                  actionText={!isLgUp ? 'Create category' : undefined}
                  onAction={!isLgUp ? openCreateCategory : undefined}
                />
              </div>
            ) : (
              <>
                <div
                  className="flex flex-col gap-3"
                  data-cy="tna-course-category-list"
                >
                  {paginatedItems.map((item) => (
                    <CourseCategoryCard
                      key={item.id}
                      item={item}
                      isActive={selectedCategoryId === item.id}
                      onEdit={(category: CourseCategory) => {
                        setSelectedCategoryId(category.id);
                        if (!isLgUp) {
                          setMobileModalOpen(true);
                        }
                      }}
                      onDeleted={(deletedId: string) => {
                        if (deletedId === selectedCategoryId) {
                          if (!isLgUp) {
                            closeMobileComposer();
                          } else {
                            handleCancel();
                          }
                        }
                      }}
                      data-cy={`tna-course-category-card-${item.id}`}
                    />
                  ))}
                </div>
                {filteredItems.length > PAGE_SIZE && (
                  <div
                    className="flex justify-center mt-4 pt-2 border-t border-[#F0F0F0]"
                    data-cy="tna-course-category-pagination-wrap"
                  >
                    <Pagination
                      size="small"
                      current={page}
                      pageSize={PAGE_SIZE}
                      total={filteredItems.length}
                      onChange={(p) => setPage(p)}
                      showSizeChanger={false}
                      data-cy="tna-course-category-pagination"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {desktopForm}
        </div>
      )}

      {!isLgUp && (
        <Modal
          title={
            <span
              className="text-[15px] font-bold text-[#030712]"
              data-cy="tna-course-category-modal-title"
            >
              {isEditing ? 'Edit Course Category' : 'Create Course Category'}
            </span>
          }
          open={mobileModalOpen}
          onCancel={closeMobileComposer}
          destroyOnClose
          width="min(100%, calc(100vw - 32px))"
          centered
          classNames={{ body: 'pt-2' }}
          footer={
            <div
              className="flex justify-end gap-2"
              data-cy="tna-course-category-modal-footer"
            >
              <Button
                onClick={closeMobileComposer}
                className="h-9 px-5 rounded-md text-[13px] font-normal"
                data-cy="tna-course-category-modal-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                loading={isSaving}
                onClick={() => form.submit()}
                className="h-9 px-6 rounded-md text-[13px] font-normal"
                data-cy="tna-course-category-modal-submit-button"
              >
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </div>
          }
          data-cy="tna-course-category-composer-modal"
        >
          <Form
            form={form}
            requiredMark={CustomLabel}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ title: '', description: '' }}
            className="[&_.ant-form-item-label]:pb-2"
            data-cy="tna-course-category-modal-form"
            id="tnaCourseCategoryModalFormId"
          >
            {formFields}
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default TnaCourseCategoryPage;
