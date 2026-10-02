'use client';

import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  ObjectiveType,
  useObjectiveTypesStore,
} from '@/store/uistate/features/okrplanning/okrSetting/objectiveTypesStore';
import {
  CloseOutlined,
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Radio, Row, Tooltip } from 'antd';
import React, { useEffect } from 'react';

interface ObjectiveTypeModalProps {
  open: boolean;
  onClose: () => void;
  objectiveType?: ObjectiveType | null;
}

type TypeKind = 'business' | 'strategic';

interface TypeRow {
  name?: string;
  kind?: TypeKind;
}

const FieldLabel = ({
  label,
  tooltip,
  dataCy,
}: {
  label: string;
  tooltip: string;
  dataCy: string;
}) => (
  <div className="flex items-center gap-1" data-cy={`${dataCy}-label`}>
    <span
      className="text-[14px] font-medium text-[#262626]"
      data-cy={`${dataCy}-label-text`}
    >
      {label}
    </span>
    <Tooltip title={tooltip}>
      <QuestionCircleOutlined
        className="text-[#bfbfbf] text-[14px] ml-1 cursor-help"
        data-cy={`${dataCy}-tooltip`}
      />
    </Tooltip>
  </div>
);

const KindRadio = ({ dataCy }: { dataCy: string }) => (
  <Radio.Group className="flex items-center gap-4 h-11" data-cy={dataCy}>
    <Radio value="business" data-cy={`${dataCy}-business`}>
      Business
    </Radio>
    <Radio value="strategic" data-cy={`${dataCy}-strategic`}>
      Strategic
    </Radio>
  </Radio.Group>
);

