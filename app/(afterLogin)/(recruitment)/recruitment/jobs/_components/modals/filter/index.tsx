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
import { CloseOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

interface JobsFilterProps {
  open?: boolean;
  onClose: () => void;
  onOpenChange?: (visible: boolean) => void;
  onSaveFilter?: (values: Record<string, unknown>) => void;
  asPopover?: boolean;
  children?: React.ReactNode;
}

const FilterFormContent: React.FC<{
  form: ReturnType<typeof Form.useForm>[0];
  onClose: () => void;
  onSaveFilter?: (values: Record<string, unknown>) => void;
  departments: { id: string; name: string }[] | undefined;
  isDepartmentLoading: boolean;
}> = ({ form, onClose, onSaveFilter, departments, isDepartmentLoading }) => {
  const handleReset = () => {
    form.resetFields();
  };

  const handleSaveFilter = async () => {
    try {
      const values = await form.validateFields();
      onSaveFilter?.(values);
      onClose();
    } catch {
      // validation failed
    }
  };

  return (
    <>
      <Form form={form} layout="vertical" className="mt-2">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="department" label="Department">
              <Select
                placeholder="Select department"
                allowClear
                loading={isDepartmentLoading}
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
        className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200"
        data-cy="talent-acquisition-jobs-filter-modal-footer-actions"
      >
        <Button
          type="default"
          onClick={handleReset}
          className="border-gray-300 text-gray-700"
          data-cy="talent-acquisition-jobs-filter-modal-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={handleSaveFilter}
          className="!bg-[#6366F1] hover:!bg-[#4F46E5] border-0"
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
  asPopover = false,
  children,
}) => {
  const { isMobile } = useIsMobile();
  const [form] = Form.useForm();
  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();

  const header = (
    <div data-cy="talent-acquisition-jobs-filter-modal-header-wrap">
      <div
        className="text-lg font-semibold text-gray-900"
        data-cy="talent-acquisition-jobs-filter-modal-header-title"
      >
        Filter
      </div>
      <div
        className="text-sm font-normal text-gray-500 mt-0.5"
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
            title={header}
            open={open}
            onCancel={onClose}
            centered
            width="calc(100vw - 2rem)"
            style={{ maxWidth: 560, top: 20 }}
            styles={{
              content: {
                maxHeight: 'calc(100vh - 2rem)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              },
              body: {
                overflowY: 'auto',
                flex: 1,
                minHeight: 0,
                overflowX: 'hidden',
              },
            }}
            closeIcon={<CloseOutlined className="text-gray-500" />}
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
        content={
          <div
            className="w-full max-w-[min(560px,calc(100vw-2rem))] overflow-auto"
            data-cy="talent-acquisition-jobs-filter-popover-content"
          >
            {header}
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
      title={header}
      open={open}
      onCancel={onClose}
      centered
      width={560}
      closeIcon={<CloseOutlined className="text-gray-500" />}
      footer={
        <div
          className="flex justify-end gap-2"
          data-cy="talent-acquisition-jobs-filter-modal-footer"
        >
          <Button
            type="default"
            onClick={() => form.resetFields()}
            className="border-gray-300 text-gray-700"
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
            className="!bg-[#6366F1] hover:!bg-[#4F46E5] border-0"
            data-cy="talent-acquisition-jobs-filter-modal-save"
          >
            Save Filter
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="department" label="Department">
              <Select
                placeholder="Select department"
                allowClear
                loading={isDepartmentLoading}
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="talent-acquisition-jobs-filter-select-suffix"
                  >
                    ▼
                  </span>
                }
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
