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
      className: 'h-12',
      size: 'large',
      loading: isLoading || isFetching,
      onClick: () => onClose(),
    },
    {
      label: tnaCommitmentId ? <span data-cy="tna-commitment-sidebar-footer-edit-text" id="tnaCommitmentSidebarFooterEditTextId">Edit</span> : <span data-cy="tna-commitment-sidebar-footer-create-text" id="tnaCommitmentSidebarFooterCreateTextId">Create</span>,
      key: 'create',
      className: 'h-12',
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
        data-cy="tna-commitment-sidebar-drawer"
        modalHeader={
          <CustomDrawerHeader className="flex justify-start text-xl font-extrabold px-2" data-cy="tna-commitment-sidebar-header">
            {tnaCommitmentId ? (
              <span data-cy="tna-commitment-sidebar-edit-text" id="tnaCommitmentSidebarEditTextId">Edit Commitment Rule</span>
            ) : (
              <span data-cy="tna-commitment-sidebar-add-text" id="tnaCommitmentSidebarAddTextId"> Add Commitment Rule</span>
            )}
          </CustomDrawerHeader>
        }
        footer={
          <CustomDrawerFooterButton
            className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
            buttons={footerModalItems}
            data-cy="tna-commitment-sidebar-footer"
          />
        }
        width="400px"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          form={form}
          onFinish={onFinish}
          className="p-2"
          disabled={isLoading || isFetching}
          initialValues={{ rules: [{}] }}
          id="tnaCommitmentSidebarFormId"
          data-cy="tna-commitment-sidebar-form"
        >
          <Form.List name="rules" data-cy="tna-commitment-sidebar-list">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <React.Fragment key={key}>
                    <Flex className="w-full" gap={5} id={`tnaCommitmentSidebarNameFlex${key}Id`} data-cy={`tna-commitment-sidebar-name-flex-${key}`}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Name"
                        rules={[{ required: true, message: 'Required' }]}
                        className="form-item flex-1"
                        id={`tnaCommitmentSidebarNameItem${key}Id`}
                        data-cy={`tna-commitment-sidebar-name-item-${key}`}
                      >
                        <Input className="control h-10" id={`tnaCommitmentSidebarNameInput${key}Id`} data-cy={`tna-commitment-sidebar-name-input-${key}`} />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <RemoveFormFieldButton
                          onClick={() => {
                            remove(name);
                          }}
                          data-cy={`tna-commitment-sidebar-remove-button-${key}`}
                        />
                      ) : null}
                    </Flex>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[{ required: true, message: 'Required' }]}
                      className="form-item"
                      id={`tnaCommitmentSidebarDescriptionItem${key}Id`}
                      data-cy={`tna-commitment-sidebar-description-item-${key}`}
                    >
                      <Input.TextArea
                        className="control-tarea h-28"
                        rows={6}
                        placeholder="Enter the Description of the commitment rule"
                        id={`tnaCommitmentSidebarDescriptionTextArea${key}Id`}
                        data-cy={`tna-commitment-sidebar-description-textarea-${key}`}
                      />
                    </Form.Item>
                    <Row gutter={16} id={`tnaCommitmentSidebarAmountRow${key}Id`} data-cy={`tna-commitment-sidebar-amount-row-${key}`}>
                      <Col span={12} id={`tnaCommitmentSidebarAmountMinCol${key}Id`} data-cy={`tna-commitment-sidebar-amount-min-col-${key}`}>
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
                          id={`tnaCommitmentSidebarAmountMinItem${key}Id`}
                          data-cy={`tna-commitment-sidebar-amount-min-item-${key}`}
                        >
                          <InputNumber
                            min={0}
                            className="control-number h-10"
                            placeholder="0.00"
                            suffix="$"
                            id={`tnaCommitmentSidebarAmountMinInput${key}Id`}
                            data-cy={`tna-commitment-sidebar-amount-min-input-${key}`}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12} id={`tnaCommitmentSidebarAmountMaxCol${key}Id`} data-cy={`tna-commitment-sidebar-amount-max-col-${key}`}>
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
                          id={`tnaCommitmentSidebarAmountMaxItem${key}Id`}
                          data-cy={`tna-commitment-sidebar-amount-max-item-${key}`}
                        >
                          <InputNumber
                            min={0}
                            className="control-number h-10"
                            placeholder="0.00"
                            suffix="$"
                            id={`tnaCommitmentSidebarAmountMaxInput${key}Id`}
                            data-cy={`tna-commitment-sidebar-amount-max-input-${key}`}
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
                      id={`tnaCommitmentSidebarPeriodItem${key}Id`}
                      data-cy={`tna-commitment-sidebar-period-item-${key}`}
                    >
                      <InputNumber
                        min={0}
                        className="control-number h-10"
                        placeholder="0.00"
                        suffix="Days"
                        id={`tnaCommitmentSidebarPeriodInput${key}Id`}
                        data-cy={`tna-commitment-sidebar-period-input-${key}`}
                      />
                    </Form.Item>
                    {/* {!tnaCommitmentId && (
                      <Form.Item>
                        <div className="my-4 border-t border-gray-200"></div>
                      </Form.Item>
                    )} */}
                  </React.Fragment>
                ))}

                {!tnaCommitmentId && (
                  <Form.Item id="tnaCommitmentSidebarAddButtonItemId" data-cy="tna-commitment-sidebar-add-button-item">
                    <AddFormFieldsButton
                      label="Add Rule"
                      onClick={() => {
                        add();
                      }}
                      data-cy="tna-commitment-sidebar-add-button"
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
