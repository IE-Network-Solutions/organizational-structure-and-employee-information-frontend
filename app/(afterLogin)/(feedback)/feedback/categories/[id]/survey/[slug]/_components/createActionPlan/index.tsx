import React, { useEffect } from 'react';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { FaPlus } from 'react-icons/fa';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import {
  useCreateActionPlan,
  useUpdateActionPlan,
} from '@/store/server/features/organization-development/categories/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { TiDeleteOutline } from 'react-icons/ti';
import Image from 'next/image';
import {
  useGetActionPlanById,
  useGetAllActionPlan,
} from '@/store/server/features/organization-development/categories/queries';
import { GENDER_NEUTRAL_AVATAR_URL } from '@/constants/publicImageUrls';

const { Option } = Select;

const CreateActionPlan = (props: any) => {
  const [form] = Form.useForm();
  const {
    numberOfActionPlan,
    setNumberOfActionPlan,
    selectedEditActionPlan,
    setSelectedEditActionPlan,
    open,
    setOpen,
  } = useOrganizationalDevelopment();
  const { mutate: createActionPlanData, isLoading: createActionPlanLoading } =
    useCreateActionPlan();
  const { mutate: updateActionPlanData, isLoading: updateActionPlanLoading } =
    useUpdateActionPlan();
  const { data: singleActionPlanData } = useGetActionPlanById(
    selectedEditActionPlan || '',
  );
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  const { refetch: refetchActionPlan } = useGetAllActionPlan(props?.id);

  const modalHeader = (
    <div
      id="create-action-plan-header"
      data-cy="create-action-plan-header"
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
    >
      Add New Action Plan
    </div>
  );
  const plusOnClickHandler = () => {
    setNumberOfActionPlan(numberOfActionPlan + 1);
  };
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setSelectedEditActionPlan(null);
    setNumberOfActionPlan(1);
  };
  const handleOnFinishActionPlan = (values: any) => {
    const arrayOfObjects = Object.keys(values).map((key: any) => values[key]);
    createActionPlanData(
      { formId: props?.id, values: arrayOfObjects },
      {
        onSuccess: () => {
          form.resetFields();
          setOpen(false);
          refetchActionPlan();
        },
      },
    );
  };
  useEffect(() => {
    if (selectedEditActionPlan && singleActionPlanData) {
      form.setFieldsValue({
        0: {
          actionToBeTaken: singleActionPlanData?.actionToBeTaken || '',
          description: singleActionPlanData?.description || '',
          responsiblePerson: singleActionPlanData?.responsiblePerson || '',
          status: singleActionPlanData?.status || '',
        },
      });
    }
  }, [selectedEditActionPlan, singleActionPlanData, form]);

  const handleOnUpdateActionPlan = (values: any) => {
    updateActionPlanData(
      { actionPlanId: selectedEditActionPlan, values: values[0] },
      {
        onSuccess: () => {
          form.resetFields();
          setSelectedEditActionPlan(null);
          setOpen(false);
          refetchActionPlan();
        },
      },
    );
  };
  const handleOnFinish = (values: any) => {
    selectedEditActionPlan
      ? handleOnUpdateActionPlan(values)
      : handleOnFinishActionPlan(values);
  };
  return (
    open && (
      <CustomDrawerLayout
        data-cy="create-action-plan-drawer"
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Form
          id="create-action-plan-form"
          data-cy="create-action-plan-form"
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleOnFinish}
        >
          {/* eslint-disable @typescript-eslint/naming-convention  */}
          {Array.from({ length: numberOfActionPlan }, (__, index) => (
            <Card
              key={index}
              id={`create-action-plan-card-${index + 1}`}
              data-cy={`create-action-plan-card-${index + 1}`}
              title={
                <div
                  id={`create-action-plan-card-${index + 1}-delete-button`}
                  data-cy={`create-action-plan-card-${index + 1}-delete-button`}
                  className="flex justify-end text-red-600 cursor-pointer"
                  onClick={() => setNumberOfActionPlan(numberOfActionPlan - 1)}
                >
                  <TiDeleteOutline
                    data-cy="create-action-plan-card-delete-button-icon"
                    id="createActionPlanCardDeleteButtonIcon"
                  />
                </div>
              }
            >
              <Row
                gutter={16}
                data-cy="create-action-plan-card-row"
                id="createActionPlanCardRow"
              >
                <Col
                  xs={24}
                  sm={24}
                  data-cy="create-action-plan-card-col"
                  id="createActionPlanCardCol"
                >
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'actionToBeTaken']}
                    label={`Action plan ${index + 1}`}
                    id={`actionPlanId${index + 1}`}
                    data-cy={`create-action-plan-action-${index + 1}-form-item`}
                    rules={[
                      { required: true, message: 'action title is required' },
                    ]}
                  >
                    <Input
                      id={`create-action-plan-action-${index + 1}-input`}
                      data-cy={`create-action-plan-action-${index + 1}-input`}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={16}
                data-cy="create-action-plan-card-row"
                id="createActionPlanCardRow"
              >
                <Col
                  xs={24}
                  sm={24}
                  data-cy="create-action-plan-card-col"
                  id="createActionPlanCardCol"
                >
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'description']}
                    label={`Description`}
                    id={`actionPlanDescription${index + 1}`}
                    data-cy={`create-action-plan-description-${index + 1}-form-item`}
                    rules={[
                      { required: true, message: 'description is required' },
                    ]}
                  >
                    <Input.TextArea
                      id={`create-action-plan-description-${index + 1}-textarea`}
                      data-cy={`create-action-plan-description-${index + 1}-textarea`}
                      rows={6}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={16}
                data-cy="create-action-plan-card-row"
                id="createActionPlanCardRow"
              >
                <Col
                  xs={24}
                  sm={24}
                  data-cy="create-action-plan-card-col"
                  id="createActionPlanCardCol"
                >
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'responsiblePerson']}
                    label={`Responsible Person`}
                    id={`responsiblePersonId${index + 1}`}
                    data-cy={`create-action-plan-responsible-person-${index + 1}-form-item`}
                    rules={[
                      {
                        required: true,
                        message: 'Responsible Person is required',
                      },
                    ]}
                  >
                    <Select
                      id={`selectStatusChartType`}
                      data-cy={`create-action-plan-responsible-person-${index + 1}-select`}
                      mode="multiple"
                      placeholder="Responsible Person"
                      allowClear
                      loading={userLoading}
                      className="w-full my-4"
                      optionLabelProp="label"
                      optionFilterProp="label"
                    >
                      {employeeData?.items?.map((item: any) => (
                        <Option
                          key="active"
                          value={item.id}
                          label={
                            item.firstName +
                            ' ' +
                            item.middleName +
                            ' ' +
                            item.lastName
                          }
                          id={`create-action-plan-responsible-person-${index + 1}-option-${item.id}`}
                          data-cy={`create-action-plan-responsible-person-${index + 1}-option-${item.id}`}
                        >
                          <div
                            id={`create-action-plan-responsible-person-${index + 1}-option-${item.id}-content`}
                            data-cy={`create-action-plan-responsible-person-${index + 1}-option-${item.id}-content`}
                            className="flex space-x-3 p-1 rounded"
                          >
                            <Image
                              src={
                                item?.profileImage ?? GENDER_NEUTRAL_AVATAR_URL
                              }
                              alt="pep"
                              className="rounded-full w-4 h-4 mt-2"
                              width={15}
                              height={15}
                              data-cy={`create-action-plan-responsible-person-${index + 1}-option-${item.id}-image`}
                            />
                            <span
                              className="flex justify-center items-center"
                              data-cy={`create-action-plan-responsible-person-${index + 1}-option-${item.id}-name`}
                              id={`create-action-plan-responsible-person-${index + 1}-option-${item.id}-name`}
                            >
                              {item?.firstName +
                                ' ' +
                                item?.middleName +
                                ' ' +
                                item?.lastName}
                            </span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row
                gutter={16}
                data-cy="create-action-plan-card-row"
                id="createActionPlanCardRow"
              >
                <Col
                  xs={24}
                  sm={24}
                  data-cy="create-action-plan-card-col"
                  id="createActionPlanCardCol"
                >
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'status']}
                    label={`Status`}
                    id={`statusId${index + 1}`}
                    data-cy={`create-action-plan-status-${index + 1}-form-item`}
                    hidden={true}
                    initialValue={'pending'}
                  >
                    <Select
                      id={`selectStatusChartType`}
                      data-cy={`create-action-plan-status-${index + 1}-select`}
                      placeholder="select status"
                      allowClear
                      className="w-full my-4"
                    >
                      <Option
                        id={`create-action-plan-status-${index + 1}-option-pending`}
                        data-cy={`create-action-plan-status-${index + 1}-option-pending`}
                        key="active"
                        value={'pending'}
                      >
                        Pending
                      </Option>
                      <Option
                        id={`create-action-plan-status-${index + 1}-option-solved`}
                        data-cy={`create-action-plan-status-${index + 1}-option-solved`}
                        key="completed"
                        value={'solved'}
                      >
                        Solved
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          <Row
            gutter={16}
            className="my-5"
            id="create-action-plan-add-button-row"
            data-cy="create-action-plan-add-button-row"
          >
            <Col
              className="flex justify-center"
              xs={24}
              sm={24}
              data-cy="create-action-plan-add-button-col"
              id="createActionPlanAddButtonCol"
            >
              <Button
                id="create-action-plan-add-button"
                data-cy="create-action-plan-add-button"
                type="primary"
                onClick={plusOnClickHandler}
              >
                <FaPlus />
              </Button>
            </Col>
          </Row>
          <Row
            gutter={16}
            id="create-action-plan-footer-row"
            data-cy="create-action-plan-footer-row"
          >
            <Col
              xs={24}
              sm={12}
              className="flex justify-end"
              data-cy="create-action-plan-cancel-button-col"
              id="createActionPlanCancelButtonCol"
            >
              <Popconfirm
                id="create-action-plan-cancel-popconfirm"
                data-cy="create-action-plan-cancel-popconfirm"
                title="reset all you filled"
                description="Are you sure to reset all fields value ?"
                onConfirm={handleCancel}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  id="create-action-plan-cancel-button"
                  data-cy="create-action-plan-cancel-button"
                  name="cancelSidebarButtonId"
                  className="p-4"
                  danger
                >
                  Cancel
                </Button>
              </Popconfirm>
            </Col>
            <Col
              xs={24}
              sm={12}
              data-cy="create-action-plan-submit-button-col"
              id="createActionPlanSubmitButtonCol"
            >
              <Button
                loading={createActionPlanLoading || updateActionPlanLoading}
                htmlType="submit"
                name="createActionButton"
                id="createActionButtonId"
                data-cy="create-action-plan-submit-button"
                className="px-6 py-3 text-xs font-bold"
                type="primary"
              >
                {selectedEditActionPlan ? 'Edit' : 'Create'}
              </Button>
            </Col>
          </Row>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateActionPlan;
