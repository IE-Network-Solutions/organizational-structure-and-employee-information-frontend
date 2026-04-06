import React from 'react';
import { Modal, Button, Select, Form } from 'antd';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { useUpdateJobStatus } from '@/store/server/features/recruitment/job/mutation';
import { JobStatus } from '@/types/enumTypes';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TalentAcqSelectChevronSuffix } from '../../../../_components/recruitmentIcons';
import { TaRequiredMark } from '../../../../_components/taRequiredMark';

const ChangeStatusModal: React.FC = () => {
  const [form] = Form.useForm();
  const updatedBy = useAuthenticationStore.getState().userId;

  const {
    isChangeStatusModalVisible,
    setChangeStatusModalVisible,
    selectedJobId,
    selectedJob,
  } = useJobState();

  const { mutate: updateJobStatus } = useUpdateJobStatus();
  const handleChangeStatusModalClose = () => {
    setChangeStatusModalVisible(false);
  };

  const handleStatusUpdate = (values: any) => {
    const updatedStatus = {
      updatedBy,
      id: selectedJob?.id,
      jobStatus: values?.status,
    };

    updateJobStatus(
      { data: updatedStatus, id: selectedJobId },
      {
        onSuccess: () => {
          setChangeStatusModalVisible(false);
          form.resetFields();
        },
      },
    );
  };

  React.useEffect(() => {
    if (selectedJob) {
      form.setFieldsValue({
        status: selectedJob?.jobStatus,
      });
    }
  }, [selectedJob, form]);

  const modalTitle = (
    <span
      className="text-lg font-bold text-black"
      data-cy="talent-acquisition-change-job-status-modal-title"
    >
      Change Job Status
    </span>
  );

  return (
    isChangeStatusModalVisible && (
      <>
        <style data-cy="talent-acquisition-change-job-status-modal-styles">{`
          #change-job-status-modal .ant-select .ant-select-selector {
            border: 1px solid #d9d9d9;
            border-radius: 6px;
          }
          #change-job-status-modal .ant-select:hover .ant-select-selector {
            border-color: #93C5FD;
          }
          #change-job-status-modal .ant-select-focused .ant-select-selector,
          #change-job-status-modal .ant-select-open .ant-select-selector {
            border-color: #93C5FD !important;
            box-shadow: 0 0 0 2px rgba(147, 197, 253, 0.25) !important;
          }
          #change-job-status-modal .ant-select-dropdown .ant-select-item-option-selected {
            background-color: #EFF6FF !important;
          }
          #change-job-status-modal .ant-select-dropdown .ant-select-item-option-active {
            background-color: #EFF6FF !important;
          }
          #change-job-status-modal .ant-select-item-option-selected .ant-select-item-option-state {
            color: #1E40AF;
          }
        `}</style>
        <Modal
          data-cy="talent-acquisition-change-job-status-modal"
          title={modalTitle}
          open={isChangeStatusModalVisible}
          onCancel={handleChangeStatusModalClose}
          centered
          footer={null}
          classNames={{ content: 'rounded-lg' }}
          styles={{
            content: { overflowX: 'hidden' },
            body: { overflowX: 'hidden', paddingTop: 8 },
          }}
        >
          <div
            id="change-job-status-modal"
            data-cy="talent-acquisition-change-job-status-modal-content"
          >
            <Form
              id="talent-acquisition-change-job-status-form"
              data-cy="talent-acquisition-change-job-status-form"
              form={form}
              layout="vertical"
              onFinish={handleStatusUpdate}
              requiredMark={false}
              className="max-w-full overflow-x-hidden"
            >
              <div
                className="rounded-lg border border-solid border-gray-200 p-4"
                data-cy="talent-acquisition-change-job-status-field-box"
              >
                <Form.Item
                  name="status"
                  label={
                    <span
                      className="inline-flex items-center gap-1.5 font-normal text-black"
                      data-cy="talent-acquisition-change-job-status-label"
                    >
                      Job Status
                      <TaRequiredMark data-cy="talent-acquisition-change-job-status-required-mark" />
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please select the job status!',
                    },
                  ]}
                  className="mb-0 [&_.ant-form-item-label]:!pb-3"
                >
                  <Select
                    id="talent-acquisition-change-job-status-select"
                    data-cy="talent-acquisition-change-job-status-select"
                    placeholder="Open"
                    className="w-full"
                    suffixIcon={TalentAcqSelectChevronSuffix}
                    getPopupContainer={() =>
                      document.getElementById('change-job-status-modal') ||
                      document.body
                    }
                  >
                    {JobStatus &&
                      Object?.values(JobStatus).map((status) => (
                        <Select.Option
                          key={status}
                          value={status}
                          id={`talent-acquisition-change-job-status-option-${status}`}
                          data-cy={`talent-acquisition-change-job-status-option-${status}`}
                        >
                          {status}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </div>

              <div
                className="mt-4 flex justify-end gap-2"
                data-cy="talent-acquisition-change-job-status-modal-footer-actions"
              >
                <Button
                  id="talent-acquisition-change-job-status-button-cancel"
                  data-cy="talent-acquisition-change-job-status-button-cancel"
                  type="default"
                  onClick={handleChangeStatusModalClose}
                  className="!h-9 !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] !border-[#D9D9D9] !bg-white hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
                >
                  Cancel
                </Button>
                <Button
                  id="talent-acquisition-change-job-status-button-submit"
                  data-cy="talent-acquisition-change-job-status-button-submit"
                  htmlType="submit"
                  type="primary"
                  className="!h-9 !px-4 !text-[14px] !font-normal !text-white !bg-[#1E40AF] hover:!bg-[#1D4ED8] !border !border-solid !border-[#1E40AF] hover:!border-[#1D4ED8]"
                >
                  Change
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
      </>
    )
  );
};

export default ChangeStatusModal;
