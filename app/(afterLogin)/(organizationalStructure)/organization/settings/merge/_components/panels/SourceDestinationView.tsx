'use client';
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DroppableArea from '../ui/DroppableArea';
import SortableTeamCard from '../cards/SortableTeamCard';
import MergeButton from '../ui/MergeButton';
import { Department } from '../cards/TeamCard';

interface SourceDestinationViewProps {
  sourceTeam: Department | null;
  destinationTeam: Department | null;
  availableDepartments: Department[];
  filteredDepartments: any[];
  isSourceOver: boolean;
  isDestinationOver: boolean;
  onRemoveSourceTeam: () => void;
  onRemoveDestinationTeam: () => void;
  setSourceTeam: React.Dispatch<React.SetStateAction<Department | null>>;
  setDestinationTeam: React.Dispatch<React.SetStateAction<Department | null>>;
  handleMerge: () => void;
  isLoading: boolean;
  hasItemsInBuckets: boolean;
  borderColorClass: string;
  textColorClass: string;
  setIsSourceOver: (isOver: boolean) => void;
  setIsDestinationOver: (isOver: boolean) => void;
  sourceBoxRef: React.RefObject<HTMLDivElement>;
  destinationBoxRef: React.RefObject<HTMLDivElement>;
  mergeButtonRef: React.RefObject<HTMLDivElement>;
  mergeButtonMobileRef: React.RefObject<HTMLDivElement>;
}

