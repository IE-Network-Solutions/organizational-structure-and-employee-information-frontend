import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetOrgCharts } from '@/store/server/features/organizationStructure/organizationalChart/query';
import { useMergeStore } from '@/store/uistate/features/organizationStructure/orgState/mergeDepartmentsStore';
import { useTransferStore } from '@/store/uistate/features/organizationStructure/orgState/transferDepartmentsStore';
import { Form, message, Select } from 'antd';
import { useEffect, useState } from 'react';
export const TransferForm = () => {
  const {
    rootDepartment,
    setRootDepartment,
    childDepartment,
    setChildDepartment,
    setTransferDepartment,
  } = useTransferStore();

  const { data: departments } = useGetDepartments();
  const { data: orgStructureData } = useGetOrgCharts();

  const OPTIONS = departments?.map((item: any) => ({
    value: item.id,
    label: item.name,
  }));

  const filteredChildDepartments = OPTIONS?.filter(
    (item: any) => item.value !== rootDepartment?.id,
  );

  const departmentCache: Record<string, any> = {};

  const findDepartmentWithChildren = (tree: any, id: string): any => {
    if (departmentCache[id]) return departmentCache[id];

    if (tree.id === id) {
      const departmentData = {
        id: tree.id,
        name: tree.name,
        description: tree.description,
        branchId: tree.branchId,
        children: tree.department || [],
      };
      departmentCache[id] = departmentData;
      return departmentData;
    }
    if (tree.department?.length) {
      for (const child of tree.department) {
        const result = findDepartmentWithChildren(child, id);
        if (result) {
          departmentCache[id] = result;
          return result;
        }
      }
    }

    return null;
  };

  const Merge = () => {
    if (!orgStructureData || !rootDepartment?.id) {
      message.error(
        'Organization structure data or root department not available',
      );
      return;
    }
    const rootDept = findDepartmentWithChildren(
      orgStructureData,
      rootDepartment.id,
    );

    if (!rootDept) {
      message.error('Root department not found');
      return;
    }
    const departmentChildren = childDepartment.map((child) => {
      const departmentData = findDepartmentWithChildren(
        orgStructureData,
        child.id,
      );
      return {
        id: child.id,
        name: departmentData?.name || '',
        branchId: departmentData?.branchId || '',
        description: departmentData?.description || '',
      };
    });

    const transferData = {
      id: rootDept.id,
      name: rootDept.name,
      description: rootDept.description,
      branchId: rootDept.branchId,
      departmentToDelete: childDepartment.map((child) => child.id),
      department: departmentChildren,
    };

    setTransferDepartment(transferData);
  };

  const handleRootDepartmentChange = (id: string) => {
    const department = departments?.find((dept: any) => dept.id === id);
    if (department) {
      setRootDepartment({
        id: department.id,
        name: department.name,
        branchId: department.branchId || '',
        description: department.description || '',
      });
    }
  };

  const handleChildDepartmentsChange = (ids: string[]) => {
    const updatedDepartments = ids.map((id: string) => {
      const department = departments?.find((dept: any) => dept.id === id);
      return {
        id,
        name: department?.name || '',
        branchId: department?.branchId || '',
        description: department?.description || '',
      };
    });
    setChildDepartment(updatedDepartments);
  };

  useEffect(() => {
    if (childDepartment.length > 0 && rootDepartment?.id && orgStructureData) {
      Merge();
    }
  }, [childDepartment, rootDepartment, orgStructureData]);

  return (
    <Form layout="vertical">
      <Form.Item
        label="Transfer To"
        name="Transfer to Department"
        rules={[
          { required: true, message: 'Please select the department to merge' },
        ]}
      >
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Which Department to be Transfer"
          optionFilterProp="label"
          value={rootDepartment?.id}
          onChange={handleRootDepartmentChange}
          options={OPTIONS}
        />
      </Form.Item>

      <Form.Item
        label="Transfer from"
        name="Transfer From Department"
        rules={[
          {
            required: true,
            message: 'Please select the department',
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Transfer it from"
          style={{ width: '100%' }}
          value={childDepartment.map((child) => child.id)}
          onChange={handleChildDepartmentsChange}
          options={filteredChildDepartments} // Use filtered child department options
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

export const MergeForm = () => {
  const { data: departments } = useGetDepartments(); // Fetch all departments
  const { data: orgStructureData } = useGetOrgCharts(); // Fetch org chart
  const setMergeData = useMergeStore((state) => state.setMergeData); // Access global store function

  const [rootDeptId, setRootDeptId] = useState<string | null>(null);
  const [childDeptIds, setChildDeptIds] = useState<string[]>([]);

  const OPTIONS = departments?.map((item: any) => ({
    value: item.id,
    label: item.name,
  }));

  const findDepartmentById = (id: string, orgStructure: any): any => {
    if (!orgStructure) return null; // Handle undefined/null data
    if (orgStructure.id === id) return orgStructure;

    for (const dept of orgStructure.department || []) {
      const found = findDepartmentById(id, dept);
      if (found) return found;
    }
    return null;
  };

  const Merge = () => {
    if (!rootDeptId || !childDeptIds.length) return; // Exit if necessary ids are missing

    const rootDepartment = findDepartmentById(rootDeptId, orgStructureData);
    if (rootDepartment) {
      const childDepartments = childDeptIds.map((id) =>
        findDepartmentById(id, orgStructureData),
      );
      if (childDepartments.every((dept) => dept)) {
        const immediateChildren = childDepartments.flatMap(
          (dept: any) => dept.department || [],
        );

        const departmentToDeleteIds = childDepartments.map(
          (child: any) => child.id,
        );

        const updatedDepartment = [
          ...rootDepartment.department,
          ...immediateChildren,
        ].filter((dept: any) => !departmentToDeleteIds.includes(dept.id));

        const mergeData = {
          id: rootDepartment.id,
          name: rootDepartment.name,
          description: rootDepartment.description,
          branchId: rootDepartment.branchId,
          departmentToDelete: departmentToDeleteIds,
          level: rootDepartment.level,
          department: updatedDepartment,
        };

        setMergeData(mergeData); // Update the global store with the new mergeData
        console.log(
          '---------------------------------this is the mergeData',
          mergeData,
        );
      }
    }
  };

  useEffect(() => {
    Merge();
  }, [rootDeptId, childDeptIds, orgStructureData, setMergeData]);

  return (
    <Form layout="vertical">
      {/* Merge To Department Select */}
      <Form.Item
        label="Merge To"
        name="Merge to Department"
        rules={[
          { required: true, message: 'Please select the department to merge' },
        ]}
      >
        <Select
          showSearch
          style={{ width: '100%' }}
          placeholder="Select the department to transfer to"
          optionFilterProp="label"
          options={OPTIONS}
          onChange={(value) => setRootDeptId(value)} // Set rootDeptId on change
        />
      </Form.Item>

      {/* Merge From Department Select */}
      <Form.Item
        label="Merge From"
        name="Merge From Department"
        rules={[
          {
            required: true,
            message: 'Please select the departments to merge from',
          },
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select departments to transfer from"
          style={{ width: '100%' }}
          options={OPTIONS}
          onChange={(values) => setChildDeptIds(values)} // Set childDeptIds on change
        />
      </Form.Item>

      {/* Information Note */}
      <Form.Item>
        <p style={{ color: '#595959' }}>
          <span style={{ marginRight: '8px' }}>ⓘ</span>This will affect the
          whole company structure.
        </p>
      </Form.Item>
    </Form>
  );
};
