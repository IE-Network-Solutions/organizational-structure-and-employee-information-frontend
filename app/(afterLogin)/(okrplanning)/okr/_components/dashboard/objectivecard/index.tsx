import React from 'react';
import { Avatar, Dropdown, Menu } from 'antd';
import KeyResultTableRow from '../keyResultTableRow';
import EditObjective from '../editObjective';
import {
  useOKRStore,
  useObjectiveBasicStore,
} from '@/store/uistate/features/okrplanning/okr';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteObjective } from '@/store/server/features/okrplanning/okr/objective/mutations';
import {
  defaultObjective,
  ObjectiveProps,
} from '@/store/uistate/features/okrplanning/okr/interface';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { PiCalendarBold } from 'react-icons/pi';

const ObjectiveCard: React.FC<ObjectiveProps> = ({ objective, myOkr }) => {
  const { setObjectiveValue, objectiveValue, keyResultId, objectiveId, okrTab } =
    useOKRStore();
  const { userId } = useAuthenticationStore();
  const {
    editObjectiveModalObjectiveId,
    deleteModalObjectiveId,
    expandedObjectiveIds,
    openEditObjective,
    closeEditObjective,
    openDeleteModal,
    closeDeleteModal,
    toggleExpanded,
  } = useObjectiveBasicStore();
  const { mutate: deleteObjective, isLoading: isDeletingObjective } =
    useDeleteObjective();

  const objectiveIdStr = String(objective?.id ?? '');
  const open = editObjectiveModalObjectiveId === objectiveIdStr;
  const isDeleteModalOpen = deleteModalObjectiveId === objectiveIdStr;
  const expanded = expandedObjectiveIds[objectiveIdStr] ?? true;
  const { isMobile } = useIsMobile();
  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  const activeSessionId = activeFiscalYear?.sessions?.find(
    (item: any) => item?.active,
  )?.id;

  const isOwner = objective?.userId === userId;
  const isInActiveSession =
    !activeSessionId || objective?.sessionId === activeSessionId;
  const hideOwnTeamOkrActions = String(okrTab) === '2' && isOwner;

  const showDeleteModal = () => {
    openDeleteModal(objectiveIdStr);
    setObjectiveValue(objective);
  };
  const onCloseDeleteModal = () => {
    closeDeleteModal();
    setObjectiveValue(defaultObjective);
  };

  const showDrawer = () => {
    openEditObjective(objectiveIdStr);
    setObjectiveValue(objective);
  };

  const onClose = () => {
    closeEditObjective();
    setObjectiveValue(defaultObjective);
  };

  const completedKeyResults =
    objective?.keyResults?.filter((kr: any) => kr.progress === 100).length || 0;
  const totalKeyResults = objective?.keyResults?.length || 0;

  const menu =
    isOwner && isInActiveSession && !hideOwnTeamOkrActions ? (
      <Menu
        className="okr-actions-menu"
        items={[
          {
            key: '1',
            icon: <EditOutlined className="text-gray-700" />,
            label: 'Edit OKR',
            onClick: showDrawer,
          },
          {
            key: '2',
            icon: <DeleteOutlined className="text-red-500" />,
            label: 'Delete OKR',
            danger: true,
            onClick: showDeleteModal,
          },
        ]}
      />
    ) : null;

  const selectedObjective = objective?.id === objectiveId ? objective : null;
  const relatedKeyResults =
    (selectedObjective &&
      selectedObjective?.keyResults?.filter(
        (kr: any) => kr.objectiveId === objectiveId,
      )) ||
    [];
  const remainingKeyResults = relatedKeyResults?.filter(
    (kr: any) => kr?.id !== keyResultId,
  );
  const keyResultToDelete = relatedKeyResults.find(
    (kr: any) => kr.id === keyResultId,
  );
  const redistributedWeight =
    parseFloat(keyResultToDelete?.weight) / (remainingKeyResults.length || 1);
  const updatedKeyResults = remainingKeyResults.map((kr: any) => ({
    id: kr.id,
    weight: parseFloat(kr.weight) + redistributedWeight,
  }));

  const handleDeleteObjective = (id: string) => {
    deleteObjective(id, { onSuccess: () => onCloseDeleteModal() });
  };

  return (
    <div
      id={`objective-card-${objective?.id}`}
      data-cy={`okr-objective-card-${objective?.id}`}
      className={`${isMobile ? 'mb-4' : 'mb-6'}`}
    >
      <div
        data-cy={`okr-objective-card-wrapper-${objective?.id}`}
        className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      >
        <div
          className={`${expanded ? 'p-6 pb-2' : 'p-6'}`}
          data-cy={`okr-objective-card-body-${objective?.id}`}
        >
          <div
            className="flex items-start justify-between"
            data-cy={`okr-objective-card-inner-${objective?.id}`}
          >
            <div
              className="w-full"
              data-cy={`okr-objective-card-main-${objective?.id}`}
            >
              <div
                className="flex-1 min-w-0"
                data-cy={`okr-objective-card-content-${objective?.id}`}
              >
                <div
                  className="flex flex-wrap items-center justify-between sm:justify-start gap-2 mb-3 pl-10"
                  data-cy={`okr-objective-card-header-${objective?.id}`}
                >
                  <div
                    className="flex-1 sm:flex-none min-w-0"
                    data-cy={`okr-objective-card-progress-cell-${objective?.id}`}
                  >
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-[#DBEAFE] text-blue-700 border border-[#BFDBFE] whitespace-nowrap"
                      data-cy={`okr-objective-progress-badge-${objective?.id}`}
                    >
                      {Number(objective?.objectiveProgress)?.toLocaleString()}%
                      Objective Progress
                    </span>
                  </div>
                  <div
                    className="flex-1 sm:flex-none min-w-0 flex flex-wrap items-center justify-end sm:justify-start gap-2"
                    data-cy={`okr-objective-card-kr-count-cell-${objective?.id}`}
                  >
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
                      data-cy={`okr-objective-card-kr-count-badge-${objective?.id}`}
                    >
                      {completedKeyResults} - {totalKeyResults} Key Results Done
                    </span>
                    <span
                      className="hidden sm:inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border border-gray-200 text-gray-600 bg-white whitespace-nowrap"
                      data-cy={`okr-objective-card-days-left-badge-${objective?.id}`}
                    >
                      {objective?.daysLeft ?? '—'} Days Left
                    </span>
                  </div>
                </div>
                <div
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4"
                  data-cy={`okr-objective-card-row-${objective?.id}`}
                >
                  <div
                    className="min-w-0 order-1 sm:flex-1"
                    data-cy={`okr-objective-card-title-section-${objective?.id}`}
                  >
                    <div
                      className="flex min-h-8 items-center justify-between gap-2"
                      data-cy={`okr-objective-card-title-row-${objective?.id}`}
                    >
                      <div
                        className="flex min-h-8 min-w-0 items-center gap-2"
                        data-cy={`okr-objective-card-title-flex-${objective?.id}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpanded(objectiveIdStr)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 p-1 text-gray-400 transition-colors hover:bg-gray-50 sm:-translate-y-4"
                          data-cy={`okr-objective-expand-${objective?.id}`}
                        >
                          {expanded ? (
                            <MdKeyboardArrowUp size={20} />
                          ) : (
                            <MdKeyboardArrowDown size={20} />
                          )}
                        </button>
                        <h2
                          id={`objective-title-${objective?.id}`}
                          data-cy={`okr-objective-title-${objective?.id}`}
                          className="text-base sm:text-lg font-bold text-gray-900 m-0 min-w-0 leading-7 sm:leading-8"
                        >
                          {objective?.title}
                        </h2>
                      </div>
                      {objective?.isClosed === false &&
                        Number(objective?.objectiveProgress ?? 0) !== 100 &&
                        menu && (
                          <Dropdown
                            overlay={menu}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="okr-actions-dropdown"
                            data-cy={`okr-objective-menu-dropdown-mobile-${objective?.id}`}
                          >
                            <span
                              className="inline-flex h-8 max-h-8 items-center leading-none sm:hidden"
                              data-cy={`okr-objective-menu-trigger-mobile-${objective?.id}`}
                            >
                              <button
                                type="button"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 p-1 text-gray-400 hover:text-gray-600"
                                data-cy={`okr-objective-menu-button-${objective?.id}`}
                              >
                                <MoreHorizIcon
                                  sx={{ width: 24, height: 24 }}
                                  data-cy={`okr-objective-menu-icon-mobile-${objective?.id}`}
                                />
                              </button>
                            </span>
                          </Dropdown>
                        )}
                      {objective?.isClosed === false &&
                        Number(objective?.objectiveProgress ?? 0) !== 100 &&
                        menu && (
                          <Dropdown
                            overlay={menu}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="okr-actions-dropdown"
                            data-cy={`okr-objective-menu-dropdown-desktop-${objective?.id}`}
                          >
                            <span
                              className="hidden h-8 max-h-8 items-center leading-none sm:inline-flex sm:-translate-y-4"
                              data-cy={`okr-objective-menu-trigger-desktop-${objective?.id}`}
                            >
                              <button
                                type="button"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gray-200 p-1 text-gray-400 hover:text-gray-600"
                                data-cy={`okr-objective-menu-button-desktop-${objective?.id}`}
                              >
                                <MoreHorizIcon
                                  sx={{ width: 24, height: 24 }}
                                  data-cy={`okr-objective-menu-icon-desktop-${objective?.id}`}
                                />
                              </button>
                            </span>
                          </Dropdown>
                        )}
                    </div>
                    <div
                      className="mt-1 flex items-center pl-10 text-sm text-gray-500 sm:hidden"
                      data-cy={`okr-objective-card-days-left-mobile-${objective?.id}`}
                    >
                      <PiCalendarBold className="mr-2 flex-shrink-0 text-lg text-gray-400" />
                      <span data-cy={`okr-objective-card-days-left-mobile-text-${objective?.id}`}>
                        {objective?.daysLeft ?? '—'} Days Left
                      </span>
                    </div>
                  </div>
                  <div
                    className="order-2 flex flex-shrink-0 items-center justify-end gap-3 sm:ml-auto"
                    data-cy={`okr-objective-card-actions-${objective?.id}`}
                  >
                    {!myOkr && objective?.user && (
                      <div
                        className="flex items-center gap-3 sm:-translate-y-4"
                        data-cy={`okr-objective-assignee-${objective?.id}`}
                      >
                        <Avatar
                          size={40}
                          src={objective.user.profileImage}
                          className="border border-gray-200"
                        >
                          {!objective.user.profileImage &&
                            `${objective.user.firstName?.[0] || ''}${objective.user.lastName?.[0] || ''}`.toUpperCase()}
                        </Avatar>
                        <div
                          className="text-left sm:text-right"
                          data-cy={`okr-objective-card-assignee-info-${objective?.id}`}
                        >
                          <p
                            className="text-xs sm:text-sm font-semibold text-gray-900"
                            data-cy={`okr-objective-card-assignee-name-${objective?.id}`}
                          >
                            {[
                              objective.user.firstName,
                              objective.user.middleName,
                              objective.user.lastName,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          </p>
                          <p
                            className="text-[11px] sm:text-xs text-gray-500"
                            data-cy={`okr-objective-card-assignee-dept-${objective?.id}`}
                          >
                            {objective.user?.employeeJobInformation?.[0]
                              ?.department?.name ||
                              objective.user?.employeeJobInformation?.[0]
                                ?.position?.name ||
                              '-'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {expanded && objective?.keyResults?.length > 0 && (
          <div
            className="mt-4 border-t border-gray-200 overflow-x-auto"
            data-cy={`okr-objective-card-key-results-${objective?.id}`}
          >
            <table
              className="min-w-[900px] w-full table-auto divide-y divide-gray-200"
              data-cy={`okr-objective-card-key-results-table-${objective?.id}`}
            >
              <thead
                className="bg-gray-50"
                data-cy={`okr-objective-card-key-results-thead-${objective?.id}`}
              >
                <tr
                  data-cy={`okr-objective-card-key-results-header-row-${objective?.id}`}
                >
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-900 tracking-wider min-w-[280px]"
                    data-cy={`okr-objective-card-th-key-result-${objective?.id}`}
                  >
                    Key Result
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-[120px] whitespace-nowrap"
                    data-cy={`okr-objective-card-th-metrics-${objective?.id}`}
                  >
                    Metrics
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-[90px] whitespace-nowrap"
                    data-cy={`okr-objective-card-th-weight-${objective?.id}`}
                  >
                    Weight
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-[110px] whitespace-nowrap"
                    data-cy={`okr-objective-card-th-milestone-${objective?.id}`}
                  >
                    Milestone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-[220px] whitespace-nowrap"
                    data-cy={`okr-objective-card-th-progress-${objective?.id}`}
                  >
                    Progress
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 w-[56px] whitespace-nowrap"
                    data-cy={`okr-objective-card-th-actions-${objective?.id}`}
                  />
                </tr>
              </thead>
              <tbody
                className="bg-white divide-y divide-gray-200 text-sm"
                data-cy={`okr-objective-card-key-results-tbody-${objective?.id}`}
              >
                {objective.keyResults.map((keyResult: any) => (
                  <KeyResultTableRow
                    key={keyResult.id}
                    keyResult={keyResult}
                    myOkr={myOkr}
                    updatedKeyResults={updatedKeyResults}
                    objectiveId={objective?.id ?? ''}
                    objectiveUserId={objective?.userId}
                    isInActiveSession={isInActiveSession}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditObjective
        data-cy={`okr-objective-card-edit-objective-${objective?.id}`}
        objective={objectiveValue}
        open={open}
        onClose={onClose}
        isClosed={objective?.isClosed}
      />
      <DeleteModal
        data-cy={`okr-objective-card-delete-modal-${objective?.id}`}
        open={isDeleteModalOpen}
        onConfirm={() => handleDeleteObjective(objectiveValue.id as string)}
        onCancel={onCloseDeleteModal}
        loading={isDeletingObjective}
      />
    </div>
  );
};

export default ObjectiveCard;
