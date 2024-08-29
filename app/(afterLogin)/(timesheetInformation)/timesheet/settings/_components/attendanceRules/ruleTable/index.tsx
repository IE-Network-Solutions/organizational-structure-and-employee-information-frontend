import { Button, Space, Switch, Table } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ActionButton from '@/components/common/ActionButton';
import { TableColumnsType } from '@/types/table/table';
import { FiEdit2 } from 'react-icons/fi';

const RuleTable = () => {
  const columns: TableColumnsType<any> = [
    {
      title: 'Rule Name',
      dataIndex: 'ruleName',
      key: 'ruleName',
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
      render: () => (
        <Button
          icon={<FiEdit2 size={16} />}
          type="primary"
          className="w-[30px] h-[30px]"
        />
      ),
    },
  ];

  const data = [
    {
      key: '1',
      ruleName: 'Annual',
      daysSet: '4',
      description: 'This will notify that employee warning letter',
      action: 'annual',
    },
    {
      key: '2',
      ruleName: 'Annual',
      daysSet: '4',
      description: 'This will notify that employee warning letter',
      action: 'annual',
    },
  ];

  return (
    <div className="p-6 border rounded-2xl border-gray-200 mt-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="text-lg text-gray-900 font-bold flex-1">
          Absenteeism
        </div>
        <Space size={12}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            defaultChecked
          />
          <ActionButton />
        </Space>
      </div>

      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default RuleTable;
