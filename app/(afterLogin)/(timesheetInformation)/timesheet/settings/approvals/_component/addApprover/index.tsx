import AddApproverComponent from '@/components/Approval/addApprover';
import { useAddApproverMutation } from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { Form } from 'antd';

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
  } = useApprovalStore();
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
      { values: { approvalWorkflowId: selectedItem?.id, steps: jsonPayload } },
      {
        onSuccess: () => {
          setAddModal(false);
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
