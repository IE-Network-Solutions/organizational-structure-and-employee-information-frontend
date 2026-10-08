'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useState, useEffect } from 'react';
import { Alert, Modal, Skeleton, Switch } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { useOkrSetting } from '@/hooks/useOkrSetting';
import {
  useUpdateOkrSetting,
  useSwitchOkrMode,
  usePatchOkrScoringMode,
} from '@/store/server/features/okrplanning/okr-setting/mutations';
import { useGetOkrSetting } from '@/store/server/features/okrplanning/okr-setting/queries';
import { OkrScoringMode } from '@/store/server/features/okrplanning/okr-setting/interface';
import OkrModeConfirmationModal from './_components/OkrModeConfirmationModal';
import OkrModeEffectsModal from './_components/OkrModeEffectsModal';
import UnreportedUsersModal from './_components/UnreportedUsersModal';
import NotReportedEmployeesList from './_components/NotReportedEmployeesList';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

type OkrModeOption = 'Basic' | 'Advanced';

const OKR_MODE_OPTIONS: Array<{
  value: OkrModeOption;
  title: string;
  description: string;
}> = [
  {
    value: 'Advanced',
    title: 'Advanced OKR',
    description:
      'Advanced OKR allows employees to define Objectives and Key Results for goal tracking. Daily and weekly plans are not linked to OKRs. OKR progress has no impact on variable pay.',
  },
  {
    value: 'Basic',
    title: 'Basic',
    description:
      'Basic OKR allows employees to define Objectives and Key Results for goal tracking. Daily and weekly plans are not linked to OKRs. OKR progress has no impact on variable pay.',
  },
];

