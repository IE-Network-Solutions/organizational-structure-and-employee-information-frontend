'use client';
import { Card, Input, Row, Col } from 'antd';
import React from 'react';
import PositionCards from './positionCards';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import CreatePosition from './createPosition';
import { SearchOutlined } from '@ant-design/icons';

const Positions: React.FC = () => {
  const { searchTerm, setSearchTerm } = usePositionState();

  return (
    <div
      className="w-full h-auto"
      id="settings-positions-container"
      data-cy="settings-positions-container"
    >
      <Row gutter={[16, 16]}>
        <Col className="sm:hidden" xl={12} lg={12} md={12} sm={24} xs={24}>
          <div
            id="settings-positions-create"
            data-cy="settings-positions-create"
          >
            <CreatePosition data-cy="settings-positions-create-form" />
          </div>
        </Col>
        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
          <Card
            className="border border-gray-200 rounded-lg"
            id="settings-positions-card"
            data-cy="settings-positions-card"
            bodyStyle={{ padding: 0 }}
          >
            <div
              className="p-4"
              id="settings-positions-search-container"
              data-cy="settings-positions-search-container"
            >
              <Input
                placeholder="Search Position"
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-0 py-0"
                data-cy="settings-positions-search-input"
                suffix={
                  <div
                    className="text-gray-400 border-l border-gray-300 px-3 py-2"
                    data-cy="settings-positions-search-icon-container"
                  >
                    <SearchOutlined data-cy="settings-positions-search-icon" />
                  </div>
                }
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
        <Col
          xl={12}
          lg={12}
          md={12}
          sm={24}
          xs={24}
          className="hidden sm:block"
          data-cy="settings-positions-create-col"
        >
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
