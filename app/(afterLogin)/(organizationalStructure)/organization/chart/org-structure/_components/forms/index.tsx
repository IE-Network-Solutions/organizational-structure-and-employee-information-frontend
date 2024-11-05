import { OrgChart } from '@/store/server/features/organizationStructure/organizationalChart/interface';
import { Form, Input, Select } from 'antd';
import { RiErrorWarningFill } from 'react-icons/ri';

export const ArchiveForm = () => (
  <Form layout="vertical">
    <Form.Item
      label="Select Level"
      name="archiveLevel"
      rules={[{ required: true, message: 'Please enter the level to archive' }]}
    >
      <Input className="h-12 mt-4" placeholder="Which level to archive" />
    </Form.Item>
    <Form.Item>
      <p
        style={{
          color: '#595959',
        }}
        className="flex justify-start items-center"
      >
        <span style={{ marginRight: '8px' }} className="py-2 text-black ">
          <RiErrorWarningFill />
        </span>
        <div className="">This will affect the whole company structure</div>
      </p>
    </Form.Item>
  </Form>
);

interface MergeFormProps {
  isLoading: boolean;
  isError: boolean;
  departments: OrgChart | undefined;
}

export const MergeForm: React.FC<MergeFormProps> = ({
  isLoading,
  isError,
  departments,
}) => {

  const flattenDepartments = (data: OrgChart): Array<{ name: string; id?: string }> => {
    const result: Array<{ name: string; id?: string}> = [];
  
    const recurse = ({ id, name, department }: OrgChart): void => {
      result.push({ id, name});
      department.forEach(recurse);
    };
  
    recurse(data);
    return result;
  };
  
  return (
    <Form layout="vertical">
      <Form.Item
        label="Which Department to be merged"
        name="departmentToMerge"
        rules={[
          { required: true, message: 'Please select the department to merge' },
        ]}
      >
        <Select
          placeholder="Select department to merge"
          loading={isLoading}
          allowClear
          disabled={isLoading || isError}
          options={departments? flattenDepartments(departments).map((dept: any) => ({
            value: dept.id,
            label: dept.name,
          })) : [{value: '', label: ''}]}
        />
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
      >
        <Select
          placeholder="Select department to merge with"
          loading={isLoading}
          allowClear
          disabled={isLoading || isError}
          options={departments? flattenDepartments(departments).map((dept: any) => ({
            value: dept.id,
            label: dept.name,
          })) : [{value: '', label: ''}]}
        />
      </Form.Item>
      <Form.Item>
        <p style={{ color: '#595959' }} className="flex justify-start items-center">
          <span style={{ marginRight: '8px' }} className="py-2 text-black">
            <RiErrorWarningFill />
          </span>
          <div>This will affect the whole organizational structure!</div>
        </p>
      </Form.Item>
    </Form>
  );
};

export const DissolveForm = () => (
  <Form layout="vertical">
    <Form.Item
      label="Which Department to dissolve"
      name="departmentToDissolve"
      rules={[
        { required: true, message: 'Please select the department to dissolve' },
      ]}
    >
      <Input placeholder="Which department to dissolve" />
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
    >
      <Input placeholder="Which department you are assigning to" />
    </Form.Item>
    <Form.Item label="Employees to be assigned" name="employees">
      <Select mode="multiple" placeholder="Assign employees">
        <Select.Option value="jennifer_law">Jennifer Law</Select.Option>
        <Select.Option value="dawit_getachew">Dawit Getachew</Select.Option>
      </Select>
    </Form.Item>
  </Form>
);
