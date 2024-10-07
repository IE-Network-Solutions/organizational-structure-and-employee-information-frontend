'use client';
import { Input, Card, Switch, Dropdown, Menu } from 'antd';
import { MoreOutlined, CheckOutlined } from '@ant-design/icons';
import { FC, useState } from 'react';

const PlanningPeriod: FC = () => {
  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item key="1">Edit</Menu.Item>
      <Menu.Item key="2">Delete</Menu.Item>
    </Menu>
  );

  return (
    <div className="p-4">
      {/* Search Input */}
      <div className="mb-4">
        <Input.Search
          placeholder="Search period by name"
          className="rounded-lg"
        />
      </div>

      {/* Daily Planning Period Card */}
      <Card
        title="Daily Planning Period"
        extra={
          <>
            <Switch
              checked={dailyEnabled}
              onChange={() => setDailyEnabled(!dailyEnabled)}
              className="mr-4"
              checkedChildren={<CheckOutlined />}
            />
            <Dropdown overlay={menu} trigger={['click']}>
              <MoreOutlined className="cursor-pointer" />
            </Dropdown>
          </>
        }
        className="mb-4"
        bodyStyle={{ padding: '0.5rem 1rem' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Action on Failure</p>
            <p>Reprimand</p>
          </div>
          <div>
            <p className="text-gray-500">Interval</p>
            <p>Daily</p>
          </div>
        </div>
      </Card>

      {/* Weekly Planning Period Card */}
      <Card
        title="Weekly Planning Period"
        extra={
          <>
            <Switch
              checked={weeklyEnabled}
              onChange={() => setWeeklyEnabled(!weeklyEnabled)}
              className="mr-4"
              checkedChildren={<CheckOutlined />}
            />
            <Dropdown overlay={menu} trigger={['click']}>
              <MoreOutlined className="cursor-pointer" />
            </Dropdown>
          </>
        }
        className="mb-4"
        bodyStyle={{ padding: '0.5rem 1rem' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500">Action</p>
            <p>Notification</p>
          </div>
          <div>
            <p className="text-gray-500">Interval</p>
            <p>Weekly</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlanningPeriod;
