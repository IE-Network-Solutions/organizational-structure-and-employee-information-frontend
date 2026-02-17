'use client';
import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import DroppableArea from '../ui/DroppableArea';
import DraggableTeamItem from '../cards/DraggableTeamItem';
import { Department } from '../cards/TeamCard';

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
      className="hidden lg:block w-[18.5%]"
      data-cy="merge-available-teams-panel"
    >
      <div className="mb-4" data-cy="merge-search-container">
        <Input
          placeholder="Search team"
          allowClear
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-0 py-0"
          data-cy="merge-search-input"
          suffix={
            <div
              className="text-gray-400 border-l border-gray-300 p-2"
              data-cy="merge-search-icon-container"
            >
              <SearchOutlined data-cy="merge-search-icon" />
            </div>
          }
        />
      </div>

      <DroppableArea
        id="available-teams"
        className="max-h-[300px] overflow-y-auto w-full p-4 rounded-lg border-2 scrollbar-hide"
        isEmpty={false}
      >
        {availableDepartments.map((dept: Department, index: number) => (
          <DraggableTeamItem
            key={dept.id}
            department={dept}
            index={index}
            getTeamColor={getTeamColor}
          />
        ))}
      </DroppableArea>
    </div>
  );
};

export default AvailableTeamsPanel;
