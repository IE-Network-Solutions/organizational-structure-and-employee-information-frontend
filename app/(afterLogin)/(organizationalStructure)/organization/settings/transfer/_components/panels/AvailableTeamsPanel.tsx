'use client';
import React from 'react';
import { Input } from 'antd';
import DroppableArea from '../ui/DroppableArea';
import DraggableTeamItem from '../cards/DraggableTeamItem';
import { Department } from '../cards/TeamCard';
import { SearchOutlined } from '@ant-design/icons';

interface AvailableTeamsPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableDepartments: Department[];
  getTeamColor: (index: number) => string;
}

const AvailableTeamsPanel: React.FC<AvailableTeamsPanelProps> = ({
  searchQuery,
  onSearchChange,
  availableDepartments,
  getTeamColor,
}) => {
  return (
    <div
      className="hidden lg:flex lg:flex-col lg:w-[18.5%] h-[calc(100vh-280px)]"
      data-cy="transfer-available-teams-panel"
    >
      <div className="mb-4 flex-shrink-0" data-cy="transfer-search-container">
        <Input
          placeholder="Search team"
          allowClear
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-0 py-0"
          data-cy="transfer-search-input"
          suffix={
            <div
              className="text-gray-400 border-l border-gray-300 p-2"
              data-cy="transfer-search-icon-container"
            >
              <SearchOutlined data-cy="transfer-search-icon" />
            </div>
          }
        />
      </div>

      <DroppableArea
        id="available-teams"
        data-cy="available-teams"
        className="flex-1 min-h-0 overflow-y-auto w-full p-4 rounded-lg border-2 scrollbar-hide"
        isEmpty={false}
      >
        {availableDepartments.map((dept: Department, index: number) => (
          <DraggableTeamItem
            key={dept.id}
            department={dept}
            index={index}
            getTeamColor={getTeamColor}
            data-cy={`transfer-available-team-${dept.id}`}
          />
        ))}
      </DroppableArea>
    </div>
  );
};

export default AvailableTeamsPanel;
