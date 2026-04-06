'use client';

import React from 'react';
import {
  Modal,
  Button,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Popover,
} from 'antd';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { EmploymentType, LocationType, JobStatus } from '@/types/enumTypes';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TalentAcqSelectChevronSuffix } from '../../../../_components/recruitmentIcons';

const { Option } = Select;

interface JobsFilterProps {
  open?: boolean;
  onClose: () => void;
  onOpenChange?: (visible: boolean) => void;
  onSaveFilter?: (values: Record<string, unknown>) => void;
  onResetFilter?: () => void;
  initialValues?: Record<string, unknown>;
  asPopover?: boolean;
  children?: React.ReactNode;
}

const FilterFormContent: React.FC<{
  form: ReturnType<typeof Form.useForm>[0];
  onClose: () => void;
  onSaveFilter?: (values: Record<string, unknown>) => void;
  onResetFilter?: () => void;
  departments: { id: string; name: string }[] | undefined;
  isDepartmentLoading: boolean;
}> = ({
  form,
  onClose,
  onSaveFilter,
  onResetFilter,
  departments,
  isDepartmentLoading,
}) => {
  const handleReset = () => {
    form.resetFields();
    onResetFilter?.();
  };

  const handleSaveFilter = async () => {
    try {
      const values = (await form.validateFields()) as Record<string, unknown>;
      onSaveFilter?.(values);
      onClose();
    } catch {
      // validation failed
    }
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        className="mt-2 max-w-full overflow-x-hidden [&_.ant-row]:max-w-full"
      >
        <Row gutter={16} wrap className="max-w-full">
          <Col xs={24} sm={12}>
            <Form.Item name="department" label="Department">
              <Select
                placeholder="Select department"
                allowClear
                loading={isDepartmentLoading}
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-department"
              >
                {departments?.map((dep: { id: string; name: string }) => (
                  <Option key={dep.id} value={dep.id}>
                    {dep.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="employmentType" label="Employment Type">
              <Select
                placeholder="Select employment type"
                allowClear
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-employment-type"
              >
                {Object.values(EmploymentType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="status" label="Status">
              <Select
                placeholder="Select status"
                allowClear
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-status"
              >
                <Option value={JobStatus.OPEN}>{JobStatus.OPEN}</Option>
                <Option value={JobStatus.CLOSED}>{JobStatus.CLOSED}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="location" label="Location">
              <Select
                placeholder="Select location"
                allowClear
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-location"
              >
                {Object.values(LocationType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="createdDate" label="Created Date">
              <DatePicker
                className="w-full"
                placeholder="Select date"
                data-cy="talent-acquisition-jobs-filter-created-date"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="closedDate" label="Closed Date">
              <DatePicker
                className="w-full"
                placeholder="Select date"
                data-cy="talent-acquisition-jobs-filter-closed-date"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div
        className="flex justify-end gap-2 mt-4"
        data-cy="talent-acquisition-jobs-filter-modal-footer-actions"
      >
        <Button
          type="default"
          onClick={handleReset}
          className="!h-9 !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] !border-[#D9D9D9] !bg-white hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
          data-cy="talent-acquisition-jobs-filter-modal-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={handleSaveFilter}
          className="!h-9 !px-4 !text-[14px] !font-normal !text-white !bg-[#1E40AF] hover:!bg-[#1D4ED8] !border !border-solid !border-[#1E40AF] hover:!border-[#1D4ED8]"
          data-cy="talent-acquisition-jobs-filter-modal-save"
        >
          Save Filter
        </Button>
      </div>
    </>
  );
};

const JobsFilterModal: React.FC<JobsFilterProps> = ({
  open = false,
  onClose,
  onOpenChange,
  onSaveFilter,
  onResetFilter,
  initialValues,
  asPopover = false,
  children,
}) => {
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();

  React.useEffect(() => {
    form.setFieldsValue(initialValues ?? {});
  }, [form, initialValues]);

  const renderFilterHeader = (onHeaderClose: () => void) => (
    <div
      className="relative"
      data-cy="talent-acquisition-jobs-filter-modal-header-wrap"
    >
      <button
        type="button"
        className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        onClick={onHeaderClose}
        aria-label="Close filter"
        data-cy="talent-acquisition-jobs-filter-modal-close"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          data-cy="talent-acquisition-jobs-filter-modal-close-icon"
        >
          <path
            d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            data-cy="talent-acquisition-jobs-filter-modal-close-icon-path"
          />
        </svg>
      </button>
      <div
        className="pr-10 text-lg font-semibold text-gray-900"
        data-cy="talent-acquisition-jobs-filter-modal-header-title"
      >
        Filter
      </div>
      <div
        className="mt-0.5 text-sm font-normal text-gray-500"
        data-cy="talent-acquisition-jobs-filter-modal-header-subtitle"
      >
        Select All filters that apply
      </div>
    </div>
  );

  const content = (
    <FilterFormContent
      form={form}
      onClose={onClose}
      onSaveFilter={onSaveFilter}
      onResetFilter={onResetFilter}
      departments={departments}
      isDepartmentLoading={isDepartmentLoading}
    />
  );

  if (asPopover) {
    if (isMobile) {
      return (
        <>
          <div
            className="inline-block"
            role="button"
            tabIndex={0}
            onClick={() => onOpenChange?.(true)}
            onKeyDown={(e) => e.key === 'Enter' && onOpenChange?.(true)}
            data-cy="talent-acquisition-jobs-filter-popover-trigger"
          >
            {children}
          </div>
          <Modal
            data-cy="talent-acquisition-jobs-filter-modal"
            title={renderFilterHeader(onClose)}
            open={open}
            onCancel={onClose}
            centered
            closable={false}
            width="calc(100vw - 2rem)"
            style={{ maxWidth: 560, top: 20 }}
            styles={{
              content: {
                maxHeight: 'calc(100vh - 2rem)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                overflowX: 'hidden',
              },
              body: {
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
                overflowX: 'hidden',
              },
              header: {
                overflowX: 'hidden',
              },
            }}
            footer={null}
          >
            {content}
          </Modal>
        </>
      );
    }
    return (
      <Popover
        data-cy="talent-acquisition-jobs-filter-popover"
        open={open}
        onOpenChange={(visible) => {
          onOpenChange?.(visible);
          if (!visible) onClose();
        }}
        trigger="click"
        placement="bottomLeft"
        align={{ offset: [0, 4] }}
        styles={{
          body: {
            padding: 0,
            overflowX: 'hidden',
            maxWidth: 'min(560px, calc(100vw - 2rem))',
          },
        }}
        content={
          <div
            className="w-full max-w-[min(560px,calc(100vw-2rem))] max-h-[min(80vh,720px)] overflow-x-hidden overflow-y-auto px-4 pb-4 pt-3"
            data-cy="talent-acquisition-jobs-filter-popover-content"
          >
            {renderFilterHeader(() => {
              onOpenChange?.(false);
              onClose();
            })}
            {content}
          </div>
        }
      >
        {children}
      </Popover>
    );
  }

  return (
    <Modal
      data-cy="talent-acquisition-jobs-filter-modal"
      title={renderFilterHeader(onClose)}
      open={open}
      onCancel={onClose}
      centered
      closable={false}
      width={560}
      styles={{
        content: { overflowX: 'hidden' },
        body: { overflowX: 'hidden' },
        header: { overflowX: 'hidden' },
        footer: { borderTop: 'none' },
      }}
      footer={
        <div
          className="flex justify-end gap-2"
          data-cy="talent-acquisition-jobs-filter-modal-footer"
        >
          <Button
            type="default"
            onClick={() => {
              form.resetFields();
              onResetFilter?.();
            }}
            className="!h-9 !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] !border-[#D9D9D9] !bg-white hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
            data-cy="talent-acquisition-jobs-filter-modal-reset"
          >
            Reset
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              try {
                const values = await form.validateFields();
                onSaveFilter?.(values);
                onClose();
              } catch {
                // validation failed
              }
            }}
            className="!h-9 !px-4 !text-[14px] !font-normal !text-white !bg-[#1E40AF] hover:!bg-[#1D4ED8] !border !border-solid !border-[#1E40AF] hover:!border-[#1D4ED8]"
            data-cy="talent-acquisition-jobs-filter-modal-save"
          >
            Save Filter
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-2 max-w-full overflow-x-hidden [&_.ant-row]:max-w-full"
      >
        <Row gutter={16} wrap className="max-w-full">
          <Col xs={24} sm={12}>
            <Form.Item name="department" label="Department">
              <Select
                placeholder="Select department"
                allowClear
                loading={isDepartmentLoading}
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-department"
              >
                {departments?.map((dep: { id: string; name: string }) => (
                  <Option key={dep.id} value={dep.id}>
                    {dep.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="employmentType" label="Employment Type">
              <Select
                placeholder="Select employment type"
                allowClear
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-employment-type"
              >
                {Object.values(EmploymentType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="status" label="Status">
              <Select
                placeholder="Select status"
                allowClear
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-status"
              >
                <Option value={JobStatus.OPEN}>{JobStatus.OPEN}</Option>
                <Option value={JobStatus.CLOSED}>{JobStatus.CLOSED}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="location" label="Location">
              <Select
                placeholder="Select location"
                allowClear
                suffixIcon={TalentAcqSelectChevronSuffix}
                data-cy="talent-acquisition-jobs-filter-location"
              >
                {Object.values(LocationType).map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="createdDate" label="Created Date">
              <DatePicker
                className="w-full"
                placeholder="Select date"
                data-cy="talent-acquisition-jobs-filter-created-date"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="closedDate" label="Closed Date">
              <DatePicker
                className="w-full"
                placeholder="Select date"
                data-cy="talent-acquisition-jobs-filter-closed-date"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default JobsFilterModal;
