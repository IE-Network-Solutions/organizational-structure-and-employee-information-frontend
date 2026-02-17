'use client';
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DroppableArea from '../ui/DroppableArea';
import SortableTeamCard from '../cards/SortableTeamCard';
import TransferButton from '../ui/TransferButton';
import { Department } from '../cards/TeamCard';

interface ExpandedStateViewProps {
  sourceTeams: Department[];
  destinationTeam: Department | null;
  availableDepartments: Department[];
  filteredDepartments: any[];
  isSourceOver: boolean;
  isDestinationOver: boolean;
  onRemoveSourceTeam: (teamId: string) => void;
  onRemoveDestinationTeam: () => void;
  setSourceTeams: React.Dispatch<React.SetStateAction<Department[]>>;
  setDestinationTeam: React.Dispatch<React.SetStateAction<Department | null>>;
  handleAddAnotherTeam: () => void;
  handleTransfer: () => void;
  isLoading: boolean;
  hasItemsInBuckets: boolean;
  setIsSourceOver: (isOver: boolean) => void;
  setIsDestinationOver: (isOver: boolean) => void;
}

const ExpandedStateView: React.FC<ExpandedStateViewProps> = ({
  sourceTeams,
  destinationTeam,
  availableDepartments,
  filteredDepartments,
  isSourceOver,
  isDestinationOver,
  onRemoveSourceTeam,
  onRemoveDestinationTeam,
  setSourceTeams,
  setDestinationTeam,
  handleAddAnotherTeam,
  handleTransfer,
  isLoading,
  hasItemsInBuckets,
  setIsSourceOver,
  setIsDestinationOver,
}) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 relative pt-4 lg:pt-[60px] items-center justify-center w-full">
      {/* Left Dashed Box - Source Teams */}
      <div className="w-full max-w-[350px] lg:max-w-none lg:flex-1 relative z-10 flex flex-col items-center lg:items-stretch" data-cy="transfer-source-teams-panel">
        <div
          className={`border-2 rounded-lg p-4 bg-gray-50 w-full flex flex-col justify-center ${
            sourceTeams.length > 0 || isSourceOver ? 'border-solid border-primary' : 'border-dashed border-gray-400'
          }`}
          style={{ minHeight: '130px' }}
          data-cy="transfer-source-teams-container"
        >
          <DroppableArea
            id="source-teams"
            className="w-full flex flex-col"
            isEmpty={sourceTeams.length === 0}
            placeholder="Drag the team you want to transfer from"
            onDragOver={setIsSourceOver}
            mobileSelectProps={{
              placeholder: "Select department",
              value: null,
              options: availableDepartments.map((dept: Department) => ({
                value: dept.id,
                label: dept.name,
              })),
              onChange: (value) => {
                if (value) {
                  const dept = availableDepartments.find((d: Department) => d.id === value);
                  if (dept && !sourceTeams.find((t) => t.id === dept.id)) {
                    setSourceTeams([...sourceTeams, dept]);
                  }
                }
              },
              dataCy: "transfer-mobile-source-select",
            }}
          >
            {sourceTeams.length > 0 && (
              <SortableContext
                items={sourceTeams.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {sourceTeams.map((team) => (
                  <SortableTeamCard
                    key={team.id}
                    department={team}
                    onRemove={() => onRemoveSourceTeam(team.id)}
                  />
                ))}
              </SortableContext>
            )}
            
            {sourceTeams.length > 0 && (
              <div 
                className="text-center mb-3 mt-3"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                <button
                  type="button"
                  onClick={handleAddAnotherTeam}
                  className="text-primary text-sm font-medium underline underline-offset-4"
                  style={{ pointerEvents: 'auto' }}
                  data-cy="transfer-add-another-team"
                >
                  Add another team
                </button>
              </div>
            )}
          </DroppableArea>
        </div>
      </div>

      {/* Transfer Button - Between Two Dashed Boxes */}
      <TransferButton
        disabled={!destinationTeam || sourceTeams.length === 0}
        loading={isLoading}
        onClick={handleTransfer}
        hasItemsInBuckets={hasItemsInBuckets}
      />

      {/* Right Dashed Box - Destination Team */}
      <div className="w-full max-w-[350px] lg:max-w-none lg:flex-1 relative z-10 flex flex-col items-center lg:items-stretch" data-cy="transfer-destination-panel">
        <div
          className={`border-2 rounded-lg p-4 bg-gray-50 w-full flex flex-col justify-center ${
            destinationTeam || isDestinationOver ? 'border-solid border-primary' : 'border-dashed border-gray-400'
          }`}
          style={{ minHeight: '130px' }}
          data-cy="transfer-destination-container"
        >
          <DroppableArea
            id="destination-team"
            className="w-full flex flex-col"
            isEmpty={!destinationTeam}
            placeholder="Drag the team you want to transfer to"
            onDragOver={setIsDestinationOver}
            mobileSelectProps={{
              placeholder: "Select department",
              value: destinationTeam?.id || null,
              options: [
                ...(destinationTeam ? [{
                  value: destinationTeam.id,
                  label: destinationTeam.name,
                }] : []),
                ...availableDepartments.map((dept: Department) => ({
                  value: dept.id,
                  label: dept.name,
                }))
              ],
              onChange: (value) => {
                if (value) {
                  const dept = availableDepartments.find((d: Department) => d.id === value) ||
                              filteredDepartments.find((d: any) => d.id === value);
                  if (dept) {
                    setDestinationTeam({
                      id: dept.id,
                      name: dept.name,
                      branchId: dept.branchId,
                      description: dept.description,
                    });
                  }
                } else {
                  setDestinationTeam(null);
                }
              },
              dataCy: "transfer-mobile-destination-select",
            }}
          >
            {destinationTeam && (
              <SortableContext items={[destinationTeam.id]} strategy={verticalListSortingStrategy}>
                <SortableTeamCard
                  key={destinationTeam.id}
                  department={destinationTeam}
                  onRemove={onRemoveDestinationTeam}
                />
              </SortableContext>
            )}
          </DroppableArea>
        </div>
      </div>
    </div>
  );
};

export default ExpandedStateView;
