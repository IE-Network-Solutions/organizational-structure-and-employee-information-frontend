'use client';
import { Button, Card, Typography, Input } from 'antd';
import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { SearchOutlined } from '@ant-design/icons';
import PositionCards from './positionCards';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import CreatePosition from './createPosition';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const { Title } = Typography;

const Positions: React.FC = () => {
  const { setOpenPositionDrawer, searchTerm, setSearchTerm } =
    usePositionState();

  const showDrawer = () => {
    setOpenPositionDrawer(true);
  };
  return (
    <div
      className="w-full h-auto p-0 "
      id="settings-positions-container"
      data-cy="settings-positions-container"
    >
      <Card
        className="border-none"
        id="settings-positions-card"
        data-cy="settings-positions-card"
      >
        <div
          className="flex items-center justify-between"
          id="settings-positions-header"
          data-cy="settings-positions-header"
        >
          <Title
            level={5}
            id="settings-positions-title"
            data-cy="settings-positions-title"
          >
            Employee Positions
          </Title>
          <AccessGuard
            permissions={[Permissions.CreatePosition]}
            id="settings-positions-new-btn-guard"
            data-cy="settings-positions-new-btn-guard"
          >
            <Button
              type="primary"
              className="h-10 w-10 sm:w-auto"
              icon={<FaPlus />}
              onClick={showDrawer}
              id="settings-positions-new-btn"
              data-cy="settings-positions-new-btn"
            >
              <span
                className="hidden lg:inline"
                id="settings-positions-new-btn-text"
                data-cy="settings-positions-new-btn-text"
              >
                New Position
              </span>
            </Button>
          </AccessGuard>
        </div>
        <div
          className="mt-4 mb-4"
          id="settings-positions-search-container"
          data-cy="settings-positions-search-container"
        >
          <Input
            placeholder="Search employee Position"
            className="w-full h-12 rounded-lg border-gray-200"
            allowClear
            suffix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            id="settings-positions-search-input"
            data-cy="settings-positions-search-input"
          />
        </div>
        <div
          id="settings-positions-card-list"
          data-cy="settings-positions-card-list"
        >
          <PositionCards data-cy="settings-positions-card-list" />
        </div>
      </Card>

      <div id="settings-positions-create" data-cy="settings-positions-create">
        <CreatePosition data-cy="settings-positions-create-form" />
      </div>
    </div>
  );
};

export default Positions;
