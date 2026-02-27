'use client';
import { Card, Input, Row, Col } from 'antd';
import React from 'react';
import PositionCards from './positionCards';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import CreatePosition from './createPosition';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const Positions: React.FC = () => {
  const { setOpenPositionDrawer, searchTerm, setSearchTerm } =
    usePositionState();

  const showDrawer = () => {
    setOpenPositionDrawer(true);
  };
  return (
    <div
      className="w-full h-auto"
      id="settings-positions-container"
      data-cy="settings-positions-container"
    >
      <Row gutter={[16, 16]}>
        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
          <Card
            className="border border-gray-200 rounded-lg"
            id="settings-positions-card"
            data-cy="settings-positions-card"
          >
            <div
              className="p-4"
              id="settings-positions-search-container"
              data-cy="settings-positions-search-container"
            >
              <Input.Search
                placeholder="Search Position"
                className="w-full"
                allowClear
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={(value) => setSearchTerm(value)}
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
        </Col>
        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
          <div
            id="settings-positions-create"
            data-cy="settings-positions-create"
          >
            <CreatePosition data-cy="settings-positions-create-form" />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Positions;
