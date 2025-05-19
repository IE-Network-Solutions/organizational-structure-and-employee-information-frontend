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
      className: 'h-12',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: tnaCategoryId ? <span>Edit</span> : <span> Create</span>,
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
          <CustomDrawerHeader className="flex justify-start text-xl font-extrabold px-2">
            {tnaCategoryId ? (
              <span>Edit TNA Category</span>
            ) : (
              <span>Add TNA Category</span>
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
        customMobileHeight="62vh"
      >
        <Spin spinning={isLoading || isFetching}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            className="p-2"
            requiredMark={CustomLabel}
          >
            <Form.Item
              name="name"
              label="TNA Name"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input id="tnaCategoryNameFieldId" className="control h-10" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
            >
              <Input.TextArea
                id="tnaCategoryDescriptionFieldId"
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

export default TnaCategorySidebar;
