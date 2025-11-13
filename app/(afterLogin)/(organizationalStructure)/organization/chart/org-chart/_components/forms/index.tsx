import { Form, Input, Select } from 'antd';
import { RiErrorWarningFill } from 'react-icons/ri';

export const ArchiveForm = () => (
  <Form layout="vertical" data-cy="org-chart-archive-form" id="org-chart-archive-form">
    <Form.Item
      label="Select Level"
      name="archiveLevel"
      rules={[{ required: true, message: 'Please enter the level to archive' }]}
      data-cy="org-chart-archive-level-field"
    >
      <Input className="h-12 mt-4" placeholder="Which level to archive" data-cy="org-chart-archive-level-input" id="org-chart-archive-level-input" />
    </Form.Item>
    <Form.Item>
      <p
        style={{
          color: '#595959',
        }}
        className="flex justify-start items-center"
        data-cy="org-chart-archive-info"
        id="org-chart-archive-info"
      >
        <span style={{ marginRight: '8px' }} className="py-2 text-black ">
          <RiErrorWarningFill />
        </span>
        <div className="">This will affect the whole company structure</div>
      </p>
    </Form.Item>
  </Form>
);

export const MergeForm = () => (
  <Form layout="vertical" data-cy="org-chart-merge-form" id="org-chart-merge-form">
    <Form.Item
      label="Which Department to be merged"
      name="departmentToMerge"
      rules={[
        { required: true, message: 'Please select the department to merge' },
      ]}
      data-cy="org-chart-merge-department-field"
    >
      <Input placeholder="Which department to be merged" data-cy="org-chart-merge-department-input" id="org-chart-merge-department-input" />
    </Form.Item>
    <Form.Item
      label="Merge it with"
      name="mergeWith"
      rules={[
        {
          required: true,
          message: 'Please select the department to merge with',
        },
      ]}
      data-cy="org-chart-merge-with-field"
    >
      <Input placeholder="Merge it with" data-cy="org-chart-merge-with-input" id="org-chart-merge-with-input" />
    </Form.Item>
    <Form.Item>
      <p style={{ color: '#595959' }} data-cy="org-chart-merge-info" id="org-chart-merge-info">
        <span style={{ marginRight: '8px' }}>ⓘ</span>This will affect the whole
        company structure
      </p>
    </Form.Item>
  </Form>
);

export const DissolveForm = () => (
  <Form layout="vertical" data-cy="org-chart-dissolve-form" id="org-chart-dissolve-form">
    <Form.Item
      label="Which Department to dissolve"
      name="departmentToDissolve"
      rules={[
        { required: true, message: 'Please select the department to dissolve' },
      ]}
      data-cy="org-chart-dissolve-department-field"
    >
      <Input placeholder="Which department to dissolve" data-cy="org-chart-dissolve-department-input" id="org-chart-dissolve-department-input" />
    </Form.Item>
    <Form.Item
      label="Which Department you assign to"
      name="assignTo"
      rules={[
        {
          required: true,
          message: 'Please select the department to assign to',
        },
      ]}
      data-cy="org-chart-dissolve-assign-to-field"
    >
      <Input placeholder="Which department you are assigning to" data-cy="org-chart-dissolve-assign-to-input" id="org-chart-dissolve-assign-to-input" />
    </Form.Item>
    <Form.Item label="Employees to be assigned" name="employees" data-cy="org-chart-dissolve-employees-field">
      <Select mode="multiple" placeholder="Assign employees" data-cy="org-chart-dissolve-employees-select" id="org-chart-dissolve-employees-select">
        <Select.Option value="jennifer_law">Jennifer Law</Select.Option>
        <Select.Option value="dawit_getachew">Dawit Getachew</Select.Option>
      </Select>
    </Form.Item>
  </Form>
);
