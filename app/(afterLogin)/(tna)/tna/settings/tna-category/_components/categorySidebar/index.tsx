import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Form, Input, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useSetTnaCategory } from '@/store/server/features/tna/category/mutation';
import { useEffect } from 'react';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';

const TnaCategorySidebar = () => {
  const {
    tnaCategoryId,
    setTnaCategoryId,
    isShowTnaCategorySidebar: isShow,
    setIsShowTnaCategorySidebar: setIsShow,
  } = useTnaSettingsStore();
  const { data, isFetching, refetch } = useGetTnaCategory(
    tnaCategoryId ? { filter: { id: [tnaCategoryId] } } : {},
    false,
    false,
  );
  const { mutate: setCategory, isLoading, isSuccess } = useSetTnaCategory();
  const [form] = Form.useForm();
  useEffect(() => {
    if (tnaCategoryId) {
      refetch();
    }
  }, [tnaCategoryId]);

  useEffect(() => {
    if (tnaCategoryId && data && data?.items?.length) {
      const item = data.items[0];
      form.setFieldValue('name', item.name);
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
      className: 'h-14',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: 'Create',
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => form.submit(),
    },
  ];

  const onClose = () => {
    form.resetFields();
    setTnaCategoryId(null);
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    const item = data?.items[0] || {};
    setCategory([
      {
        ...(tnaCategoryId && item),
        name: value.name,
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
          <CustomDrawerHeader className="flex justify-center">
            Add TNA Category
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={isLoading || isFetching}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            requiredMark={CustomLabel}
          >
            <Form.Item
              name="name"
              label="TNA Name"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input className="control" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input.TextArea
                className="control-tarea"
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

export default TnaCategorySidebar;
