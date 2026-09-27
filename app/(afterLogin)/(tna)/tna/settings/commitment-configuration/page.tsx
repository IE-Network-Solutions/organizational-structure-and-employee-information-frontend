'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Skeleton,
  Table,
} from 'antd';
import { LuPlus } from 'react-icons/lu';
import EmptyState from '@/components/empty';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { TableColumnsType } from '@/types/table/table';
import { formatToOptions } from '@/helpers/formatTo';
import {
  CommitmentConfiguration,
  formatCommitmentBand,
} from '@/types/tna/externalTna';
import { useGetCommitmentConfigurations } from '@/store/server/features/tna/commitmentConfiguration/queries';
import {
  useDeleteCommitmentConfiguration,
  useSetCommitmentConfiguration,
} from '@/store/server/features/tna/commitmentConfiguration/mutation';
import { useCurrency } from '@/store/server/features/tna/review/queries';

/**
 * Cost bands that decide how many days an employee is committed for after a
 * confirmed training. A request is matched to the band containing its amount.
 */
const CommitmentConfigurationSettingsPage = () => {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState<CommitmentConfiguration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetCommitmentConfigurations();
  const { data: currencies } = useCurrency();
  const { mutate: saveConfiguration, isLoading: isSaving } =
    useSetCommitmentConfiguration();
  const { mutate: deleteConfiguration, isLoading: isDeleting } =
    useDeleteCommitmentConfiguration();

  const configurations = useMemo(() => data?.items ?? [], [data]);

  const currencyOptions = useMemo(() => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return formatToOptions(list, 'code', 'id');
  }, [currencies]);

  const currencyCode = (currencyId?: string | null) => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return (
      list.find((currency: any) => currency?.id === currencyId)?.code ?? 'Any'
    );
  };

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields();
      setEditing(null);
    } else if (editing) {
      form.setFieldsValue({
        currencyId: editing.currencyId ?? undefined,
        amountFrom: editing.amountFrom,
        amountTo: editing.amountTo ?? undefined,
        applyAboveAmount: Boolean(editing.applyAboveAmount),
        commitmentInDays: editing.commitmentInDays,
      });
    }
  }, [isModalOpen, editing, form]);

  const onSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    const applyAboveAmount = Boolean(values.applyAboveAmount);

    saveConfiguration(
      {
        ...(editing ? { id: editing.id } : {}),
        currencyId: values.currencyId || undefined,
        amountFrom: Number(values.amountFrom),
        // An open-ended band carries no upper bound at all.
        ...(applyAboveAmount ? {} : { amountTo: Number(values.amountTo) }),
        applyAboveAmount,
        commitmentInDays: Number(values.commitmentInDays),
      },
      { onSuccess: () => setIsModalOpen(false) },
    );
  };

  const columns: TableColumnsType<CommitmentConfiguration> = [
    {
      title: 'Currency',
      dataIndex: 'currencyId',
      key: 'currencyId',
      render: (value: string | null) => currencyCode(value),
    },
    {
      title: 'Amount range',
      key: 'range',
      render: (unusedValue: unknown, record: CommitmentConfiguration) => {
        void unusedValue;
        return (
          <span data-cy={`tna-commitment-config-range-${record.id}`}>
            {formatCommitmentBand(record)}
          </span>
        );
      },
    },
    {
      title: 'Commitment',
      dataIndex: 'commitmentInDays',
      key: 'commitmentInDays',
      render: (value: number) => `${value ?? 0} day(s)`,
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: CommitmentConfiguration) => {
        void unusedValue;
        return (
          <AccessGuard
            permissions={[Permissions.ManageCommitmentConfiguration]}
          >
            <div
              className="flex items-center gap-2"
              data-cy={`tna-commitment-config-actions-${record.id}`}
            >
              <Button
                size="small"
                type="link"
                className="!px-0 !text-[#1E40AF]"
                onClick={() => {
                  setEditing(record);
                  setIsModalOpen(true);
                }}
                data-cy={`tna-commitment-config-edit-${record.id}`}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this band?"
                onConfirm={() => deleteConfiguration(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <Button
                  danger
                  size="small"
                  type="link"
                  className="!px-0"
                  loading={isDeleting}
                  data-cy={`tna-commitment-config-delete-${record.id}`}
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </AccessGuard>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div data-cy="tna-commitment-config-loading">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" data-cy="tna-commitment-config-page">
      <div
        className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
        data-cy="tna-commitment-config-header"
      >
        <p
          className="m-0 text-sm leading-[22px] text-black/45"
          data-cy="tna-commitment-config-description"
        >
          A confirmed training is matched to the band containing its cost, and
          the employee is committed for that many days.
        </p>
        <AccessGuard permissions={[Permissions.ManageCommitmentConfiguration]}>
          <Button
            type="primary"
            icon={<LuPlus size={16} />}
            className="h-10 w-full shrink-0 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 md:w-auto"
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
            data-cy="tna-commitment-config-add"
          >
            New band
          </Button>
        </AccessGuard>
      </div>

      {configurations.length ? (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={configurations}
          pagination={false}
          scroll={{ x: 'max-content' }}
          data-cy="tna-commitment-config-table"
        />
      ) : (
        <EmptyState
          compact
          title="No commitment bands yet"
          description="Add at least one band, otherwise requests cannot be confirmed."
          data-cy="tna-commitment-config-empty"
        />
      )}

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={480}
        // Never let the dialog exceed the viewport on a phone.
        className="!max-w-[calc(100vw-2rem)]"
        okText="Save"
        okButtonProps={{ loading: isSaving }}
        onOk={onSubmit}
        title={
          <span
            data-cy="tna-commitment-config-modal-title"
            className="font-[Calibri,sans-serif] text-[16px] font-bold leading-6 text-black/70"
          >
            {editing ? 'Edit band' : 'New band'}
          </span>
        }
        data-cy="tna-commitment-config-modal"
      >
        <Form
          layout="vertical"
          form={form}
          data-cy="tna-commitment-config-form"
        >
          <Form.Item
            name="currencyId"
            label={
              <span
                data-cy="tna-commitment-config-currency-label"
                className="text-[14px] font-normal"
              >
                Currency
              </span>
            }
            className="form-item"
            extra={
              <span
                data-cy="tna-commitment-config-currency-hint"
                className="text-xs text-black/45"
              >
                Leave empty to apply to any currency.
              </span>
            }
            data-cy="tna-commitment-config-currency-item"
          >
            <Select
              allowClear
              placeholder="Any currency"
              options={currencyOptions}
              className="h-10 [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-[8px]"
              data-cy="tna-commitment-config-currency"
            />
          </Form.Item>

          <div
            className="grid grid-cols-1 gap-x-4 md:grid-cols-2"
            data-cy="tna-commitment-config-amount-row"
          >
            <Form.Item
              name="amountFrom"
              label={
                <span
                  data-cy="tna-commitment-config-from-label"
                  className="text-[14px] font-normal"
                >
                  Amount from
                </span>
              }
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
              data-cy="tna-commitment-config-from-item"
            >
              <InputNumber
                min={0}
                className="h-10 w-full"
                data-cy="tna-commitment-config-from"
              />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev.applyAboveAmount !== current.applyAboveAmount
              }
            >
              {({ getFieldValue }) => {
                const applyAboveAmount = Boolean(
                  getFieldValue('applyAboveAmount'),
                );

                return (
                  <Form.Item
                    name="amountTo"
                    label={
                      <span
                        data-cy="tna-commitment-config-to-label"
                        className="text-[14px] font-normal"
                      >
                        Amount to
                      </span>
                    }
                    dependencies={['amountFrom', 'applyAboveAmount']}
                    rules={[
                      {
                        required: !applyAboveAmount,
                        message: 'Required',
                      },
                      ({ getFieldValue: getValue }) => ({
                        validator(unusedRule, value) {
                          void unusedRule;
                          if (getValue('applyAboveAmount')) {
                            return Promise.resolve();
                          }
                          const from = getValue('amountFrom');
                          if (
                            value === undefined ||
                            from === undefined ||
                            Number(value) >= Number(from)
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              'Must be greater than or equal to amount from',
                            ),
                          );
                        },
                      }),
                    ]}
                    className="form-item"
                    data-cy="tna-commitment-config-to-item"
                  >
                    <InputNumber
                      min={0}
                      className="h-10 w-full"
                      disabled={applyAboveAmount}
                      placeholder={
                        applyAboveAmount ? 'No upper limit' : undefined
                      }
                      data-cy="tna-commitment-config-to"
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>

          {/* Open-ended band so amounts past the last bounded range still
              have a rule of their own. */}
          <Form.Item
            name="applyAboveAmount"
            valuePropName="checked"
            initialValue={false}
            className="mb-4"
            data-cy="tna-commitment-config-above-item"
          >
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  form.setFieldValue('amountTo', undefined);
                }
              }}
              data-cy="tna-commitment-config-above-checkbox"
            >
              <div
                className="flex flex-col"
                data-cy="tna-commitment-config-above-content"
              >
                <span
                  className="text-sm font-normal text-gray-900"
                  data-cy="tna-commitment-config-above-label"
                >
                  Apply this rule to any amount above
                </span>
                <span
                  className="text-xs font-normal text-gray-500"
                  data-cy="tna-commitment-config-above-description"
                >
                  The band runs from the amount above with no upper limit.
                </span>
              </div>
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="commitmentInDays"
            label={
              <span
                data-cy="tna-commitment-config-days-label"
                className="text-[14px] font-normal"
              >
                Commitment in days
              </span>
            }
            rules={[{ required: true, message: 'Required' }]}
            className="form-item !mb-0"
            data-cy="tna-commitment-config-days-item"
          >
            <InputNumber
              min={1}
              className="h-10 w-full"
              data-cy="tna-commitment-config-days"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommitmentConfigurationSettingsPage;
