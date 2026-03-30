'use client';
import CustomButton from '@/components/common/buttons/customButton';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  useCreateOkrRule,
  useUpdateOkrRule,
} from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { useOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule';
import { OkrRule } from '@/store/uistate/features/okrplanning/monitoring-evaluation/okr-rule/interface';
import { Form, Input, Modal, Row, Col } from 'antd';
import React, { useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';

interface OkrRuleModalProps {
  open: boolean;
  onClose: () => void;
  okrRule?: OkrRule | null;
}

const OkrRuleModal: React.FC<OkrRuleModalProps> = ({
  open,
  onClose,
  okrRule,
}) => {
  const { setOkrRule } = useOkrRuleStore();
  const [form] = Form.useForm();
  const { mutate: createOkrRule, isLoading: isCreateLoading } =
    useCreateOkrRule();
  const { mutate: updateOkrRule, isLoading: isUpdateLoading } =
    useUpdateOkrRule();

  const handleModalClose = () => {
    form.resetFields();
    onClose();
    setOkrRule(null);
  };

  const onFinish = (values: any) => {
    const personal = parseFloat(values.myOkrPercentage);
    const team = parseFloat(values.teamOkrPercentage);

    if (personal + team === 100) {
      okrRule
        ? updateOkrRule(
            { ...values, id: okrRule?.id },
            {
              onSuccess: () => {
                handleModalClose();
              },
            },
          )
        : createOkrRule(values, {
            onSuccess: () => {
              handleModalClose();
            },
          });
    } else {
      NotificationMessage.warning({
        message: 'OKR Rule Total Should be equal to 100',
      });
    }
  };

  useEffect(() => {
    if (okrRule) {
      form.setFieldsValue(okrRule);
    } else {
      form.resetFields();
    }
  }, [okrRule, form]);

  const footer = (
    <div
      className="flex justify-end gap-2"
      data-cy="okr-rule-modal-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleModalClose}
        className="h-[32px] w-[68px] p-0 rounded-[8px] border-[#d9d9d9] flex items-center justify-center"
        textClassName="text-[14px] font-normal text-[#595959]"
        id="okr-rule-modal-cancel-button"
        data-cy="okr-rule-modal-cancel-button"
      />
      <CustomButton
        onClick={() => form.submit()}
        title={okrRule ? 'Update' : 'Create'}
        type="primary"
        loading={isCreateLoading || isUpdateLoading}
        className="h-[32px] w-[68px] p-0 rounded-[8px] bg-[#2b54ad] hover:bg-[#3d66c2] border-none flex items-center justify-center"
        textClassName="text-[14px] font-normal text-white"
        id="okr-rule-modal-submit-button"
        data-cy="okr-rule-modal-submit-button"
      />
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          data-cy="okr-rule-modal-title"
        >
          OKR Rule
        </span>
      }
      footer={footer}
      width={640}
      centered
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-rule-modal-close-icon"
        />
      }
      data-cy="okr-rule-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        className=""
        id="okr-rule-modal-form"
        data-cy="okr-rule-modal-form"
      >
        <Form.Item
          label={
            <div
              className="flex items-center gap-1"
              data-cy="okr-rule-modal-name-label"
            >
              <span
                className="text-[14px] font-normal text-[#030712]"
                data-cy="okr-rule-modal-name-label-text"
              >
                OKR rule name
              </span>
              <span
                className="text-[#ff4d4f] text-[14px] leading-none"
                aria-hidden
                data-cy="okr-rule-modal-name-required-indicator"
              >
                *
              </span>
            </div>
          }
          name="title"
          required
          rules={[
            { required: true, message: 'Please enter the OKR rule name' },
          ]}
          data-cy="okr-rule-modal-name-field"
        >
          <Input
            placeholder="Enter OKR rule name"
            className="h-10"
            data-cy="okr-rule-modal-name-input"
          />
        </Form.Item>

        <Row gutter={24} data-cy="okr-rule-modal-contribution-row">
          <Col span={12} data-cy="okr-rule-modal-personal-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-rule-modal-personal-label"
                >
                  <span
                    className="text-[14px] font-normal text-[#030712]"
                    data-cy="okr-rule-modal-personal-label-text"
                  >
                    Personal Contribution
                  </span>
                  <span
                    className="text-[#ff4d4f] text-[14px] leading-none"
                    aria-hidden
                    data-cy="okr-rule-modal-personal-required-indicator"
                  >
                    *
                  </span>
                </div>
              }
              name="myOkrPercentage"
              required
              rules={[{ required: true, message: 'Required' }]}
              data-cy="okr-rule-modal-personal-field"
            >
              <Input
                type="number"
                placeholder="Enter personal contribution"
                className="h-10"
                data-cy="okr-rule-modal-personal-input"
              />
            </Form.Item>
          </Col>
          <Col span={12} data-cy="okr-rule-modal-team-col">
            <Form.Item
              label={
                <div
                  className="flex items-center gap-1"
                  data-cy="okr-rule-modal-team-label"
                >
                  <span
                    className="text-[14px] font-normal text-[#030712]"
                    data-cy="okr-rule-modal-team-label-text"
                  >
                    Team Contribution
                  </span>
                  <span
                    className="text-[#ff4d4f] text-[14px] leading-none"
                    aria-hidden
                    data-cy="okr-rule-modal-team-required-indicator"
                  >
                    *
                  </span>
                </div>
              }
              name="teamOkrPercentage"
              required
              rules={[{ required: true, message: 'Required' }]}
              data-cy="okr-rule-modal-team-field"
            >
              <Input
                type="number"
                placeholder="Enter team contribution"
                className="h-10"
                data-cy="okr-rule-modal-team-input"
              />
            </Form.Item>
          </Col>
        </Row>

        <style jsx global data-cy="okr-rule-modal-styles">{`
          .okr-settings-modal .ant-modal-content {
            padding: 0 !important;
          }
          .okr-settings-modal .ant-modal-title {
          }
          .okr-settings-modal .ant-form-item-label > label {
            height: auto !important;
            line-height: 1.5 !important;
            padding-bottom: 4px !important;
          }
          .okr-settings-modal .ant-modal-body .ant-form-item,
          .okr-settings-modal .ant-modal-body .ant-row {
            margin-bottom: 12px !important;
          }
          .okr-settings-modal .ant-modal-body .ant-form-item + .flex-wrap {
            margin-top: -8px !important;
          }
          .okr-settings-modal .ant-modal-body > *:last-child {
            margin-bottom: 0 !important;
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 8px 24px !important;
            border-bottom: none !important;
            margin-bottom: 0 !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 12px 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 1px 24px 20px 24px !important;
            border-top: none !important;
            margin-top: 0 !important;
          }
        `}</style>
      </Form>
    </Modal>
  );
};

export default OkrRuleModal;
