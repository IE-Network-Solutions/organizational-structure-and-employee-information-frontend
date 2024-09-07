import { Button, Space, Spin, Switch, Table } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/ActionButton';
import { TableColumnsType } from '@/types/table/table';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import {
  AttendanceNotificationRule,
  AttendanceNotificationType,
} from '@/types/timesheet/attendance';
import React, { FC, useEffect, useState } from 'react';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import {
  useDeleteAttendanceNotificationType,
  useSetAttendanceNotificationType,
} from '@/store/server/features/timesheet/attendanceNotificationType/mutation';
import DeletePopover from '@/components/common/ActionButton/deletePopover';
import { useDeleteAttendanceNotificationRule } from '@/store/server/features/timesheet/attendanceNotificationRule/mutation';

export interface TypeTableProps {
  type: AttendanceNotificationType;
}

const TypeTable: FC<TypeTableProps> = ({ type }) => {
  const {
    setAttendanceRuleId,
    setIsShowCreateRuleSidebar,
    setAttendanceTypeId,
    setIsShowRulesAddTypeSidebar,
  } = useTimesheetSettingsStore();
  const [tableData, setTableData] = useState<any[]>([]);
  const { mutate: activeUpdate, isLoading } =
    useSetAttendanceNotificationType();
  const { mutate: deleteRule, isLoading: isLoadingDeleteRule } =
    useDeleteAttendanceNotificationRule();
  const { mutate: deleteType, isLoading: isLoadingDeleteType } =
    useDeleteAttendanceNotificationType();

  const columns: TableColumnsType<any> = [
    {
      title: 'Rule Name',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Days Set',
      dataIndex: 'daysSet',
      key: 'daysSet',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <div>{text}</div>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (item: AttendanceNotificationRule) => (
        <Space size={24}>
          <Button
            icon={<FiEdit2 size={16} />}
            type="primary"
            className="w-[30px] h-[30px]"
            loading={isLoading || isLoadingDeleteRule || isLoadingDeleteType}
            onClick={() => {
              setAttendanceRuleId(item.id);
              setIsShowCreateRuleSidebar(true);
            }}
          />

          <DeletePopover
            onDelete={() => {
              deleteRule(item.id);
            }}
          >
            <Button
              className="w-[30px] h-[30px]"
              danger
              loading={isLoading || isLoadingDeleteRule || isLoadingDeleteType}
              icon={<FiTrash2 size={16} />}
              type="primary"
            />
          </DeletePopover>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const nTable =
      type.attendanceNotificationRules.map((rule) => ({
        key: rule.id,
        title: rule.title,
        daysSet: rule.value,
        description: rule.description,
        action: rule,
      })) ?? [];

    setTableData(nTable);
  }, [type]);

  const activeChange = (e: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { attendanceNotificationRules, ...otherType } = type;
    activeUpdate({
      ...otherType,
      isActive: e,
    });
  };

  return (
    <Spin spinning={isLoading || isLoadingDeleteRule || isLoadingDeleteType}>
      <div className="p-6 border rounded-2xl border-gray-200 mt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="text-lg text-gray-900 font-bold flex-1">
            {type.title}
          </div>
          <Space size={12}>
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              value={type.isActive}
              onChange={activeChange}
            />
            <ActionButton
              onEdit={() => {
                setAttendanceTypeId(type.id);
                setIsShowRulesAddTypeSidebar(true);
              }}
              onDelete={() => {
                deleteType(type.id);
              }}
            />
          </Space>
        </div>

        <Table columns={columns} dataSource={tableData} pagination={false} />
      </div>
    </Spin>
  );
};

export default TypeTable;
