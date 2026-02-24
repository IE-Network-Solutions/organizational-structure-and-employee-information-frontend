'use client';
import React from 'react';
import DroppableArea from '../ui/DroppableArea';
import { Department } from '../cards/TeamCard';

interface InitialStateViewProps {
  availableDepartments: Department[];
  isSourceOver: boolean;
  setSourceTeams: React.Dispatch<React.SetStateAction<Department[]>>;
  sourceTeams: Department[];
  setIsSourceOver: (isOver: boolean) => void;
}

const InitialStateView: React.FC<InitialStateViewProps> = ({
  availableDepartments,
  isSourceOver,
  setSourceTeams,
  sourceTeams,
  setIsSourceOver,
}) => {
  return (
    <div 
    className="flex-1 flex items-center justify-center pt-4 lg:pt-[60px] w-full"
    id="transfer-initial-container"
    data-cy="transfer-initial-container"
    >
      <div
      className="w-full max-w-[350px] lg:max-w-md"
      id="transfer-initial-container-div"
      data-cy="transfer-initial-container-div"
      >
        <div
          className={`border-2 rounded-lg p-4 bg-gray-50 ${
            isSourceOver
              ? 'border-solid border-primary'
              : 'border-dashed border-gray-400'
          }`}
          style={{ minHeight: '130px' }}
          data-cy="transfer-initial-container"
        >
          <DroppableArea
            id="source-teams"
            className="w-full"
            isEmpty={true}
            placeholder="Drag the team you want to transfer from"
            onDragOver={setIsSourceOver}
            mobileSelectProps={{
              placeholder: 'Select department',
              value: null,
              options: availableDepartments.map((dept: Department) => ({
                value: dept.id,
                label: dept.name,
              })),
              onChange: (value) => {
                if (value) {
                  const dept = availableDepartments.find(
                    (d: Department) => d.id === value,
                  );
                  if (dept && !sourceTeams.find((t) => t.id === dept.id)) {
                    setSourceTeams([...sourceTeams, dept]);
                  }
                }
              },
              dataCy: 'transfer-mobile-source-select-initial',
            }}
          >
            {null}
          </DroppableArea>
        </div>
      </div>
    </div>
  );
};

export default InitialStateView;
