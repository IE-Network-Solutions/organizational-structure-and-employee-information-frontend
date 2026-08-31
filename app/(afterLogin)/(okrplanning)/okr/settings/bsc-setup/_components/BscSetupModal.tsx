'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Checkbox,
  DatePicker,
  Form,
  Modal,
  Select,
  Row,
  Col,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import {
  useCreateBscCycle,
  useUpdateBscCycle,
} from '@/store/server/features/bsc/mutation';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { BscCadence } from '@/types/bsc';

const { RangePicker } = DatePicker;

function asList(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function BscSetupModal() {
  const [form] = Form.useForm();
  const {
    setupModalOpen,
    editingConfig,
    closeSetupModal,
    setSelectedConfigId,
  } = useBscUiStore();
  const { data: activeFy } = useGetActiveFiscalYears();
  const { data: allFy } = useGetAllFiscalYears(50, 1);
  const { data: departmentsData } = useGetDepartments();
  const { data: positionsData } = useGetAllPositions();
  const createConfig = useCreateBscCycle();
  const updateConfig = useUpdateBscCycle();

  const fiscalYears = useMemo(() => {
    const items = allFy?.items || [];
    if (activeFy?.id && !items.find((y) => y.id === activeFy.id)) {
      return [activeFy, ...items];
    }
    return items.length ? items : activeFy ? [activeFy] : [];
  }, [allFy, activeFy]);

  const deptOptions = asList(departmentsData).map((d: any) => ({
    value: String(d.id),
    label: d.name || d.departmentName || 'Department',
  }));
  const positionOptions = asList(positionsData).map((p: any) => ({
    value: String(p.id),
    label: p.name || p.positionName || 'Position',
  }));

  useEffect(() => {
    if (!setupModalOpen) return;
    if (editingConfig) {
      const editCadence =
        editingConfig.cadence === BscCadence.Custom
          ? BscCadence.Monthly
          : editingConfig.cadence;
      form.setFieldsValue({
        cadence: editCadence || BscCadence.Monthly,
        fiscalYearId: editingConfig.fiscalYearId,
        departmentIds: editingConfig.departmentIds,
        positionIds: editingConfig.positionIds,
        isRecurring: editingConfig.isRecurring ?? false,
        dateRange:
          editingConfig.startDate && editingConfig.endDate
            ? [dayjs(editingConfig.startDate), dayjs(editingConfig.endDate)]
            : undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        cadence: BscCadence.Monthly,
        fiscalYearId: activeFy?.id,
        isRecurring: false,
        dateRange: undefined,
      });
    }
  }, [setupModalOpen, editingConfig, activeFy, form]);

  const handleClose = () => {
    form.resetFields();
    closeSetupModal();
  };

  const onFinish = async (values: any) => {
    if (
      !(values.departmentIds || []).length &&
      !(values.positionIds || []).length
    ) {
      form.setFields([
        {
          name: 'departmentIds',
          errors: ['Select at least one department or role'],
        },
      ]);
      return;
    }

    const range = values.dateRange as [Dayjs, Dayjs] | undefined;
    if (!range?.[0] || !range?.[1]) {
      form.setFields([
        { name: 'dateRange', errors: ['Select a date range'] },
      ]);
      return;
    }

    const startDate = range[0].format('YYYY-MM-DD');
    const endDate = range[1].format('YYYY-MM-DD');
    const periodLabel = `${range[0].format('MMM D, YYYY')} – ${range[1].format('MMM D, YYYY')}`;

    const fyName =
      fiscalYears.find((y) => y.id === values.fiscalYearId)?.name ||
      activeFy?.name ||
      '';
    const departmentNames = (values.departmentIds || []).map(
      (id: string) => deptOptions.find((o) => o.value === id)?.label || id,
    );
    const positionTitles = (values.positionIds || []).map(
      (id: string) => positionOptions.find((o) => o.value === id)?.label || id,
    );

    const recurringTag = values.isRecurring ? ' · Recurring' : '';
    const label = `${periodLabel} · ${values.cadence}${recurringTag} · ${fyName}`;

    const payload = {
      label,
      cadence: values.cadence as BscCadence,
      fiscalYearId: values.fiscalYearId,
      fiscalYearName: fyName,
      periodIds: [],
      periodLabels: [periodLabel],
      startDate,
      endDate,
      isRecurring: Boolean(values.isRecurring),
      useCustomDates: true,
      departmentIds: values.departmentIds || [],
      departmentNames,
      positionIds: values.positionIds || [],
      positionTitles,
    };

    if (editingConfig) {
      await updateConfig.mutateAsync({ id: editingConfig.id, input: payload });
      setSelectedConfigId(editingConfig.id);
    } else {
      const created = await createConfig.mutateAsync(payload);
      setSelectedConfigId(created.id);
    }
    handleClose();
  };

  return (
    <Modal
      open={setupModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={640}
      closeIcon={<CloseOutlined />}
      title={editingConfig ? 'Edit BSC Setup' : 'Add BSC Setup'}
      destroyOnClose
      data-cy="bsc-setup-modal"
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-2">
        <Form.Item
          name="fiscalYearId"
          label="Fiscal Year"
          rules={[{ required: true, message: 'Select fiscal year' }]}
        >
          <Select
            placeholder="Select fiscal year"
            options={fiscalYears.map((y) => ({
              value: y.id,
              label: y.name,
            }))}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={10}>
            <Form.Item
              name="cadence"
              label="Frequency"
              rules={[{ required: true, message: 'Select frequency' }]}
            >
              <Select
                placeholder="Select frequency"
                options={[
                  { value: BscCadence.Weekly, label: 'Weekly' },
                  { value: BscCadence.Monthly, label: 'Monthly' },
                  { value: BscCadence.Quarterly, label: 'Quarterly' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              name="dateRange"
              label="Period"
              rules={[{ required: true, message: 'Select a date range' }]}
            >
              <RangePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="isRecurring" valuePropName="checked" className="mb-4">
          <Checkbox>Recurring evaluations</Checkbox>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="departmentIds" label="Departments">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select departments"
                options={deptOptions}
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="positionIds" label="Roles">
              <Select
                mode="multiple"
                allowClear
                placeholder="Select roles"
                options={positionOptions}
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 mt-4">
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            onClick={() => form.submit()}
            title={editingConfig ? 'Update' : 'Create'}
            type="primary"
            loading={createConfig.isLoading || updateConfig.isLoading}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
          />
        </div>
      </Form>
    </Modal>
  );
}
