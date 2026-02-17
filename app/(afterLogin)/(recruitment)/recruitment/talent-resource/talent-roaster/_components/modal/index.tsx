import { Button, Modal, Form, Select, Input, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface Candidate {
  id: string;
  fullName: string;
  phone?: string;
}

interface AddToJobPipelineProps {
  open: boolean;
  onCancel: () => void;
  selectedCandidates: Candidate[];
  onRemoveCandidate: (candidateId: string) => void;
  availableJobs: any[];
  onSubmit: (values: { jobId: string; reason: string }) => void;
}

const AddToJobPipeline: React.FC<AddToJobPipelineProps> = ({
  open,
  onCancel,
  selectedCandidates,
  onRemoveCandidate,
  availableJobs,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      data-cy="talent-acquisition-talent-roaster-modal-add-job-pipeline"
      open={open}
      onCancel={handleCancel}
      centered
      width={600}
      footer={null}
      title={null}
    >
      <div
        id="talent-acquisition-talent-roaster-modal-content"
        data-cy="talent-acquisition-talent-roaster-modal-content"
        className="p-6"
      >
        <h2
          id="talent-acquisition-talent-roaster-modal-title"
          data-cy="talent-acquisition-talent-roaster-modal-title"
          className="text-xl font-semibold mb-6"
        >
          Add to Job Pipeline
        </h2>

        <Form
          id="talent-acquisition-talent-roaster-form-add-job-pipeline"
          data-cy="talent-acquisition-talent-roaster-form-add-job-pipeline"
          form={form}
          layout="vertical"
          onFinish={onSubmit}
        >
          {/* Selected Applicants Section */}
          <div
            id="talent-acquisition-talent-roaster-modal-div-selected-applicants"
            data-cy="talent-acquisition-talent-roaster-modal-div-selected-applicants"
            className="mb-6"
          >
            <label
              id="talent-acquisition-talent-roaster-modal-label-selected-applicants"
              data-cy="talent-acquisition-talent-roaster-modal-label-selected-applicants"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              Selected Applicants{' '}
              <span
                data-cy="talent-roaster-components-modal-index-tsx-index-span-83"
                className="text-red-500"
              >
                *
              </span>
            </label>
            <div
              id="talent-acquisition-talent-roaster-modal-div-applicant-tags"
              data-cy="talent-acquisition-talent-roaster-modal-div-applicant-tags"
              className="flex flex-wrap gap-2"
            >
              {selectedCandidates?.map((candidate) => (
                <Tag
                  key={candidate.id}
                  id={`talent-acquisition-talent-roaster-tag-candidate-${candidate.id}`}
                  data-cy={`talent-acquisition-talent-roaster-tag-candidate-${candidate.id}`}
                  closable
                  onClose={() => onRemoveCandidate(candidate.id)}
                  closeIcon={<CloseOutlined />}
                  className="flex items-center px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm"
                >
                  {candidate.fullName}
                </Tag>
              ))}
            </div>
          </div>

          {/* Select Job Section */}
          <Form.Item
            name="jobId"
            label={
              <span
                data-cy="talent-roaster-components-modal-index-tsx-index-span-110"
                className="text-sm font-medium text-gray-700"
              >
                Select Job{' '}
                <span
                  data-cy="talent-roaster-components-modal-index-tsx-index-span-111"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please select a job',
              },
            ]}
          >
            <Select
              id="talent-acquisition-talent-roaster-select-job-pipeline"
              data-cy="talent-acquisition-talent-roaster-select-job-pipeline"
              placeholder="Selection"
              className="w-full"
              size="large"
            >
              {availableJobs?.map((job) => (
                <Option
                  key={job.id}
                  value={job.id}
                  id={`talent-acquisition-talent-roaster-option-job-${job.id}`}
                  data-cy={`talent-acquisition-talent-roaster-option-job-${job.id}`}
                >
                  {job.jobTitle}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Reason Section */}
          <Form.Item
            name="reason"
            label={
              <span
                data-cy="talent-roaster-components-modal-index-tsx-index-span-145"
                className="text-sm font-medium text-gray-700"
              >
                Reason{' '}
                <span
                  data-cy="talent-roaster-components-modal-index-tsx-index-span-146"
                  className="text-red-500"
                >
                  *
                </span>
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please provide a reason',
              },
            ]}
          >
            <TextArea
              id="talent-acquisition-talent-roaster-textarea-reason"
              data-cy="talent-acquisition-talent-roaster-textarea-reason"
              placeholder="Reason for selection"
              rows={4}
              className="w-full"
            />
          </Form.Item>

          {/* Footer Buttons */}
          <div
            id="talent-acquisition-talent-roaster-modal-footer-buttons"
            data-cy="talent-acquisition-talent-roaster-modal-footer-buttons"
            className="flex justify-center gap-4 mt-8"
          >
            <Button
              id="talent-acquisition-talent-roaster-button-cancel-job-pipeline"
              data-cy="talent-acquisition-talent-roaster-button-cancel-job-pipeline"
              onClick={handleCancel}
              className="px-8 py-2 h-auto"
              size="large"
            >
              Cancel
            </Button>
            <Button
              id="talent-acquisition-talent-roaster-button-add-job-pipeline"
              data-cy="talent-acquisition-talent-roaster-button-add-job-pipeline"
              type="primary"
              onClick={handleSubmit}
              className="px-8 py-2 h-auto bg-blue-600 hover:bg-blue-700"
              size="large"
            >
              Add
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddToJobPipeline;