const SourceDestinationView: React.FC<SourceDestinationViewProps> = ({
  sourceTeam,
  destinationTeam,
  availableDepartments,
  filteredDepartments,
  isSourceOver,
  isDestinationOver,
  onRemoveSourceTeam,
  onRemoveDestinationTeam,
  setSourceTeam,
  setDestinationTeam,
  handleMerge,
  isLoading,
  hasItemsInBuckets,
  borderColorClass,
  textColorClass,
  setIsSourceOver,
  setIsDestinationOver,
  sourceBoxRef,
  destinationBoxRef,
  mergeButtonRef,
  mergeButtonMobileRef,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center pt-4 lg:pt-[60px] relative w-full">
      {/* Mobile: Stacked vertically with button after boxes */}
      <div className="flex flex-col lg:hidden gap-4 w-full items-center relative">
        {/* Vertical connecting lines - Mobile only */}
        {/* Line from source box to destination box */}
        <div 
          className={`absolute left-1/2 transform -translate-x-1/2 w-0.5 z-0 ${sourceTeam ? 'bg-primary' : 'bg-gray-400'}`}
          style={{ 
            top: '140px', // Start after source box
            height: '154px', // Height to reach destination box (130px box + 16px gap + 8px)
          }}
        />
        {/* Line from destination box to button */}
        <div 
          className={`absolute left-1/2 transform -translate-x-1/2 w-0.5 z-0 ${destinationTeam ? 'bg-primary' : 'bg-gray-400'}`}
          style={{ 
            top: '294px', // Start after destination box (140px + 154px)
            height: 'calc(100% - 294px - 80px)', // Span to button
          }}
        />
        
        {/* Source Box - Mobile */}
        <div className="w-full max-w-[350px] relative z-10 flex flex-col items-center" data-cy="merge-source-teams-panel">
          <div
            ref={sourceBoxRef}
            className={`border-2 rounded-lg p-4 bg-gray-50 w-full flex flex-col justify-center ${
              sourceTeam || isSourceOver ? 'border-solid border-primary' : 'border-spacing-1 border-dashed border-gray-200'
            }`}
            style={{ minHeight: '130px' }}
            data-cy="merge-source-teams-container"
          >
            <DroppableArea
              id="source-teams"
              className="w-full flex flex-col gap-3"
              isEmpty={!sourceTeam}
              placeholder="Drag the team you want to merge"
              onDragOver={setIsSourceOver}
              mobileSelectProps={{
                placeholder: "Select department to merge",
                value: sourceTeam?.id || null,
                options: [
                  ...(sourceTeam ? [{
                    value: sourceTeam.id,
                    label: sourceTeam.name,
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
                      setSourceTeam({
                        id: dept.id,
                        name: dept.name,
                        branchId: dept.branchId,
                        description: dept.description,
                      });
                    }
                  } else {
                    setSourceTeam(null);
                  }
                },
                dataCy: "merge-mobile-source-select",
              }}
            >
              {sourceTeam && (
                <SortableContext items={[sourceTeam.id]} strategy={verticalListSortingStrategy}>
                  <SortableTeamCard
                    key={sourceTeam.id}
                    department={sourceTeam}
                    onRemove={onRemoveSourceTeam}
                  />
                </SortableContext>
              )}
            </DroppableArea>
          </div>
        </div>

        {/* Destination Box - Mobile */}
        <div className="w-full max-w-[350px] relative z-10 flex flex-col items-center" data-cy="merge-destination-panel">
          <div
            ref={destinationBoxRef}
            className={`border-2 rounded-lg p-4 bg-gray-50 w-full flex flex-col justify-center ${
              destinationTeam || isDestinationOver ? 'border-solid border-primary' : 'border-spacing-1 border-dashed border-gray-200'
            }`}
            style={{ minHeight: '130px' }}
            data-cy="merge-destination-container"
          >
            <DroppableArea
              id="destination-team"
              className="w-full flex flex-col"
              isEmpty={!destinationTeam}
              placeholder="Drag the team you want to merge into"
              onDragOver={setIsDestinationOver}
              mobileSelectProps={{
                placeholder: "Select department to merge into",
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
                dataCy: "merge-mobile-destination-select",
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

        {/* Merge Button - Mobile (after boxes) */}
        <MergeButton
          disabled={!destinationTeam || !sourceTeam}
          loading={isLoading}
          onClick={handleMerge}
          hasItemsInBuckets={hasItemsInBuckets}
          borderColorClass={borderColorClass}
          textColorClass={textColorClass}
          isMobile={true}
          buttonRef={mergeButtonMobileRef}
        />
      </div>

      {/* Desktop: Side by side with button below */}
      <div className="hidden lg:flex flex-col items-center w-full">
        <div className="grid grid-cols-12 gap-8 w-full mb-28">
          {/* Left Dashed Box - Source Teams */}
          <div className="col-span-6 relative z-10 flex flex-col items-stretch" data-cy="merge-source-teams-panel">
            <div
              ref={sourceBoxRef}
              className={`border-2 rounded-lg p-4 bg-gray-50 w-full flex flex-col justify-center ${
                sourceTeam || isSourceOver ? 'border-solid border-primary' : 'border-spacing-1 border-dashed border-gray-200'
              }`}
              style={{ minHeight: '130px' }}
              data-cy="merge-source-teams-container"
            >
              <DroppableArea
                id="source-teams"
                className="w-full flex flex-col gap-3"
                isEmpty={!sourceTeam}
                placeholder="Drag the team you want to merge"
                onDragOver={setIsSourceOver}
              >
                {sourceTeam && (
                  <SortableContext items={[sourceTeam.id]} strategy={verticalListSortingStrategy}>
                    <SortableTeamCard
                      key={sourceTeam.id}
                      department={sourceTeam}
                      onRemove={onRemoveSourceTeam}
                    />
                  </SortableContext>
                )}
              </DroppableArea>
            </div>
          </div>

          {/* Right Dashed Box - Destination Team */}
          <div className="col-span-6 relative z-10 flex flex-col items-stretch" data-cy="merge-destination-panel">
            <div
              ref={destinationBoxRef}
              className={`border-2 rounded-lg p-4 bg-gray-50 w-full flex flex-col justify-center ${
                destinationTeam || isDestinationOver ? 'border-solid border-primary' : 'border-spacing-1 border-dashed border-gray-200'
              }`}
              style={{ minHeight: '130px' }}
              data-cy="merge-destination-container"
            >
              <DroppableArea
                id="destination-team"
                className="w-full flex flex-col"
                isEmpty={!destinationTeam}
                placeholder="Drag the team you want to merge into"
                onDragOver={setIsDestinationOver}
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

        {/* Merge Button - Desktop (below boxes) */}
        <MergeButton
          disabled={!destinationTeam || !sourceTeam}
          loading={isLoading}
          onClick={handleMerge}
          hasItemsInBuckets={hasItemsInBuckets}
          borderColorClass={borderColorClass}
          textColorClass={textColorClass}
          isMobile={false}
          buttonRef={mergeButtonRef}
        />
      </div>
    </div>
  );
};

export default SourceDestinationView;
