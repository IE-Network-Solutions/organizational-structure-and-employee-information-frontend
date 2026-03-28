import React from 'react';
import { Form, Select, Button, Table, Tag, Avatar, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useRecongnitionStore } from '@/store/uistate/features/conversation/recognition';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { UserOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import {
  useCreateEmployeeRecognition,
  useCreateRecognition,
} from '@/store/server/features/CFR/recognition/mutation';

const { Option } = Select;

interface FormValues {
  recognitionType: string;
  criteria: string[];
}

interface EmployeeRecognitionModalProps {
  visible: boolean;
  onCancel: () => void;
  loading: boolean;
}

const EmployeeRecognitionModal: React.FC<EmployeeRecognitionModalProps> = ({
  onCancel,
  loading,
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
    setEmployeesList,
    setSelectedEmployeeId,
    filterOption,
    setFilterOption,
    dateRange,
    setSelectedRowKeys,
    resetSelection,
    visibleEmployee,
  } = useRecongnitionStore();
  const { data: getActiveFisicalYear } = useGetActiveFiscalYears();
  const { mutate: createEmployeeRecognition, isLoading } =
    useCreateEmployeeRecognition();
  const { isLoading: createRecognitionLoading } = useCreateRecognition();

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

    if (isLoading)
      return (
        <div
          className="flex items-center gap-2"
          data-cy="employee-recognition-modal-emp-render-loading"
        >
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 120 }} />
        </div>
      );
    if (isError) return <>-</>;

    return employeeData ? (
      <div
        className="flex items-center gap-1.5"
        data-cy="employee-recognition-modal-employee-container"
      >
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
        <div
          className="flex-1"
          data-cy="employee-recognition-modal-employee-name-container"
        >
          <div
            className="text-[12pxx`] text-gray-900"
            data-cy="employee-recognition-modal-employee-name"
          >
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
      width: 200,
      render: (recipientId: string) =>
        recipientId ? <EmpRender userId={recipientId} /> : '-',
      sorter: (a, b) => a.recipientId.localeCompare(b.recipientId),
    },
    {
      title: 'Criteria',
      dataIndex: 'criteriaScore',
      key: 'criteriaScore',
      width: 260,
      render: (criteriaScore: any[]) =>
        criteriaScore?.map((c, i) => (
          <Tag
            className="bg-lightblue text-[#3297db] border-none"
            key={i}
            data-cy={`employee-recognition-modal-criteria-tag-${i}`}
          >
            {c.name}
          </Tag>
        )),
      sorter: (a, b) => a.criteriaScore.length - b.criteriaScore.length, // Sort by number of criteria
    },
    {
      title: 'Total Value',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      width: 110,
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
    setVisible(false);
    setVisibleEmployee(false);
    form.resetFields();
    setRecognitionTypeId('');
    setDateRange({ startDate: '', endDate: '' });
    setEmployeesList([]);
    setFilterOption('all');
    setSelectedEmployees([]);
    setSelectedEmployeeId('');
    setSelectedRowKeys([]); // Reset selected rows
  };
  if (loading)
    return (
      <div
        className="space-y-4"
        data-cy="employee-recognition-modal-loading-shell"
      >
        <div
          className="grid grid-cols-12 gap-4 my-3"
          data-cy="employee-recognition-modal-loading-filters"
        >
          <div
            className="col-span-6"
            data-cy="employee-recognition-modal-loading-col-a"
          >
            <Skeleton.Input active block className="!h-10 !w-full" />
          </div>
          <div
            className="col-span-6"
            data-cy="employee-recognition-modal-loading-col-b"
          >
            <Skeleton.Input active block className="!h-10 !w-full" />
          </div>
        </div>

        <Skeleton paragraph={false} title={{ width: 220 }} active />

        <div
          className="rounded-md border border-gray-100 p-4"
          data-cy="employee-recognition-modal-loading-table-shell"
        >
          <div
            className="grid grid-cols-12 gap-3 pb-3 border-b border-gray-100"
            data-cy="employee-recognition-modal-loading-table-head"
          >
            <Skeleton.Input active className="col-span-1 !h-4 !w-4" />
            <Skeleton.Input active className="col-span-4 !h-4 !w-28" />
            <Skeleton.Input active className="col-span-5 !h-4 !w-24" />
            <Skeleton.Input active className="col-span-2 !h-4 !w-16" />
          </div>

          <div
            className="space-y-3 pt-3"
            data-cy="employee-recognition-modal-loading-table-body"
          >
            {[...Array(5).keys()].map((index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center"
                data-cy={`employee-recognition-modal-loading-row-${index}`}
              >
                <Skeleton.Input active className="col-span-1 !h-4 !w-4" />
                <div
                  className="col-span-4 flex items-center gap-2"
                  data-cy={`employee-recognition-modal-loading-row-emp-${index}`}
                >
                  <Skeleton.Avatar active size="small" />
                  <Skeleton.Input active className="!h-4 !w-28" />
                </div>
                <div
                  className="col-span-5 flex gap-2"
                  data-cy={`employee-recognition-modal-loading-row-tags-${index}`}
                >
                  <Skeleton.Input active className="!h-6 !w-20" />
                  <Skeleton.Input active className="!h-6 !w-20" />
                  <Skeleton.Input active className="!h-6 !w-16" />
                </div>
                <Skeleton.Input active className="col-span-2 !h-4 !w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  return (
    <div
      className={`${visibleEmployee ? 'block' : 'hidden'}`}
      data-cy="employee-recognition-modal"
      id="employeeRecognitionModal"
    >
      {/* <RecognitionTypeSelector
        createRecognition={createRecognition}
        data-cy="employee-recognition-modal-recognition-type-selector"
      /> */}
      <Form
        className=""
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        data-cy="employee-recognition-modal-form"
        id="employeeRecognitionModalForm"
      >
        <div
          className="grid grid-cols-12 gap-4 my-3"
          data-cy="employee-recognition-modal-filters"
          id="employeeRecognitionModalFilters"
        >
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
            className="w-full h-10 md:col-span-6 col-span-12"
            onChange={(value) => setSelectedEmployeeId(value)}
            data-cy="employee-recognition-modal-employee-select"
          >
            {employeeData?.items?.map((item: any) => (
              <Option
                key={item.id}
                value={item.id}
                data-cy={`employee-recognition-modal-employee-option-${item.id}`}
                id={`employeeRecognitionModalEmployeeOption${item.id}`}
              >
                {`${item?.firstName} ${item?.middleName} ${item?.lastName} ` ||
                  '-'}
              </Option>
            ))}
          </Select>
          <Select
            allowClear
            onChange={(value) => setFilterOption(value)}
            className="md:col-span-6 col-span-12 h-10"
            placeholder="Filter  By Selection"
            data-cy="employee-recognition-modal-filter-select"
            id="employeeRecognitionModalFilterSelect"
          >
            <Option
              value="all"
              data-cy="employee-recognition-modal-all"
              id="employee-recognition-modal-all"
            >
              All
            </Option>
            <Option
              value="selected"
              data-cy="employee-recognition-modal-selected"
              id="employee-recognition-modal-selected"
            >
              Selected
            </Option>
            <Option
              value="notSelected"
              data-cy="employee-recognition-modal-not-selected"
              id="employee-recognition-modal-not-selected"
            >
              Not Selected
            </Option>
          </Select>
        </div>
        <div
          className="h-80 min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-auto [-webkit-overflow-scrolling:touch] scrollbar-none"
          data-cy="employee-recognition-modal-table-scroll"
        >
          <p
            className="mt-2 text-sm text-gray-500"
            data-cy="employee-recognition-modal-selected-count"
            id="employeeRecognitionModalSelectedCount"
          >
            {selectedEmployees.length} employee(s) selected across filters.
          </p>
          <Table
            key={filterOption} // forces remount on filter change
            rowSelection={{ type: 'checkbox', ...rowSelection }}
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="recipientId"
            loading={createRecognitionLoading}
            scroll={{ x: 640 }}
            data-cy="employee-recognition-modal-table"
            id="employeeRecognitionModalTable"
          />
        </div>
        <Form.Item
          className="flex items-center justify-end gap-2"
          data-cy="employee-recognition-modal-footer"
          id="employeeRecognitionModalFooter"
        >
          <Button
            disabled={isLoading}
            onClick={handleCancel}
            style={{ marginRight: 8 }}
            data-cy="employee-recognition-modal-cancel-button"
            id="employeeRecognitionModalCancelButton"
          >
            Cancel
          </Button>
          <Button
            onClick={() => form.submit()} // Manually trigger form submission
            loading={isLoading}
            type="primary"
            htmlType="submit"
            disabled={selectedEmployees.length === 0}
            data-cy="employee-recognition-modal-create-button"
            id="employeeRecognitionModalCreateButton"
          >
            Create
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EmployeeRecognitionModal;
