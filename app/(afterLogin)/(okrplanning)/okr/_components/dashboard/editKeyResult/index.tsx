import CustomDrawerLayout from '@/components/common/customDrawer';
import React from 'react';
import KeyResultView from '../../keyresultView';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import CustomButton from '@/components/common/buttons/customButton';
import { Form, Select } from 'antd';
import { useUpdateKeyResult } from '@/store/server/features/okrplanning/okr/objective/mutations';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useGetMetrics } from '@/store/server/features/okrplanning/okr/metrics/queries';

const { Option } = Select;

// Define the props interface
interface OkrDrawerProps {
  open: boolean;
  onClose: () => void;
  keyResult: any;
}

// Convert the component to TypeScript
const EditKeyResult: React.FC<OkrDrawerProps> = (props) => {
  const { data: Metrics } = useGetMetrics();

  const [form] = Form.useForm();
  const { mutate: updateKeyResult, isLoading } = useUpdateKeyResult();
  const { keyResultValue, objectiveValue, setKeyResultValue } = useOKRStore();
  // const [selectedMetric, setSelectedMetric] = useState<any | null>(null);
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

  const handleMetricChange = (metricType: any) => {
    const newKeyResult = {
      ...props?.keyResult,
      metricType,
      metricTypeId: metricType?.id, // Update metricTypeId as well
    };
    // if (metricType?.name !== 'Milestone') {
    //   delete newKeyResult.milestones;
    //   delete newKeyResult.keyMilestones;
    // }
    setKeyResultValue(newKeyResult);
  };

  return (
    <CustomDrawerLayout
      open={props?.open}
      onClose={props?.onClose}
      modalHeader={modalHeader}
      width="50%"
      footer={footer}
    >
      <span className="font-bold mx-3">Metric type</span>
      <Select
        placeholder="Selecte Metric Type"
        onChange={(val) => {
          const selectedObject =
            Metrics?.items?.find((item: any) => item.id === val) || null;
          if (selectedObject) handleMetricChange(selectedObject);
        }}
        value={props?.keyResult.metricTypeId}
        allowClear
        className="w-full mx-3 mt-1"
      >
        {Metrics?.items?.map((item: any) => (
          <Option key={item?.id} value={item?.id}>
            {item?.name}
          </Option>
        ))}
      </Select>

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
