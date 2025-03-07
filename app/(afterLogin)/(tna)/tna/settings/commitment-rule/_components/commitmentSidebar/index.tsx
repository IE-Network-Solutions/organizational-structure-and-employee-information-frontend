import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { Col, Flex, Form, Input, InputNumber, Row } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import React, { useEffect } from 'react';
import AddFormFieldsButton from '@/components/common/formButtons/addFormFieldsButton';
import RemoveFormFieldButton from '@/components/common/formButtons/removeFormFieldButton';
import { useSetTnaCommitment } from '@/store/server/features/tna/commitment/mutation';
import { useGetTnaCommitment } from '@/store/server/features/tna/commitment/queries';
import { StoreValue } from 'rc-field-form/lib/interface';

const TnaCommitmentSidebar = () => {
  const {
    isShowCommitmentSidebar: isShow,
    setIsShowCommitmentSidebar: setIsShow,
    tnaCommitmentId,
    setTnaCommitmentId,
  } = useTnaSettingsStore();
  const { mutate: setCommitment, isLoading, isSuccess } = useSetTnaCommitment();
  const { data, isFetching, refetch } = useGetTnaCommitment(
    { filter: { id: [tnaCommitmentId] } },
    false,
    false,
  );

  const [form] = Form.useForm();

  useEffect(() => {
    if (tnaCommitmentId) {
      refetch();
    }
  }, [tnaCommitmentId]);

  useEffect(() => {
    if (data?.items?.length) {
      form.setFieldValue('rules', [...data.items]);
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
      label: tnaCommitmentId ? <span>Edit</span> : <span>Create</span>,
      key: 'create',
      className: 'h-14',
      type: 'primary',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => {
        form.submit();
      },
    },
  ];

  const onClose = () => {
    form.resetFields();
    setTnaCommitmentId(null);
    setIsShow(false);
  };

  const onFinish = () => {
    const value = form.getFieldsValue();
    if (!tnaCommitmentId) {
      if (!!value['rules']?.length) {
        setCommitment(value['rules']);
      }
    } else {
      if (!!value['rules']?.length && data) {
        setCommitment([{ ...data.items[0], ...value['rules'][0] }]);
      }
    }
  };

  const validateMinMAxAmount = (
    getFieldValue: (name: (string | number)[]) => StoreValue,
    name: number,
  ) => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    validator() {
      const max = getFieldValue(['rules', name, 'amountMax']);
      const min = getFieldValue(['rules', name, 'amountMin']);
      if (!(min && max) || min <= max) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('Invalid Amount'));
    },
  });

  return (
    isShow && (
      <CustomDrawerLayout
        open={isShow}
        onClose={() => onClose()}
        modalHeader={
          <CustomDrawerHeader className="flex justify-center">
            {tnaCommitmentId ? (
              <span> Edit Commitment Rule</span>
            ) : (
              <span> Add Commitment Rule</span>
            )}
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          form={form}
          onFinish={onFinish}
          disabled={isLoading || isFetching}
          initialValues={{ rules: [{}] }}
        >
          <Form.List name="rules">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <React.Fragment key={key}>
                    <Flex className="w-full" gap={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Name"
                        rules={[{ required: true, message: 'Required' }]}
                        className="form-item flex-1"
                      >
                        <Input className="control" />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <RemoveFormFieldButton
                          onClick={() => {
                            remove(name);
                          }}
                        />
                      ) : null}
                    </Flex>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item"
                    >
                      <Input.TextArea
                        className="control-tarea"
                        rows={6}
                        placeholder="Enter the Description of the commitment rule"
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'amountMin']}
                          label="Amount Min"
                          rules={[
                            { required: true, message: 'Required' },
                            ({ getFieldValue }) =>
                              validateMinMAxAmount(getFieldValue, name),
                          ]}
                          dependencies={[['rules', name, 'amountMax']]}
                          className="form-item"
                        >
                          <InputNumber
                            min={0}
                            className="control-number"
                            placeholder="0.00"
                            suffix="$"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'amountMax']}
                          label="Amount Max"
                          rules={[
                            { required: true, message: 'Required' },
                            ({ getFieldValue }) =>
                              validateMinMAxAmount(getFieldValue, name),
                          ]}
                          dependencies={[['rules', name, 'amountMin']]}
                          className="form-item"
                        >
                          <InputNumber
                            min={0}
                            className="control-number"
                            placeholder="0.00"
                            suffix="$"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      name={[name, 'commitmentPeriodDays']}
                      label="Commitment Period "
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item"
                    >
                      <InputNumber
                        min={0}
                        className="control-number"
                        placeholder="0.00"
                        suffix="Days"
                      />
                    </Form.Item>
                    {!tnaCommitmentId && (
                      <Form.Item>
                        <div className="my-4 border-t border-gray-200"></div>
                      </Form.Item>
                    )}
                  </React.Fragment>
                ))}

                {!tnaCommitmentId && (
                  <Form.Item>
                    <AddFormFieldsButton
                      label="Add Rule"
                      onClick={() => {
                        add();
                      }}
                    />
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default TnaCommitmentSidebar;
