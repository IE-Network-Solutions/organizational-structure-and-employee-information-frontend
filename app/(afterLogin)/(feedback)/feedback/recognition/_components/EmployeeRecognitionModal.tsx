import React from 'react';
import { Modal, Form, Select, Button, Table, Tag, Avatar, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { UserOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useCreateEmployeeRecognition,
  useCreateRecognition,
} from '@/store/server/features/CFR/recognition/mutation';
import RecognitionTypeSelector from './recognitionTypeSelector';

const { Option } = Select;

interface FormValues {
  recognitionType: string;
  criteria: string[];
}

interface EmployeeRecognitionModalProps {
  visible: boolean;
  onCancel: () => void;
}

const EmployeeRecognitionModal: React.FC<EmployeeRecognitionModalProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm<FormValues>();
  const {
    selectedEmployees,
    setSelectedEmployees,
    recognitionTypeId,
    setVisibleEmployee,
    setRecognitionTypeId,
    setDateRange,
    setVisible,
    selectedEmployeeId,
    employeesList,
    setSelectedEmployeeId,
    filterOption,
    setFilterOption,
    dateRange,
    setSelectedRowKeys,
    resetSelection,
  } = useRecongnitionStore();
  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { mutate: createEmployeeRecognition, isLoading } =
    useCreateEmployeeRecognition();
  const { mutate: createRecognition, isLoading: createRecognitionLoading } =
    useCreateRecognition();

  const issuerId = useAuthenticationStore.getState().userId;

  const filteredEmployees = React.useMemo(() => {
    const baseFilter =
      employeesList?.filter((employee: any) => {
        if (selectedEmployeeId) {
          return employee?.recipientId === selectedEmployeeId;
        }

        if (filterOption === 'selected') {
          return selectedEmployees.some(
            (e: any) => e.recipientId === employee.recipientId,
          );
        }

        if (filterOption === 'notSelected') {
          return !selectedEmployees.some(
            (e: any) => e.recipientId === employee.recipientId,
          );
        }

        return true;
      }) || [];

    const missingSelected = selectedEmployees.filter(
      (sel: any) =>
        !baseFilter.some((emp: any) => emp.recipientId === sel.recipientId),
    );

    const merged = [...baseFilter, ...missingSelected];

    // Add default fields to any employee who doesn't have them
    return merged.map((emp: any) => ({
      ...emp,
      recipientId: emp.recipientId ?? emp.id, // make sure this is set
      criteriaScore: emp.criteriaScore ?? [],
      totalPoints: emp.totalPoints ?? 0,
    }));
  }, [employeesList, selectedEmployeeId, filterOption, selectedEmployees]);

  const { data: employeeData } = useGetAllUsers();

  const EmpRender = ({ userId }: any) => {
    const {
      isLoading,
      data: employeeData,
      isError,
    } = useGetSimpleEmployee(userId);

    if (isLoading) return <Spin size="small" />;
    if (isError) return <>-</>;

    return employeeData ? (
      <div className="flex items-center gap-1.5">
        {employeeData?.profileImage ? (
          <Avatar
            src={employeeData?.profileImage}
            style={{ verticalAlign: 'middle' }}
            size="small"
          />
        ) : (
          <Avatar
            icon={<UserOutlined />}
            style={{ verticalAlign: 'middle' }}
            size="small"
          />
        )}
        <div className="flex-1">
          <div className="text-[12pxx`] text-gray-900">
            {employeeData?.firstName || '-'} {employeeData?.middleName || '-'}{' '}
            {employeeData?.lastName || '-'}
          </div>
        </div>
      </div>
    ) : (
      '-'
    );
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Employees',
      dataIndex: 'recipientId',
      key: 'recipientId',
      render: (recipientId: string) =>
        recipientId ? <EmpRender userId={recipientId} /> : '-',
      sorter: (a, b) => a.recipientId.localeCompare(b.recipientId),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteriaScore',
      key: 'criteriaScore',
      render: (criteriaScore: any[]) =>
        criteriaScore?.map((c, i) => (
          <Tag className="bg-lightblue text-[#3297db] border-none" key={i}>
            {c.name}
          </Tag>
        )),
      sorter: (a, b) => a.criteriaScore.length - b.criteriaScore.length, // Sort by number of criteria
    },
    {
      title: 'Total Value',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      sorter: (a, b) => Number(a.totalPoints) - Number(b.totalPoints),
    },
  ];
  const rowSelection = {
    selectedRowKeys: selectedEmployees.map((emp: any) => emp.recipientId),
    onChange: (keys: React.Key[]) => {
      const updatedSelection = keys.map((key) => {
        const found = filteredEmployees.find((emp) => emp.recipientId === key);
        return {
          recipientId: found.recipientId ?? found.id,
          ...found,
          criteriaScore: found.criteriaScore ?? [],
          totalPoints: found.totalPoints ?? 0,
        };
      });

      setSelectedRowKeys(keys);
      setSelectedEmployees(updatedSelection);
    },
  };

  const handleFinish = () => {
    const payload = selectedEmployees.map((employee: any) => ({
      recipientId: employee.recipientId,
      issuerId: issuerId,
      calanderId: getActiveFisicalYear?.id,
      recognitionTypeId: recognitionTypeId,
      criteriaScore: employee.criteriaScore,
      totalPoints: employee.totalPoints,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }));
    createEmployeeRecognition(
      { value: payload },
      {
        onSuccess: () => {
          setVisibleEmployee(false);
          setVisible(false);
          form.resetFields();
          setRecognitionTypeId('');
          setDateRange({ startDate: '', endDate: '' });
          setSelectedEmployees([]);
          setSelectedEmployeeId('');
          resetSelection();
        },
      },
    );
  };
  const handleCancel = () => {
    onCancel();
    form.resetFields();
    setRecognitionTypeId('');
    setDateRange({ startDate: '', endDate: '' });
    setSelectedEmployees([]);
    setSelectedEmployeeId('');
    setSelectedRowKeys([]); // Reset selected rows
  };
  return (
    <Modal
      open={visible}
      onCancel={handleCancel}
      footer={
        <Form.Item style={{ textAlign: 'center' }}>
          <Button
            disabled={isLoading}
            onClick={handleCancel}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()} // Manually trigger form submission
            loading={isLoading}
            type="primary"
            htmlType="submit"
            disabled={selectedEmployees.length === 0}
          >
            Create
          </Button>
        </Form.Item>
      }
      centered
      width={800}
    >
      <CustomBreadcrumb
        title="List"
        subtitle="Employee's who fit the criteria"
      />
      <RecognitionTypeSelector createRecognition={createRecognition} />
      <Form
        className="h-80 overflow-y-auto scrollbar-none"
        form={form}
        onFinish={handleFinish}
        layout="vertical"
      >
        <div className="grid grid-cols-12 gap-4 my-3">
          <Select
            id="selectEmployee"
            placeholder="Search Employee"
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as any)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            className="w-full h-10 col-span-8"
            onChange={(value) => setSelectedEmployeeId(value)}
          >
            {employeeData?.items?.map((item: any) => (
              <Option key={item.id} value={item.id}>
                {`${item?.firstName} ${item?.middleName} ${item?.lastName} ` ||
                  '-'}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            onChange={(value) => setFilterOption(value)}
            className="col-span-4 h-10"
            placeholder="Filter  By Selection"
          >
            <Option value="all">All</Option>
            <Option value="selected">Selected</Option>
            <Option value="notSelected">Not Selected</Option>
          </Select>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {selectedEmployees.length} employee(s) selected across filters.
        </p>
        <Table
          key={filterOption} // forces remount on filter change
          rowSelection={{ type: 'checkbox', ...rowSelection }}
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="recipientId"
          loading={createRecognitionLoading}
        />
      </Form>
    </Modal>
  );
};

export default EmployeeRecognitionModal;
