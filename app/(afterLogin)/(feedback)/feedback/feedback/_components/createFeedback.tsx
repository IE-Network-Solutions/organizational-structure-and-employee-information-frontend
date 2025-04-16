import React, { useEffect, useState } from 'react';
import { Form, Select, Input, Button } from 'antd';
import { useGetAllUsers, useGetActiveEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useFetchAllFeedbackTypes,
  useFetchFeedbackTypeById,
} from '@/store/server/features/feedback/feedbackType/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCreateFeedbackRecord,
  useUpdateFeedbackRecord,
} from '@/store/server/features/feedback/feedbackRecord/mutation';
import { FeedbackItem } from '@/store/server/features/CFR/conversation/action-plan/interface';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetPerspectiveById } from '@/store/server/features/CFR/feedback/queries';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';

const { TextArea } = Input;

const CreateFeedbackForm = ({ form }: { form: any }) => {
  const { userId } = useAuthenticationStore();
  // const {
  //   activeTab,
  //   setOpen,
  //   selectedFeedbackRecord,
  //   variantType,
  //   setSelectedFeedbackRecord,
  // } = ConversationStore();
  const {
    open,
    setOpen,
    setSelectedFeedbackRecord,
    selectedFeedbackRecord,
    variantType,
    activeTab,
  } = ConversationStore();
  const [selectedDepartment, setSelectedDepartmentId] = useState<string | null>(
    null,
  );
  const { data: getAllUsersData } = useGetAllUsers();
  const { data: getActiveEmployee } = useGetActiveEmployee();
  const { data: getAllFeedbackTypeById } = useFetchFeedbackTypeById(activeTab);

  const { data: departments, isLoading } = useGetDepartments();
  const { data: perspectiveData } = useGetPerspectiveById(selectedDepartment);
  const {
    mutate: createFeedbackRecord,
    isLoading: loadingCreateFeedbackRecord,
  } = useCreateFeedbackRecord();
  const {
    mutate: updateFeedbackRecord,
    isLoading: loadingUpdateFeedbackRecord,
  } = useUpdateFeedbackRecord();
  const { data: getAllFeedbackTypes } = useFetchAllFeedbackTypes();

  const onFinish = (values: any) => {
    if (selectedFeedbackRecord !== null) {
      const updatedValues = {
        ...values,
        points:
          getAllFeedbackTypeById?.feedback?.find(
            (feedback: FeedbackItem) => feedback.id === values.feedbackId,
          )?.points || 0,
        issuerId: userId,
        feedbackTypeId: activeTab,
      };
      updateFeedbackRecord(updatedValues, {
        onSuccess: () => {
          setOpen(false);
          setSelectedFeedbackRecord(null);
        },
      });
    } else {
      const updatedValues = {
        ...values,
        points:
          getAllFeedbackTypeById?.feedback?.find(
            (feedback: FeedbackItem) => feedback.id === values.feedbackId,
          )?.points || 0, // Default to 0 if feedback is not found or points are undefined
        issuerId: userId,
        feedbackTypeId: activeTab,
      };
      createFeedbackRecord(updatedValues, {
        onSuccess: () => {
          setOpen(false);
          setSelectedFeedbackRecord(null);
          form.resetFields();
        },
      });
    }
  };
  // Ensure perspectiveIds is always an array
  const perspectiveIds =
    perspectiveData
      ?.filter(
        (perspective: any) => perspective.departmentId === selectedDepartment,
      )
      ?.map((perspective: any) => perspective.id) || []; // Default to an empty array

  // Ensure perspectiveIds is always an array to avoid errors
  const filteredFeedback = getAllFeedbackTypeById?.feedback?.filter(
    (item: any) => {
      if (item.perspectiveId) {
        return perspectiveIds.includes(item.perspectiveId);
      } else {
        return true;
      }
    },
  );
  // const filteredFeedback=getAllFeedbackTypeById?.feedback
  useEffect(() => {
    const getDepartmenId = (perspectiveId: string | undefined) => {
      const perspective = perspectiveData?.find(
        (item: any) => item.id === perspectiveId,
      );
      return perspective?.departmentId ?? null;
    };
    if (selectedFeedbackRecord !== null)
      form.setFieldsValue({
        id: selectedFeedbackRecord?.id,
        recipientId: selectedFeedbackRecord?.recipientId,
        feedbackId: selectedFeedbackRecord?.feedbackId,
        departmenId: getDepartmenId(selectedFeedbackRecord?.perspectiveId),
        reason: selectedFeedbackRecord?.reason,
        action: selectedFeedbackRecord?.action,
      });
  }, [selectedFeedbackRecord]);

  const activeTabName =
    getAllFeedbackTypes?.items?.find(
      (item: FeedbackTypeItems) => item.id === activeTab,
    )?.category ?? '';

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {`${activeTabName} - ${variantType}`}
    </div>
  );


  return (
    <CustomDrawerLayout
      open={(open && activeTabName !== '') || selectedFeedbackRecord !== null}
      onClose={() => {
        setOpen(false);
        setSelectedFeedbackRecord(null);
        form.resetFields();
      }}
      modalHeader={modalHeader}
      width="40%"
      footer={
        <Form.Item>
          <div className=" w-full bg-[#fff] absolute flex justify-center space-x-5">
            <Button onClick={() => setOpen(false)} type="default">
              Cancel
            </Button>

            {selectedFeedbackRecord !== null ? (
              <Button type="primary" onClick={() => form.submit()}>
                Update
              </Button>
            ) : (
              <Button
                loading={
                  loadingCreateFeedbackRecord || loadingUpdateFeedbackRecord
                }
                type="primary"
                onClick={() => form.submit()}
              >
                Submit
              </Button>
            )}
          </div>
        </Form.Item>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          employeeId: [],
          feedbackId: undefined,
          reason: '',
          action: '',
          cc: [],
        }}
      >
        {selectedFeedbackRecord !== null && <Form.Item name="id"></Form.Item>}
        {/* Select Employee ID */}

        <Form.Item
          name="recipientId"
          label="Select Employee"
          rules={[
            { required: true, message: 'Please select at least one employee!' },
          ]}
        >
          <Select
            showSearch
            allowClear
            placeholder="Select employee"
            options={
              getActiveEmployee?.items
                ?.filter((i: any) => i.id !== userId)
                ?.map((item: any) => ({
                  label: `${item?.firstName} ${item?.middleName} ${item?.lastName}`, // `label` for display
                  value: item?.id, // `value` for internal use
                })) ?? []
            }
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item
          name="departmentId"
          label="Select Department"
          rules={[{ required: true, message: 'Please select a department' }]}
        >
          <Select
            loading={isLoading}
            placeholder="Select a department"
            onChange={(departmentId: string) =>
              setSelectedDepartmentId(departmentId)
            }
          >
            {departments?.map((department: any) => (
              <Select.Option key={department.id} value={department.id}>
                {department.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* Select Type */}
        <Form.Item
          name="feedbackId"
          label="Select Feedback"
          rules={[
            { required: true, message: 'Please select at least one type!' },
          ]}
        >
          <Select
            showSearch
            placeholder="Select Feedback"
            options={
              filteredFeedback
                ?.filter((i: any) => i.variant === variantType)
                ?.map((feedback: FeedbackItem) => ({
                  key: feedback.id, // Optional, used for React rendering optimization
                  label: feedback.name, // Text displayed in the dropdown
                  value: feedback.id, // Unique identifier
                })) ?? []
            }
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* Reason */}
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: 'Please provide a reason!' }]}
        >
          <TextArea rows={4} placeholder="Enter reason or description" />
        </Form.Item>

        {/* Action to Be Taken */}
        <Form.Item
          name="action"
          label="Action to Be Taken"
          rules={[
            {
              required: true,
              message: 'Please describe the action to be taken!',
            },
          ]}
        >
          <TextArea rows={4} placeholder="Describe the action to be taken" />
        </Form.Item>

        {/* CC */}
        {selectedFeedbackRecord === null && (
          <Form.Item
            name="cc"
            label="CC"
            rules={[
              { required: true, message: 'Please select at least one CC!' },
            ]}
            className="mb-8"
          >
            <Select
              mode="multiple"
              placeholder="Select CC employee(s)"
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={
                getAllUsersData?.items?.map((item: any) => ({
                  key: item?.id,
                  value: item?.email,
                  label:
                    item?.firstName +
                    ' ' +
                    item?.middleName +
                    '' +
                    item?.lastName,
                })) ?? []
              }
            />
          </Form.Item>
        )}
      </Form>
    </CustomDrawerLayout>
  );
};

export default CreateFeedbackForm;
