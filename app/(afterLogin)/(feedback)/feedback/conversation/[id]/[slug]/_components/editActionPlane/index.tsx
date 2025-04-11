'use client';
import { useGetActionPlansById } from '@/store/server/features/CFR/conversation/action-plan/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Button, Col, DatePicker, Form, Input, Row, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
const { Option } = Select;

interface PropsData {
  slug: string;
  onFinish: (data: any) => void;
  form2: any;
}

const EditActionPlans: React.FC<PropsData> = ({ slug, onFinish, form2 }) => {
  const { data: allUserData, isLoading: userDataLoading } = useGetAllUsers();
  const { setOpenEdit, actionPlanId } = useOrganizationalDevelopment();
  const { data: actionPlanData, isLoading: actionPlanIsLoading } =
    useGetActionPlansById(actionPlanId);

  const handleCancel = () => {
    form2.resetFields();
    setOpenEdit(false);
  };
  useEffect(() => {
    if (actionPlanData) {
      form2.setFieldsValue({
        id: actionPlanData.id,
        assigneeId: actionPlanData.assigneeId,
        comment: actionPlanData.comment,
        issue: actionPlanData.issue,
        status: actionPlanData.status,
        deadline: actionPlanData.deadline
          ? dayjs(actionPlanData.deadline)
          : null,
      });
    }
  }, [actionPlanData, form2]);

  return (
    <Spin spinning={actionPlanIsLoading}>
      <Form
        form={form2}
        name="dependencies"
        autoComplete="off"
        style={{ maxWidth: '100%' }}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="conversationInstanceId" initialValue={slug} hidden>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name="issue"
              label="Action plan"
              id="actionPlanId"
              rules={[{ required: true, message: 'action title is required' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name="comment"
              label={`Comment`}
              id={`actionPlanDescription`}
              rules={[
                { required: true, message: 'Comment is required' },
                {
                  max: 250,
                  message: 'Comment cannot exceed 255 characters',
                },
              ]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name="assigneeId"
              label={`Responsible Person`}
              id={`responsiblePersonId`}
              rules={[
                {
                  required: true,
                  message: 'Responsible Person is required',
                },
              ]}
            >
              <Select
                id={`selectStatusChartType`}
                placeholder="Responsible Person"
                allowClear
                loading={userDataLoading}
                className="w-full my-4"
              >
                {allUserData?.items?.map((item: any) => (
                  <Option key="active" value={item.id}>
                    <div className="flex space-x-3 p-1 rounded">
                      <span className="flex justify-center items-center">
                        {item?.firstName + ' ' + item?.middleName}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} align="middle" justify="start">
          <Col xs={24} sm={10}>
            <Form.Item
              className="font-semibold text-xs w-full"
              name="status"
              label="Status"
              id={`statusId`}
              rules={[
                {
                  required: true,
                  message: 'Status is required',
                },
              ]}
            >
              <Select
                id="selectStatusChartType"
                placeholder="Select status"
                allowClear
                className="w-full"
              >
                <Option key="pending" value="pending">
                  Pending
                </Option>
                <Option key="solved" value="solved">
                  Solved
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              className="font-semibold text-xs w-full"
              name="deadline"
              label={`Deadline`}
              id={`deadlineActionId`}
              rules={[{ required: true, message: 'Deadline is required' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12} className="flex justify-end">
            <Button
              onClick={handleCancel}
              name="cancelSidebarButtonId"
              className="p-4"
              danger
            >
              Cancel
            </Button>
          </Col>
          <Col xs={24} sm={12}>
            <Button
              // loading={isLoading}
              htmlType="submit"
              name="createActionButton"
              id="createActionButtonId"
              className="px-6 py-3 text-xs font-bold"
              type="primary"
            >
              Update
            </Button>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
};

export default EditActionPlans;
