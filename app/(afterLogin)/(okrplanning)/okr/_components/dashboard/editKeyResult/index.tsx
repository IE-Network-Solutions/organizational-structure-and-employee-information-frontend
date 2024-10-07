import CustomDrawerLayout from '@/components/common/customDrawer';
import React from 'react';
import KeyResultView from '../../keyresultView';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { Form } from 'antd';
import { useUpdateKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';

// Define the props interface
interface OkrDrawerProps {
  open: boolean;
  onClose: () => void;
  keyResult: any;
}

// Convert the component to TypeScript
const EditKeyResult: React.FC<OkrDrawerProps> = (props) => {
  const [form] = Form.useForm();
  const { mutate: updateKeyResult } = useUpdateKeyResult();
  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        // Validation success, proceed with form submission
        updateKeyResult(keyResultValue, {
          onSuccess: () => {
            props?.onClose();
          },
        });
      })
      .catch(() => {
        // Validation failed
      });
  };
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Edit Key Result
    </div>
  );
  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={props?.onClose}
        style={{ marginRight: 8 }}
      />
      <CustomButton title={'Save'} type="primary" onClick={onSubmit} />
    </div>
  );
  const { keyResultValue, objectiveValue } = useOKRStore();

  return (
    <CustomDrawerLayout
      open={props?.open}
      onClose={props?.onClose}
      modalHeader={modalHeader}
      width="50%"
      footer={footer}
    >
      <KeyResultView
        key={1}
        keyValue={props?.keyResult}
        objective={objectiveValue}
        index={0}
        isEdit={true}
      />
    </CustomDrawerLayout>
  );
};

export default EditKeyResult;
