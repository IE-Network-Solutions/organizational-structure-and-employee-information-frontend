import React from 'react';
import { Modal, Form } from 'antd';
import KeyResultView from '../../keyresultView';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { useUpdateKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useIsMobile } from '@/hooks/useIsMobile';

// Define the props interface
interface EditKeyResultProps {
  open: boolean;
  onClose: () => void;
  keyResult: any;
}

// Convert the component to TypeScript
const EditKeyResult: React.FC<EditKeyResultProps> = (props) => {
  const { isMobile } = useIsMobile();

  const [form] = Form.useForm();
  const { mutate: updateKeyResult, isLoading } = useUpdateKeyResult();
  const { keyResultValue, objectiveValue } = useOKRStore();

  const handleModalClose = () => {
    form.resetFields(); // Reset all form fields
    props.onClose(); // Close the modal
  };

  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const keyResult = keyResultValue;

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

          // Validate that each milestone has a non-empty name/title
          for (const [mIndex, milestone] of keyResult.milestones.entries()) {
            if (!milestone?.title || milestone.title.trim() === '') {
              NotificationMessage.warning({
                message: `Title:${keyResult.title} Milestone ${mIndex + 1} must have a name.`,
              });
              return; // Stop submission if any milestone name is empty
            }
          }

          // Calculate the sum of milestone values
          const milestoneSum = keyResult.milestones.reduce(
            (sum: number, milestone: Record<string, number>) =>
              sum + Number(milestone.weight),
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
            handleModalClose();
          },
        });
      })
      .catch(() => {
        // Validation failed
      });
  };

  const modalHeader = (
    <div
      id="edit-key-result-modal-header"
      className="flex justify-center text-2xl font-extrabold text-gray-800 p-4"
    >
      Edit Key Result
    </div>
  );

  const footer = (
    <div
      id="edit-key-result-modal-footer"
      className="w-full flex justify-center items-center pt-2 bottom-8 space-x-5"
    >
      <CustomButton
        id="edit-key-result-cancel-button"
        type="default"
        title="Cancel"
        onClick={handleModalClose}
        style={{ marginRight: 8, height: '40px' }}
      />
      <CustomButton
        id="edit-key-result-save-button"
        title={'Save'}
        type="primary"
        onClick={onSubmit}
        loading={isLoading}
        style={{ height: '40px' }}
      />
    </div>
  );

  return (
    <Modal
      open={props.open}
      onCancel={handleModalClose}
      footer={footer}
      title={modalHeader}
      centered
      width={isMobile ? '100vw' : 1200}
      bodyStyle={{ padding: isMobile ? 12 : 32 }}
      style={{ top: isMobile ? 0 : 32, padding: 0, maxHeight: '95vh' }}
      maskClosable={false}
      destroyOnClose
      closable={false}
    >
      <Form
        id="edit-key-result-form"
        form={form}
        layout="vertical"
        className="w-full"
      >
        <div id="edit-key-result-section-header" className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Key Result
          </h2>
        </div>

        <div id="edit-key-result-view-container">
          <KeyResultView
            key={`${props?.keyResult?.metricTypeId || 'default'}-${props?.keyResult?.id || 'new'}`}
            keyValue={props?.keyResult}
            objective={objectiveValue}
            index={0}
            isEdit={true}
            form={form}
          />
        </div>

        {/* Total Key Results Weight */}
        {keyResultValue && (
          <div
            id="edit-key-result-total-weight"
            className="flex justify-end mt-4 mb-4"
          >
            <span className="text-sm text-gray-500">
              Total Key Results Weight:{' '}
              <strong>{keyResultValue.weight || 0} %</strong>
            </span>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default EditKeyResult;
