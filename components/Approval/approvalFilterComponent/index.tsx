import { EntityTypeList } from '@/store/server/features/approver/interface';
import { useAllAllowanceStore } from '@/store/uistate/features/compensation/allowance';
import { Button, Col, Input, Modal, Row, Select } from 'antd';
import React from 'react';
import { LuSettings2 } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';

const ApprovalFilterComponent = ({
  searchParams,
  handleSearchInput,
  handleDepartmentChange,
}: {
  searchParams: any;
  handleSearchInput: (value: string, keyValue: any) => void;

  handleDepartmentChange: (value: string) => void;
}) => {
  const EntityType: EntityTypeList[] = [
    {
      name: 'Department',
    },
    {
      name: 'Hierarchy',
    },
    {
      name: 'User',
    },
  ];
  const { Option } = Select;
  const { isMobileFilterVisible, setIsMobileFilterVisible } =
    useAllAllowanceStore();
  const { setApproverType } = useApprovalStore();

  const router = useRouter();
  const handleNavigation = () => {
    router.push('/timesheet/settings/approvals/workFlow');
    setApproverType('');
  };

  return (
    <Row gutter={16} justify="space-between">
      <Col xl={18} lg={18} md={18} sm={16} xs={16}>
        <Input
          id={`inputEmployeeNames${searchParams.name}`}
          placeholder="Search workflow name"
          onChange={(e) => handleSearchInput(e.target.value, 'name')}
          className="w-full h-10"
          allowClear
        />
      </Col>

      <Col xl={6} lg={6} md={6} sm={8} xs={4}>
        <Select
          id={`selectDepartment${searchParams.entityType}`}
          placeholder="Applied For"
          onChange={handleDepartmentChange}
          allowClear
          className="w-full h-10 hidden sm:block"
        >
          {EntityType?.map((item: any, index) => (
            <Option key={index} value={item?.name}>
              {item?.name}
            </Option>
          ))}
        </Select>
        <div className="sm:hidden mb-4">
          <Button
            type="default"
            icon={<LuSettings2 size={24} className="text-gray-600" />}
            onClick={() => setIsMobileFilterVisible(!isMobileFilterVisible)}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-50 border-gray-200"
          />
        </div>
      </Col>
      <Col xl={18} lg={18} md={18} sm={16} xs={4}>
        <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
          <Button
            title="Set Approval"
            id="createUserButton"
            className="h-10 w-10 sm:w-auto sm:hidden"
            icon={<FaPlus />}
            onClick={handleNavigation}
            type="primary"
          >
            <span className="hidden sm:inline">Set Approval</span>
          </Button>
        </AccessGuard>
      </Col>
      {/* Mobile Filter Drawer */}
      <Modal
        title="Filter Options"
        centered
        onCancel={() => setIsMobileFilterVisible(false)}
        open={isMobileFilterVisible}
        width="85%"
        footer={
          <div className="flex justify-center items-center space-x-4">
            <Button
              type="default"
              className="px-10"
              onClick={() => setIsMobileFilterVisible(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsMobileFilterVisible(false)}
              type="primary"
              className="px-10"
            >
              Filter
            </Button>
          </div>
        }
      >
        <Select
          id={`selectDepartment${searchParams.entityType}`}
          placeholder="Applied For"
          onChange={handleDepartmentChange}
          allowClear
          className="w-full h-10"
        >
          {EntityType?.map((item: any, index) => (
            <Option key={index} value={item?.name}>
              {item?.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </Row>
  );
};

export default ApprovalFilterComponent;