const ObjectiveTypeModal: React.FC<ObjectiveTypeModalProps> = ({
  open,
  onClose,
  objectiveType,
}) => {
  const { setSelectedType, addTypes, updateType } = useObjectiveTypesStore();
  const [form] = Form.useForm();
  const isEdit = Boolean(objectiveType);

  const handleModalClose = () => {
    form.resetFields();
    onClose();
    setSelectedType(null);
  };

  const kindToStrategic = (kind?: TypeKind) => kind === 'strategic';

  const onFinish = (values: {
    name?: string;
    kind?: TypeKind;
    rows?: TypeRow[];
  }) => {
    if (isEdit && objectiveType) {
      if (!values.kind) {
        NotificationMessage.warning({
          message: 'Please select Business or Strategic',
        });
        return;
      }
      const result = updateType(objectiveType.id, {
        name: String(values.name || '').trim(),
        isStrategic: kindToStrategic(values.kind),
      });

      if (!result.ok) {
        NotificationMessage.warning({
          message: result.message || 'Unable to update objective type',
        });
        return;
      }

      NotificationMessage.success({ message: 'Objective type updated' });
      handleModalClose();
      return;
    }

    const rows = (values.rows || [])
      .map((row) => ({
        name: String(row?.name || '').trim(),
        isStrategic: kindToStrategic(row?.kind),
        kind: row?.kind,
      }))
      .filter((row) => row.name);

    if (rows.some((row) => !row.kind)) {
      NotificationMessage.warning({
        message: 'Please select Business or Strategic for each type',
      });
      return;
    }

    const result = addTypes(
      rows.map(({ name, isStrategic }) => ({ name, isStrategic })),
    );
    if (!result.ok) {
      NotificationMessage.warning({
        message: result.message || 'Unable to save objective types',
      });
      return;
    }

    NotificationMessage.success({ message: 'Objective types saved' });
    handleModalClose();
  };

  useEffect(() => {
    if (!open) return;
    if (objectiveType) {
      form.setFieldsValue({
        name: objectiveType.name,
        kind: objectiveType.isStrategic ? 'strategic' : 'business',
        rows: undefined,
      });
    } else {
      form.setFieldsValue({
        name: undefined,
        kind: undefined,
        rows: [{ name: '', kind: undefined }],
      });
    }
  }, [objectiveType, form, open]);

  const footer = (
    <div
      className="flex justify-end gap-3"
      id="okr-objective-type-modal-footer"
      data-cy="okr-objective-type-modal-footer"
    >
      <Button
        type="default"
        onClick={handleModalClose}
        className="h-10 px-6 rounded-lg border-[#d9d9d9] text-[#595959] hover:text-[#262626] font-medium"
        id="okr-objective-type-modal-cancel-button"
        data-cy="okr-objective-type-modal-cancel-button"
      >
        Cancel
      </Button>
      <Button
        type="primary"
        onClick={() => form.submit()}
        className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2] focus:bg-[#3d66c2] border-none font-medium flex items-center justify-center"
        id="okr-objective-type-modal-submit-button"
        data-cy="okr-objective-type-modal-submit-button"
      >
        {isEdit ? 'Update' : 'Create'}
      </Button>
    </div>
  );

  const kindRules = [
    { required: true, message: 'Please select Business or Strategic' },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={
        <span
          className="text-[20px] font-bold text-[#262626]"
          id="okr-objective-type-modal-title"
          data-cy="okr-objective-type-modal-title"
        >
          {isEdit ? 'Edit Objective Type' : 'Add Objective Types'}
        </span>
      }
      footer={footer}
      width={800}
      centered
      destroyOnClose
      closeIcon={
        <CloseOutlined
          className="text-[#8c8c8c]"
          data-cy="okr-objective-type-modal-close-icon"
        />
      }
      data-cy="okr-objective-type-modal"
      className="okr-settings-modal"
    >
      <Form
        form={form}
        name="objectiveTypeForm"
        layout="vertical"
        onFinish={onFinish}
        id="okr-objective-type-modal-form"
        data-cy="okr-objective-type-modal-form"
      >
        {isEdit ? (
          <Row gutter={24} data-cy="okr-objective-type-modal-edit-row">
            <Col span={12}>
              <Form.Item
                label={
                  <FieldLabel
                    label="Objective Type"
                    tooltip="Name of this objective type as it appears in Create Objective and filters."
                    dataCy="okr-objective-type-modal-name"
                  />
                }
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Please enter objective type name',
                  },
                ]}
                data-cy="okr-objective-type-modal-name-field"
              >
                <Input
                  placeholder="Enter objective type name"
                  className="h-11"
                  data-cy="okr-objective-type-modal-name-input"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <FieldLabel
                    label="Type"
                    tooltip="Business uses weighted KRs. Strategic uses Committed/Aspirational KRs without weight."
                    dataCy="okr-objective-type-modal-kind"
                  />
                }
                name="kind"
                rules={kindRules}
                data-cy="okr-objective-type-modal-kind-field"
              >
                <KindRadio dataCy="okr-objective-type-modal-kind-radio" />
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Form.List name="rows">
            {(fields, { add, remove }) => (
              <div
                className="flex flex-col gap-3"
                data-cy="okr-objective-type-modal-rows"
              >
                {fields.map(({ key, name, ...restField }, index) => (
                  <Row
                    key={key}
                    gutter={16}
                    align="top"
                    data-cy={`okr-objective-type-modal-row-${index}`}
                  >
                    <Col flex="auto">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label={
                          index === 0 ? (
                            <FieldLabel
                              label="Objective Type"
                              tooltip="Name of this objective type as it appears in Create Objective and filters."
                              dataCy={`okr-objective-type-modal-row-name-${index}`}
                            />
                          ) : undefined
                        }
                        className="mb-0"
                        rules={[
                          {
                            required: true,
                            message: 'Please enter objective type name',
                          },
                        ]}
                        data-cy={`okr-objective-type-modal-row-name-field-${index}`}
                      >
                        <Input
                          placeholder="Enter objective type name"
                          className="h-11"
                          data-cy={`okr-objective-type-modal-row-name-input-${index}`}
                        />
                      </Form.Item>
                    </Col>
                    <Col flex="260px">
                      <Form.Item
                        {...restField}
                        name={[name, 'kind']}
                        label={
                          index === 0 ? (
                            <FieldLabel
                              label="Type"
                              tooltip="Business uses weighted KRs. Strategic uses Committed/Aspirational KRs without weight."
                              dataCy={`okr-objective-type-modal-row-kind-${index}`}
                            />
                          ) : undefined
                        }
                        className="mb-0"
                        rules={kindRules}
                        data-cy={`okr-objective-type-modal-row-kind-field-${index}`}
                      >
                        <KindRadio
                          dataCy={`okr-objective-type-modal-row-kind-radio-${index}`}
                        />
                      </Form.Item>
                    </Col>
                    {fields.length > 1 && (
                      <Col
                        flex="40px"
                        className={index === 0 ? 'mt-8' : 'mt-1'}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          className="h-11 w-10 flex items-center justify-center"
                          data-cy={`okr-objective-type-modal-row-remove-${index}`}
                        />
                      </Col>
                    )}
                  </Row>
                ))}

                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ name: '', kind: undefined })}
                  className="w-full h-11 rounded-lg"
                  data-cy="okr-objective-type-modal-add-row-button"
                >
                  Add another type
                </Button>
              </div>
            )}
          </Form.List>
        )}

        <style jsx global data-cy="okr-objective-type-modal-styles">{`
          .okr-settings-modal .ant-modal-content {
            padding: 0 !important;
            border-radius: 8px !important;
          }
          .okr-settings-modal .ant-modal-title {
            margin-bottom: 24px !important;
          }
          .okr-settings-modal .ant-modal-header {
            padding: 20px 24px 16px 24px !important;
            border-bottom: none !important;
          }
          .okr-settings-modal .ant-modal-body {
            padding: 24px !important;
          }
          .okr-settings-modal .ant-modal-footer {
            padding: 8px 24px 24px 24px !important;
            border-top: none !important;
          }
          .okr-settings-modal .ant-form-item-label > label {
            height: auto !important;
            line-height: 1.5 !important;
            padding-bottom: 4px !important;
          }
        `}</style>
      </Form>
    </Modal>
  );
};

export default ObjectiveTypeModal;
