import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useEffect } from 'react';
import { useSetCourseCategory } from '@/store/server/features/tna/courseCategory/mutation';
import { useGetCourseCategory } from '@/store/server/features/tna/courseCategory/queries';

const CourseCategorySidebar = () => {
  const {
    courseCategoryId,
    setCourseCategoryId,
    isShowCourseCategorySidebar: isShow,
    setIsShowCourseCategorySidebar: setIsShow,
  } = useTnaSettingsStore();
  const { data, isFetching, refetch } = useGetCourseCategory(
    courseCategoryId ? { filter: { id: [courseCategoryId] } } : {},
    false,
    false,
  );
  const { mutate: setCategory, isLoading, isSuccess } = useSetCourseCategory();
  const [form] = Form.useForm();
  useEffect(() => {
    if (courseCategoryId) {
      refetch();
    }
  }, [courseCategoryId]);

  useEffect(() => {
    if (courseCategoryId && data && data?.items?.length) {
      const item = data.items[0];
      form.setFieldValue('title', item.title);
      form.setFieldValue('description', item.description);
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-12',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: courseCategoryId ? <span>Edit</span> : <span>Create</span>,
      key: 'create',
      className: 'h-12',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    setCourseCategoryId(null);
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    const item = data?.items[0] || {};
    setCategory([
      {
        ...(courseCategoryId && item),
        title: value.title,
        description: value.description,
      },
    ]);
  };

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-start font-extrabold text-xl">
            {courseCategoryId ? (
              <span>Edit Course Category</span>
            ) : (
              <span>Add Course Category</span>
            )}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
          />
        }
        width="400px"
        customMobileHeight="60vh"
      >
        <Spin spinning={isLoading || isFetching}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            requiredMark={CustomLabel}
          >
            <Form.Item
              name="title"
              label="Category Name"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input className="control h-10" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input.TextArea
                className="control-tarea h-28"
                rows={6}
                placeholder="Enter the Description"
              />
            </Form.Item>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default CourseCategorySidebar;
