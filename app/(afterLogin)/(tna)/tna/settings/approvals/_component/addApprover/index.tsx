import AddApproverComponent from '@/components/Approval/addApprover';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAddApproverMutation } from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { Form } from 'antd';
import React from 'react';

const AddApprover = () => {
  const {
    addModal,
    approverType,
    selectedItem,
    level,
    selections,
    setSelections,
    setAddModal,
    setLevel,
  } = useApprovalTNAStore();
  const { data: users } = useGetAllUsers();
  const [form] = Form.useForm();
  const { mutate: AddApprover } = useAddApproverMutation();
  const onClose = () => {
    setAddModal(false);
  };

  const handleUserChange = (value: string, index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: value };
    setSelections({ SectionItemType: updatedSelections });
  };
  const handleLevelChange = (value: number) => {
    setLevel(value);
    const updatedSelections = Array.from(
      {
        length: value,
      } /* eslint-disable-next-line @typescript-eslint/naming-convention */,
      (_, index) => {
        return selections.SectionItemType[index] || { user: null };
      },
    );
    setSelections({ SectionItemType: updatedSelections });
  };

  const handleSubmit = () => {
    const jsonPayload = selections.SectionItemType.flatMap((selection, idx) => {
      const inputLevel = form.getFieldValue(`level_${idx}`);
      const stepOrder =
        Number(inputLevel) || selectedItem?.approvers?.length + idx + 1;

      return Array.isArray(selection.user)
        ? selection.user.map((userId) => ({
            stepOrder,
            userId,
          }))
        : [{ stepOrder, userId: selection.user }];
    });

    AddApprover(
      {
        values: {
          approvalWorkflowId: selectedItem?.id,
          steps: jsonPayload,
        },
      },
      {
        onSuccess: () => {
          setAddModal(false);
        },
        onError: (error: any) => {
          // For AxiosError, the backend message is in error.response.data.message
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            'Something went wrong';

          NotificationMessage.error({
            message: 'Error',
            description: errorMessage,
          });
        },
      },
    );
  };
  return (
    <AddApproverComponent
      addModal={addModal}
      customFieldsDrawerHeader={'Add Approval WorkFLow'}
      onClose={onClose}
      form={form}
      handleSubmit={handleSubmit}
      selectedItem={selectedItem}
      approverType={approverType}
      level={level}
      handleLevelChange={handleLevelChange}
      handleUserChange={handleUserChange}
      users={users}
    />
  );
};

export default AddApprover;
