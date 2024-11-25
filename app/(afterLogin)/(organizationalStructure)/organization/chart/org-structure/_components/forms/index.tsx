import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  MergingDepartment,
  UpdateDepartmentChild,
} from '@/store/server/features/organizationStructure/mergeDepartments/interface';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import { useMergeStore } from '@/store/uistate/features/organizationStructure/orgState/mergeDepartmentsStore';
import { Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
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

export const MergeForm = () => {
  const {
    rootDepartment,
    setRootDepartment,
    childDepartment,
    setChildDepartment,
    setMergeDepartment,
  } = useMergeStore();

  const { data: departments } = useGetDepartments();
  const { data: orgStructureData } = useGetOrgCharts();

  const OPTIONS = departments?.map((item: any) => ({
    value: item.id,
    label: item.name,
  }));

  const departmentCache: Record<string, any> = {};

  const findDepartmentWithChildren = (tree: any, id: string) => {
    // Check if department is already cached
    if (departmentCache[id]) {
      return departmentCache[id];
    }

    for (const node of tree) {
      if (node.id === id) {
        const departmentData = {
          id: node.id,
          name: node.name,
          description: node.description,
          branchId: node.branchId,
          children: node.department || [],
        };
        departmentCache[id] = departmentData; // Cache result
        return departmentData;
      }
      if (node.department?.length) {
        const result: any = findDepartmentWithChildren(node.department, id);
        if (result) {
          departmentCache[id] = result; // Cache result
          return result;
        }
      }
    }
    return null;
  };

  const Merge = () => {
    if (!orgStructureData || !rootDepartment?.id) {
      console.error(
        'Organization structure data or root department not available',
      );
      return;
    }

    const rootDept = findDepartmentWithChildren(
      orgStructureData.department,
      rootDepartment.id,
    );

    if (!rootDept) {
      console.error('Root department not found');
      return;
    }

    const departmentChildren = childDepartment.map((child) => {
      const departmentData = findDepartmentWithChildren(
        orgStructureData.department,
        child.id,
      );
      return {
        id: child.id,
        name: departmentData?.name || '',
        description: departmentData?.description || '',
      };
    });

    const mergeData = {
      id: rootDept.id,
      name: rootDept.name,
      description: rootDept.description,
      branchId: rootDept.branchId,
      departmentToDelete: childDepartment.map((child) => child.id),
      department: departmentChildren,
    };

    setMergeDepartment(mergeData);
  };

  useEffect(() => {
    if (childDepartment.length > 0 && rootDepartment?.id && orgStructureData) {
      Merge();
    }
  }, [childDepartment, rootDepartment, orgStructureData]);

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
          showSearch
          style={{ width: '100%' }}
          placeholder="Which Department to be merged"
          optionFilterProp="label"
          value={rootDepartment?.id}
          onChange={(id) =>
            setRootDepartment({
              id,
              name:
                departments?.find((dept: any) => dept.id === id)?.name || '',
              description:
                departments?.find((dept: any) => dept.id === id)?.description ||
                '',
            })
          }
          options={OPTIONS}
        />
      </Form.Item>

      <Form.Item
        label="Merge it with"
        name="mergeWith"
        rules={[
          {
            required: true,
            message: 'Please select the departments to merge with',
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Merge it with"
          style={{ width: '100%' }}
          value={childDepartment.map((child) => child.id)}
          onChange={(ids) =>
            setChildDepartment(
              ids.map((id: string) => {
                const department = departments?.find(
                  (dept: any) => dept.id === id,
                );
                return {
                  id,
                  name: department?.name || '',
                  description: department?.description || '',
                };
              }),
            )
          }
          options={OPTIONS}
        />
      </Form.Item>

      <Form.Item>
        <p style={{ color: '#595959' }}>
          <span style={{ marginRight: '8px' }}>ⓘ</span>This will affect the
          whole company structure
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
