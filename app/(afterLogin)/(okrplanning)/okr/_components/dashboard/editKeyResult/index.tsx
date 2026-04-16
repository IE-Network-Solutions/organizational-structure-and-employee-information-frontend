import React from 'react';
import { Modal, Form, Tooltip, Button } from 'antd';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyResultForm from '../../keyresultForm';
import { KeyResultSelectedBadge } from '../../keyresultForm/_ui';
import {
  useOKRStore,
  useEditKeyResultStore,
} from '@/store/uistate/features/okrplanning/okr';
import { useUpdateKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useGetKeyResultForEdit } from '@/store/server/features/okrplanning/okr/keyresult/queries';
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
  const { keyResultValue, handleSingleKeyResultChange } = useOKRStore();
  const { isEditing, setIsEditing, resetEditKeyResult } =
    useEditKeyResultStore();

  const hasValidKeyResult = (value: any) =>
    value && typeof value === 'object' && !Array.isArray(value);

  const sourceKeyResult = hasValidKeyResult(keyResultValue)
    ? keyResultValue
    : props?.keyResult;

  const getDeadlineFromKr = (kr: any) =>
    kr?.deadline ??
    kr?.dead_line ??
    kr?.deadLine ??
    kr?.dueDate ??
    kr?.due_date ??
    null;

  const krId = sourceKeyResult?.id ? String(sourceKeyResult.id) : '';
  const { data: fetchedKeyResult } = useGetKeyResultForEdit(
    krId,
    !!props.open && !!krId,
  );

  const baseResolved =
    props.open && fetchedKeyResult && Object.keys(fetchedKeyResult).length > 0
      ? { ...fetchedKeyResult, ...sourceKeyResult }
      : sourceKeyResult;

  const resolvedDeadline =
    getDeadlineFromKr(sourceKeyResult) ?? getDeadlineFromKr(fetchedKeyResult);
  const resolvedKeyResult =
    resolvedDeadline != null && resolvedDeadline !== ''
      ? { ...baseResolved, deadline: resolvedDeadline }
      : baseResolved;

  const normalizedKeyItem = (() => {
    const kr = resolvedKeyResult;
    if (!kr) return kr;
    const deadline = getDeadlineFromKr(kr);
    return {
      ...kr,
      key_type: kr?.key_type || kr?.metricType?.name || '',
      deadline: deadline ?? null,
      weight:
        kr?.weight != null && kr?.weight !== ''
          ? Number(kr.weight)
          : kr?.weight,
    };
  })();

  const handleModalClose = () => {
    resetEditKeyResult();
    form.resetFields(); // Reset all form fields
    props.onClose(); // Close the modal
  };

  const kr = normalizedKeyItem;
  const getMetricLabel = (keyResult: any) => {
    const name = keyResult?.metricType?.name || keyResult?.key_type || '';
    if (name === 'Achieve') return 'Achieve or not';
    if (name === 'Achieved') return 'Achieve or not';
    return name || 'Key Result';
  };
  const isNumericType = (keyResult: any) => {
    const n = keyResult?.metricType?.name || keyResult?.key_type || '';
    return n === 'Numeric' || n === 'Currency' || n === 'Percentage';
  };

  const onSubmit = () => {
    form
      .validateFields()
      .then(() => {
        const keyResult = normalizedKeyItem;
        if (!keyResult) return;

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
        const toSubmit = hasValidKeyResult(keyResultValue)
          ? { ...normalizedKeyItem, ...keyResultValue }
          : normalizedKeyItem;
        updateKeyResult(toSubmit, {
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
      data-cy="okr-edit-key-result-modal-header"
      className="text-lg font-semibold text-gray-900"
    >
      Edit Key Result
    </div>
  );

  const footer = (
    <div
      id="edit-key-result-modal-footer"
      data-cy="okr-edit-key-result-modal-footer"
      className="w-full flex justify-end items-center pt-2 gap-3"
    >
      <Button
        id="edit-key-result-cancel-button"
        data-cy="okr-edit-key-result-cancel-button"
        onClick={handleModalClose}
        className="px-6 h-10 rounded-lg text-sm border-gray-300 text-gray-700"
      >
        Cancel
      </Button>
      <Button
        id="edit-key-result-save-button"
        data-cy="okr-edit-key-result-save-button"
        type="primary"
        onClick={onSubmit}
        loading={isLoading}
        className="px-6 h-10 rounded-lg text-sm bg-okr-primary border-okr-primary"
      >
        Save
      </Button>
    </div>
  );

  return (
    <Modal
      data-cy="okr-edit-key-result-modal"
      open={props.open}
      onCancel={handleModalClose}
      footer={footer}
      title={modalHeader}
      centered={!isMobile}
      width={isMobile ? '100%' : 1200}
      zIndex={12000}
      wrapClassName={
        isMobile ? 'okr-mobile-bottom-sheet' : 'okr-objective-modal'
      }
      bodyStyle={{
        padding: isMobile ? '24px 24px' : 24,
        maxHeight: isMobile ? 'calc(100vh - 150px)' : undefined,
        overflowY: isMobile ? 'auto' : undefined,
      }}
      styles={{ content: { borderRadius: 8 } }}
      style={{ padding: 0, maxHeight: isMobile ? '100vh' : '90vh' }}
      maskClosable={false}
      destroyOnClose
      closable
    >
      <Form
        id="edit-key-result-form"
        data-cy="okr-edit-key-result-form"
        form={form}
        layout="vertical"
        className="w-full"
      >
        {/* Section header – same style as create / edit objective modals */}
        <div
          id="edit-key-result-section-header"
          data-cy="okr-edit-key-result-section-header"
          className="mb-6"
        >
          <h2
            id="edit-key-result-section-title"
            data-cy="okr-edit-key-result-section-title"
            className="text-base font-bold text-gray-900"
          >
            Set your Key Result
          </h2>
          <p
            id="edit-key-result-section-subtitle"
            data-cy="okr-edit-key-result-section-subtitle"
            className="text-sm text-gray-500 mt-1"
          >
            Please update your key result below.
          </p>
          <div
            className="border-b border-gray-200 mt-4"
            data-cy="okr-edit-key-result-section-divider"
          />
        </div>

        <div
          id="edit-key-result-view-container"
          data-cy="okr-edit-key-result-view-container"
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(80vh - 220px)' }}
        >
          {!isEditing && kr ? (
            <div
              id="edit-key-result-kr-card"
              data-cy="okr-edit-key-result-kr-card"
              className="mb-3 rounded-lg border border-gray-200 bg-white shadow-sm p-4"
            >
              <KeyResultSelectedBadge
                label={getMetricLabel(kr)}
                data-cy="okr-edit-key-result-kr-card-badge"
              />
              <div
                className="flex flex-wrap gap-2 mb-2"
                data-cy="okr-edit-key-result-kr-card-meta"
              >
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                  data-cy="okr-edit-key-result-kr-card-weight"
                >
                  Weight {kr?.weight ?? 0}%
                </span>
                {isNumericType(kr) && (
                  <>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                      data-cy="okr-edit-key-result-kr-card-initial"
                    >
                      Initial Value : {kr?.initialValue ?? 0}
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                      data-cy="okr-edit-key-result-kr-card-target"
                    >
                      Target Value : {kr?.targetValue ?? 0}
                    </span>
                  </>
                )}
              </div>
              <div
                className="flex items-start justify-between gap-3"
                data-cy="okr-edit-key-result-kr-card-content"
              >
                <p
                  className="text-base font-bold text-gray-900 leading-snug break-words flex-1 min-w-0"
                  data-cy="okr-edit-key-result-kr-card-title"
                >
                  {kr?.title?.trim() ? (
                    kr.title
                  ) : (
                    <span
                      className="text-gray-400 italic font-normal"
                      data-cy="okr-edit-key-result-kr-card-untitled"
                    >
                      Untitled key result
                    </span>
                  )}
                </p>
                <Tooltip title="Edit">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                    aria-label="Edit key result"
                    data-cy="okr-edit-key-result-kr-card-edit"
                  >
                    <EditOutlinedIcon className="text-sm" />
                  </button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <>
              {normalizedKeyItem && (
                <KeyResultForm
                  data-cy="okr-edit-key-result-form-inline"
                  keyItem={normalizedKeyItem}
                  index={0}
                  // eslint-disable-next-line
                  updateKeyResult={(_index, field, value) =>
                    handleSingleKeyResultChange(value, field as string)
                  }
                  removeKeyResult={() => {}}
                  addKeyResultValue={() => {}}
                  embedInOkrSheet={isMobile}
                  disableWeightEdit={true}
                  onSaveSuccess={() => setIsEditing(false)}
                  hideRemoveButton={true}
                />
              )}
            </>
          )}
        </div>

        {/* Total Key Results Weight */}
        {keyResultValue && (
          <div
            id="edit-key-result-total-weight"
            data-cy="okr-edit-key-result-total-weight"
            className="flex justify-end mt-4 mb-4"
          >
            <span
              id="okr-edit-key-result-total-weight-text"
              data-cy="okr-edit-key-result-total-weight-text"
              className="text-sm text-gray-500"
            >
              Total Key Results Weight:{' '}
              <strong data-cy="okr-edit-key-result-total-weight-value">
                {keyResultValue.weight || 0} %
              </strong>
            </span>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default EditKeyResult;
