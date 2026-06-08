interface DepartmentNode {
  id: string;
  name: string;
  department?: DepartmentNode[];
}

export const isDepartmentEntityType = (entityType?: string | null) =>
  entityType?.toLowerCase() === 'department' ||
  entityType?.toLowerCase() === 'hierarchy';

export const isUserEntityType = (entityType?: string | null) =>
  entityType?.toLowerCase() === 'user';

export const flattenDepartments = (
  departments: DepartmentNode[] | DepartmentNode | null | undefined,
): DepartmentNode[] => {
  if (!departments) return [];

  const roots = Array.isArray(departments) ? departments : [departments];
  const flattened: DepartmentNode[] = [];

  const walk = (nodes: DepartmentNode[]) => {
    nodes.forEach((node) => {
      if (!node?.id) return;
      flattened.push({ id: node.id, name: node.name });
      if (node.department?.length) {
        walk(node.department);
      }
    });
  };

  walk(roots);
  return flattened;
};

export const findDepartmentById = (
  departments: DepartmentNode[] | DepartmentNode | null | undefined,
  id: string,
): DepartmentNode | null => {
  if (!id) return null;
  return flattenDepartments(departments).find((dept) => dept.id === id) ?? null;
};