const OkrTypePage = () => {
  const { okrMode, refetch, isInitialLoading } = useOkrSetting();
  const { data: setting, refetch: refetchSetting } = useGetOkrSetting();
  const { isLoading: isUpdating } = useUpdateOkrSetting();
  const { mutate: switchOkrMode, isLoading: isSwitching } = useSwitchOkrMode();
  const { mutate: patchOkrScoringMode, isLoading: isPatchingScoringMode } =
    usePatchOkrScoringMode();
  const {
    showNotReportedList,
    setShowNotReportedList,
    incompleteUserIds,
    setIncompleteUserIds,
  } = useOKRSettingStore();

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [effectsModalOpen, setEffectsModalOpen] = useState(false);
  const [unreportedModalOpen, setUnreportedModalOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<OkrModeOption | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<
    'BasicToAdvanced' | 'AdvancedToBasic' | null
  >(null);
  const [pendingScoringMode, setPendingScoringMode] =
    useState<OkrScoringMode | null>(null);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // Fetch setting data when component mounts
  useEffect(() => {
    refetchSetting();
  }, [refetchSetting]);

  const isModeBusy = isUpdating || isSwitching;

  const handleRadioChange = (mode: OkrModeOption) => {
    // If already in this mode, do nothing
    if (okrMode === mode) {
      return;
    }

    // Determine transition direction
    const direction: 'BasicToAdvanced' | 'AdvancedToBasic' =
      okrMode === 'Basic' || okrMode === null
        ? 'BasicToAdvanced'
        : 'AdvancedToBasic';

    setTargetMode(mode);
    setTransitionDirection(direction);
    setConfirmationModalOpen(true);
  };

  const handleConfirm = () => {
    if (!targetMode) return;

    switchOkrMode(targetMode, {
      onSuccess: () => {
        setConfirmationModalOpen(false);
        setEffectsModalOpen(true);
        refetch();
        refetchSetting();
      },
      onError: (error: any) => {
        if (error?.response?.status === 400) {
          const ids = error?.response?.data?.incompleteUserIds || [];
          setIncompleteUserIds(ids);
          setConfirmationModalOpen(false);
          setUnreportedModalOpen(true);
        } else {
          setConfirmationModalOpen(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setConfirmationModalOpen(false);
    setTargetMode(null);
    setTransitionDirection(null);
  };

  const handleEffectsModalClose = () => {
    setEffectsModalOpen(false);
    setTargetMode(null);
    setTransitionDirection(null);
  };

  const currentScoringMode = setting?.scoringMode ?? 'CLASSIC_AVERAGE';
  const isTypeWeighted = currentScoringMode === 'TYPE_WEIGHTED';

  const requestScoringModeChange = (checked: boolean) => {
    const nextMode: OkrScoringMode = checked
      ? 'TYPE_WEIGHTED'
      : 'CLASSIC_AVERAGE';
    if (nextMode === currentScoringMode) return;

    setScoringError(null);
    setPendingScoringMode(nextMode);
    setIsScoringModalOpen(true);
  };

  const confirmScoringModeChange = () => {
    if (!pendingScoringMode) return;

    patchOkrScoringMode(
      {
        scoringMode: pendingScoringMode,
      },
      {
        onSuccess: () => {
          setIsScoringModalOpen(false);
          setPendingScoringMode(null);
          refetchSetting();
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message;
          setScoringError(
            Array.isArray(message)
              ? message.join(', ')
              : message ||
                  'The scoring mode could not be updated. Check the tenant default weights and try again.',
          );
        },
      },
    );
  };

  if (showNotReportedList && transitionDirection) {
    return (
      <NotReportedEmployeesList
        userIds={incompleteUserIds}
        onBack={() => {
          setShowNotReportedList(false);
          setTransitionDirection(null);
          setIncompleteUserIds([]);
        }}
      />
    );
  }

  return (
    <div
      className="w-full py-5 sm:px-4"
      data-cy="okr-type-page-container"
      id="okr-type-page-container"
    >
      <div className="mx-auto items-center justify-center w-full max-w-[850px]">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p
            className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#2563eb]"
            data-cy="okr-type-eyebrow"
          >
            Workspace preferences
          </p>
          <h2
            className="mb-2 text-[24px] font-semibold leading-tight text-[#0f172a]"
            data-cy="okr-type-heading"
            id="okr-type-heading"
          >
            Switch between OKR types
          </h2>
          <p
            className="m-0 text-[13px] text-[#64748b]"
            data-cy="okr-type-description"
            id="okr-type-description"
          >
            Use the options below to choose how your workspace structures
            objectives and key results.
          </p>
        </div>

        {/* OKR type cards */}
        <div
          role="radiogroup"
          aria-labelledby="okr-type-heading"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          data-cy="okr-type-cards-container"
          id="okr-type-cards-container"
        >
          {isInitialLoading
            ? OKR_MODE_OPTIONS.map((option) => (
                <Skeleton.Button
                  key={option.value}
                  active
                  block
                  className="!h-[136px] !rounded-xl"
                  data-cy={`okr-type-${option.value.toLowerCase()}-card-skeleton`}
                />
              ))
            : OKR_MODE_OPTIONS.map((option) => {
                const isActive = okrMode === option.value;
                const key = option.value.toLowerCase();
                return (
                  <div
                    key={option.value}
                    role="radio"
                    aria-checked={isActive}
                    aria-disabled={isModeBusy}
                    tabIndex={isModeBusy ? -1 : 0}
                    onClick={() =>
                      !isModeBusy && handleRadioChange(option.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        if (!isModeBusy) handleRadioChange(option.value);
                      }
                    }}
                    className={`rounded-xl border bg-white p-5 outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 ${
                      isActive
                        ? 'border-[#3b82f6] shadow-[0_1px_3px_rgba(37,99,235,0.15)]'
                        : 'border-[#e2e8f0] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#cbd5e1] hover:shadow-[0_2px_6px_rgba(15,23,42,0.06)]'
                    } ${
                      isModeBusy
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                    }`}
                    data-cy={`okr-type-${key}-card`}
                    id={`okr-type-${key}-card`}
                  >
                    <div
                      className="mb-3 flex items-center gap-3"
                      data-cy={`okr-type-${key}-card-header`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isActive
                            ? 'border-[#2563eb]'
                            : 'border-[#cbd5e1] bg-white'
                        }`}
                        data-cy={`okr-type-${key}-radio`}
                      >
                        {isActive && (
                          <span className="h-[8px] w-[8px] rounded-full bg-[#2563eb]" />
                        )}
                      </span>
                      <h3
                        className="m-0 text-[14px] font-semibold text-[#0f172a]"
                        data-cy={`okr-type-${key}-card-title`}
                      >
                        {option.title}
                      </h3>
                    </div>
                    <p
                      className="m-0 pl-[30px] text-[12.5px] leading-[1.7] text-[#64748b]"
                      data-cy={`okr-type-${key}-card-description`}
                    >
                      {option.description}
                    </p>
                  </div>
                );
              })}
        </div>

        {/* Info note */}
        <div
          className="mt-6 rounded-lg border border-[#dbeafe] bg-[#eff6ff] px-4 py-2.5 text-center text-[11.5px] text-[#1e3a8a]"
          data-cy="okr-type-warning-text"
          id="okr-type-warning-text"
          role="note"
        >
          Only one OKR type can be active in a workspace at a time.
        </div>

        {/* Scoring mode */}
        <AccessGuard permissions={['manage_okr_settings']}>
          <section
            className="mt-6 rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            aria-labelledby="okr-scoring-mode-heading"
            data-cy="okr-scoring-mode-card"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <h3
                  id="okr-scoring-mode-heading"
                  className="mb-1.5 text-[14px] font-semibold text-[#0f172a]"
                >
                  Scoring mode
                </h3>
                <p className="m-0 max-w-[460px] text-[12.5px] leading-[1.7] text-[#64748b]">
                  Type-weighted scoring uses the configured objective-type
                  weights. Classic scoring continues to average objective
                  scores.
                </p>
              </div>
              <Switch
                className="okr-scoring-switch mt-0.5 shrink-0"
                checked={isTypeWeighted}
                loading={isPatchingScoringMode}
                onChange={requestScoringModeChange}
                aria-label="Use type-weighted scoring"
                data-cy="okr-scoring-mode-switch"
              />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-3 text-[11.5px]">
              <span className="text-[#64748b]">Current selection</span>
              <span
                className="font-semibold text-[#0f172a]"
                data-cy="okr-scoring-mode-current"
              >
                {isTypeWeighted ? 'Type-weighted' : 'Classic average'}
              </span>
            </div>

            {scoringError && (
              <Alert
                className="mt-4"
                type="error"
                showIcon
                message="Scoring mode was not changed"
                description={scoringError}
              />
            )}
          </section>
        </AccessGuard>
      </div>

      <style jsx global data-cy="okr-type-styles">{`
        .okr-scoring-switch.ant-switch-checked,
        .okr-scoring-switch.ant-switch-checked:hover:not(.ant-switch-disabled) {
          background: #1d4ed8;
        }
      `}</style>

      {/* Confirmation Modal */}
      {transitionDirection && (
        <OkrModeConfirmationModal
          open={confirmationModalOpen}
          transitionDirection={transitionDirection}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={isSwitching}
        />
      )}

      {/* Effects Modal */}
      {transitionDirection && (
        <OkrModeEffectsModal
          open={effectsModalOpen}
          transitionDirection={transitionDirection}
          onClose={handleEffectsModalClose}
        />
      )}

      {/* Unreported Users Modal */}
      {transitionDirection && (
        <UnreportedUsersModal
          open={unreportedModalOpen}
          transitionDirection={transitionDirection}
          onClose={() => setUnreportedModalOpen(false)}
          onViewList={() => {
            setUnreportedModalOpen(false);
            setShowNotReportedList(true);
          }}
        />
      )}

      <Modal
        title={
          pendingScoringMode === 'TYPE_WEIGHTED'
            ? 'Enable type-weighted scoring?'
            : 'Use classic average scoring?'
        }
        open={isScoringModalOpen}
        onCancel={() => {
          if (!isPatchingScoringMode) {
            setIsScoringModalOpen(false);
            setPendingScoringMode(null);
          }
        }}
        onOk={confirmScoringModeChange}
        okText={
          pendingScoringMode === 'TYPE_WEIGHTED'
            ? 'Enable type-weighted scoring'
            : 'Use classic scoring'
        }
        confirmLoading={isPatchingScoringMode}
        closable={!isPatchingScoringMode}
        maskClosable={!isPatchingScoringMode}
      >
        {pendingScoringMode === 'TYPE_WEIGHTED' ? (
          <p className="mb-0 text-[#595959]">
            Each objective must have an objective type, and active objective
            type weights must total 100% at the tenant default level. The system
            will verify this readiness before enabling the mode.
          </p>
        ) : (
          <p className="mb-0 text-[#595959]">
            Type and perspective fields remain available, but their weights and
            weighted scores will be ignored while classic average scoring is
            active.
          </p>
        )}
      </Modal>
    </div>
  );
};

export default OkrTypePage;
