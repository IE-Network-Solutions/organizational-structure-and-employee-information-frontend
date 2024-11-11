import CustomDrawerLayout from '@/components/common/customDrawer';
import React from 'react';
import KeyResultView from '../../keyresultView';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { Form } from 'antd';
import { useUpdateKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';

// Define the props interface
interface OkrDrawerProps {
  open: boolean;
  onClose: () => void;
  keyResult: any;
}

// Convert the component to TypeScript
const EditKeyResult: React.FC<OkrDrawerProps> = (props) => {
  const [form] = Form.useForm();
  const { mutate: updateKeyResult, isLoading } = useUpdateKeyResult();
  const { keyResultValue, objectiveValue } = useOKRStore();
  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const keyResult = keyResultValue;

        // Iterate over each keyResult to validate all milestone key types

        const keyType = keyResult?.metricType?.name || keyResult?.key_type;
        if (keyType === 'Milestone') {
          // Check if at least one milestone is added
          if (!keyResult.milestones || keyResult.milestones.length === 0) {
            NotificationMessage.warning({
              message:
                'Please add at least one milestone for each milestone key result.',
            });
            return; // Stop submission if no milestone is added
          }

          // Calculate the sum of milestone values
          const milestoneSum = keyResult.milestones.reduce(
            (sum: number, milestone: Record<string, number>) =>
              sum + milestone.weight,
            0,
          );

          // Check if the sum of milestone values equals 100
          if (milestoneSum !== 100) {
            NotificationMessage.warning({
              message: `Title:${keyResult.title} key result sum of milestones should equal to 100.`,
            });
            return; // Stop submission if the sum is not 100
          }
        }
        if (
          keyType === 'Currency' ||
          keyType === 'Numeric' ||
          keyType === 'Percentage'
        ) {
          // Check if at least one milestone is added

          if (keyResult?.initialValue > keyResult?.targetValue) {
            NotificationMessage.warning({
              message: `Title:${keyResult.title} key result initialValue should be less than or equal to the target value.`,
            });
            return; // Stop submission if the sum is not 100
          }
        }

        // If all checks pass, proceed with the objective creation
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
      <CustomButton
        loading={isLoading}
        title={'Save'}
        type="primary"
        onClick={onSubmit}
      />
    </div>
  );

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
