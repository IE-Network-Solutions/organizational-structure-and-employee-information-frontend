'use client';
import React from 'react';
import { Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useGetDepartmentLead } from '@/store/server/features/employees/employeeManagment/department/queries';

export interface Department {
  id: string;
  name: string;
  branchId: string;
  description?: string;
}

interface TeamCardProps {
  department: Department;
  isDragging?: boolean;
  isOverlay?: boolean;
  onRemove?: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  department,
  isDragging,
  isOverlay,
  onRemove,
}) => {
  const {
    data: teamLeadResponse,
    isLoading: isLoadingTeamLead,
    error: teamLeadError,
  } = useGetDepartmentLead(department.id);

  // Handle response - could be array, wrapped in data property, or direct object
  let teamLeadArray = [];
  if (Array.isArray(teamLeadResponse)) {
    teamLeadArray = teamLeadResponse;
  } else if (teamLeadResponse?.data) {
    teamLeadArray = Array.isArray(teamLeadResponse.data)
      ? teamLeadResponse.data
      : [teamLeadResponse.data];
  } else if (teamLeadResponse) {
    teamLeadArray = [teamLeadResponse];
  }

  // Get the first team lead (or the active one if available)
  const teamLead =
    teamLeadArray.length > 0
      ? teamLeadArray.find(
          (lead: any) => lead?.isActive || lead?.isPositionActive,
        ) || teamLeadArray[0]
      : null;

  const teamLeadName = teamLead
    ? `${teamLead.firstName || ''} ${teamLead.middleName || ''} ${teamLead.lastName || ''}`.trim() ||
      'Not assigned'
    : 'Not assigned';

  return (
    <div
      className={`relative max-w-[170px] mx-auto m-2 ${isDragging ? 'opacity-50' : ''} ${isOverlay ? 'rotate-2' : ''}`}
      data-cy={`transfer-team-card-${department.id}`}
      id={`transfer-team-card-${department.id}`}
    >
      {/* Plain card with team name and team leader */}
      <div
        id="transfer-team-card-div"
        data-cy="transfer-team-card-div"
        className={`bg-white border border-gray-200 rounded-lg py-4 px-1 shadow-sm relative ${
          isDragging ? 'shadow-lg' : ''
        } ${isOverlay ? 'shadow-xl' : ''}`}
      >
        {/* X button - only visible on mobile */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 lg:hidden z-20 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
            data-cy={`transfer-team-card-remove-${department.id}`}
            aria-label="Remove team"
          >
            <CloseOutlined 
            className="text-xs"
            data-cy="transfer-team-card-remove-icon"
            />
          </button>
        )}
        <div className="text-center"
        id="transfer-team-card-name-div"
        data-cy="transfer-team-card-name-div"
        >
          {isLoadingTeamLead ? (
            <p className="text-sm text-gray-400 m-0">Loading...</p>
          ) : teamLeadError ? (
            <>
              <Tooltip title={department.name} placement="top"
              id="transfer-team-card-name-tooltip"
              data-cy="transfer-team-card-name-tooltip"
              >
                <p
                  className="text-base font-bold text-gray-800 m-0 mb-0.5 truncate"
                  data-cy={`transfer-team-card-name-${department.id}`}
                >
                  {department.name}
                </p>
              </Tooltip>
              <p
                className="text-xs text-gray-500 m-0 truncate"
                data-cy={`transfer-team-card-lead-${department.id}`}
              >
                Not assigned
              </p>
            </>
          ) : (
            <>
              <Tooltip title={department.name} placement="top"
              id="transfer-team-card-name-tooltip"
              data-cy="transfer-team-card-name-tooltip"
              >
                <p
                  className="text-base font-bold text-gray-800 m-0 mb-0.5 truncate"
                  data-cy={`transfer-team-card-name-${department.id}`}
                >
                  {department.name}
                </p>
              </Tooltip>
              <p
                className="text-xs text-gray-600 m-0 truncate"
                data-cy={`transfer-team-card-lead-${department.id}`}
              >
                {teamLeadName}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
