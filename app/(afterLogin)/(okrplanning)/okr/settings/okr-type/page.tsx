'use client';

/* eslint-disable local-rules/data-cy-required */

import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  InputNumber,
  Modal,
  Radio,
  Skeleton,
  Switch,
} from 'antd';
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

/**
 * Score ceiling applied to the Target→Stretch band. At 100 the band collapses
 * and over-achievement disappears, so this must never be used as a silent
 * fallback for an unloaded or cleared input.
 */
const DEFAULT_STRETCH_SCORE_MAX = 120;

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
  const [targetMode, setTargetMode] = useState<'Basic' | 'Advanced' | null>(
    null,
  );
  const [transitionDirection, setTransitionDirection] = useState<
    'BasicToAdvanced' | 'AdvancedToBasic' | null
  >(null);
  const [pendingScoringMode, setPendingScoringMode] =
    useState<OkrScoringMode | null>(null);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [stretchScoreMax, setStretchScoreMax] = useState<number>(
    DEFAULT_STRETCH_SCORE_MAX,
  );
  const [isStretchScoreMaxEdited, setIsStretchScoreMaxEdited] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);

  // Fetch setting data when component mounts
  useEffect(() => {
    refetchSetting();
  }, [refetchSetting]);

  useEffect(() => {
    setStretchScoreMax(setting?.stretchScoreMax ?? DEFAULT_STRETCH_SCORE_MAX);
    setIsStretchScoreMaxEdited(false);
  }, [setting?.stretchScoreMax]);

  const handleRadioChange = (mode: 'Basic' | 'Advanced') => {
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
        // Only send the ceiling when the admin actually changed it, so a mode
        // toggle can never overwrite the configured value.
        ...(isStretchScoreMaxEdited ? { stretchScoreMax } : {}),
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

  const saveStretchScoreMax = () => {
    patchOkrScoringMode(
      { stretchScoreMax },
      { onSuccess: () => refetchSetting() },
    );
  };

  const isBasicActive = okrMode === 'Basic';
  const isAdvancedActive = okrMode === 'Advanced';

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
      className="w-full"
      data-cy="okr-type-page-container"
      id="okr-type-page-container"
    >
      {/* Heading */}
      <h2
        className="text-[20px] font-bold text-[#262626] text-center mb-3"
        data-cy="okr-type-heading"
        id="okr-type-heading"
      >
        Switch Between OKR Types
      </h2>

      {/* Description */}
      <p
        className="text-[14px] text-[#595959] text-center mb-10 max-w-2xl mx-auto"
        data-cy="okr-type-description"
        id="okr-type-description"
      >
        Use the below buttons to switch between the two OKR types provided in
        your work space. Please note this will affect the interface of Objective
        screen
      </p>

      {/* Radio Button Cards — skeleton replaces card footprint only while mode is loading */}
      <div
        className="mb-12 flex flex-col items-center justify-center gap-6 px-4 lg:flex-row"
        data-cy="okr-type-cards-container"
        id="okr-type-cards-container"
      >
        {isInitialLoading ? (
          <>
            <Skeleton.Button
              active
              className="!h-[200px] !w-full !max-w-[420px] !min-w-0 !rounded-[8px] lg:!w-[420px]"
              data-cy="okr-type-advanced-card-skeleton"
            />
            <Skeleton.Button
              active
              className="!h-[200px] !w-full !max-w-[420px] !min-w-0 !rounded-[8px] lg:!w-[420px]"
              data-cy="okr-type-basic-card-skeleton"
            />
          </>
        ) : (
          <>
            {/* Advanced OKR Card */}
            <div
              onClick={() =>
                !(isUpdating || isSwitching) && handleRadioChange('Advanced')
              }
              className={`relative w-full max-w-[420px] cursor-pointer rounded-[8px] border-2 p-8 transition-all duration-300 lg:w-[420px] ${
                isAdvancedActive
                  ? 'border-[#2b54ad] bg-white shadow-md'
                  : 'border-[#f0f0f0] bg-white hover:border-[#d9d9d9] hover:shadow-sm'
              } ${isUpdating || isSwitching ? 'cursor-not-allowed opacity-50' : ''}`}
              data-cy="okr-type-advanced-card"
              id="okr-type-advanced-card"
            >
              <div
                className="mb-4 flex items-center gap-4"
                data-cy="okr-type-advanced-card-header"
              >
                <Radio
                  checked={isAdvancedActive}
                  disabled={isUpdating}
                  onChange={() => !isUpdating && handleRadioChange('Advanced')}
                  className="custom-brand-radio"
                  data-cy="okr-type-advanced-radio"
                />
                <h3
                  className="m-0 text-[18px] font-bold text-[#262626]"
                  data-cy="okr-type-advanced-card-title"
                >
                  Advanced OKR
                </h3>
              </div>
              <p
                className="m-0 text-[14px] leading-relaxed text-[#595959]"
                data-cy="okr-type-advanced-card-description"
              >
                Advanced OKR allows employees to define Objectives and Key
                Results for goal tracking. Daily and weekly plans are not linked
                to OKRs. OKR progress has no impact on variable pay.
              </p>
            </div>

            {/* Basic OKR Card */}
            <div
              onClick={() =>
                !(isUpdating || isSwitching) && handleRadioChange('Basic')
              }
              className={`relative w-full max-w-[420px] cursor-pointer rounded-[8px] border-2 p-8 transition-all duration-300 lg:w-[420px] ${
                isBasicActive
                  ? 'border-[#2b54ad] bg-white shadow-md'
                  : 'border-[#f0f0f0] bg-white hover:border-[#d9d9d9] hover:shadow-sm'
              } ${isUpdating || isSwitching ? 'cursor-not-allowed opacity-50' : ''}`}
              data-cy="okr-type-basic-card"
              id="okr-type-basic-card"
            >
              <div
                className="mb-4 flex items-center gap-4"
                data-cy="okr-type-basic-card-header"
              >
                <Radio
                  checked={isBasicActive}
                  disabled={isUpdating}
                  onChange={() => !isUpdating && handleRadioChange('Basic')}
                  className="custom-brand-radio"
                  data-cy="okr-type-basic-radio"
                />
                <h3
                  className="m-0 text-[18px] font-bold text-[#262626]"
                  data-cy="okr-type-basic-card-title"
                >
                  Basic
                </h3>
              </div>
              <p
                className="m-0 text-[14px] leading-relaxed text-[#595959]"
                data-cy="okr-type-basic-card-description"
              >
                Basic OKR allows employees to define Objectives and Key Results
                for goal tracking. Daily and weekly plans are not linked to
                OKRs. OKR progress has no impact on variable pay.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Note */}
      <p
        className="text-[14px] text-[#8c8c8c] text-center"
        data-cy="okr-type-warning-text"
        id="okr-type-warning-text"
      >
        Please Note that you can not use both types of OKR&apos;s at the same
        time
      </p>

      <AccessGuard permissions={['manage_okr_settings']}>
        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-[#f0f0f0] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="mb-1 text-[18px] font-semibold text-[#262626]">
                Scoring Mode
              </h3>
              <p className="m-0 text-sm leading-relaxed text-[#595959]">
                Type-weighted scoring uses the configured objective-type
                weights. Classic scoring continues to average objective scores.
              </p>
            </div>
            <Switch
              checked={isTypeWeighted}
              checkedChildren="Type weighted"
              unCheckedChildren="Classic"
              loading={isPatchingScoringMode}
              onChange={requestScoringModeChange}
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#f0f0f0] pt-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                className="mb-2 block text-sm font-medium text-[#262626]"
                htmlFor="stretch-score-max"
              >
                Stretch score maximum
              </label>
              <InputNumber
                id="stretch-score-max"
                className="w-full sm:max-w-[200px]"
                min={100}
                max={1000}
                precision={0}
                value={stretchScoreMax}
                onChange={(value) => {
                  setIsStretchScoreMaxEdited(true);
                  setStretchScoreMax(
                    typeof value === 'number'
                      ? value
                      : DEFAULT_STRETCH_SCORE_MAX,
                  );
                }}
              />
            </div>
            <Button
              onClick={saveStretchScoreMax}
              loading={isPatchingScoringMode}
              disabled={stretchScoreMax < 100}
            >
              Save maximum
            </Button>
          </div>
          {scoringError && (
            <Alert
              className="mt-5"
              type="error"
              showIcon
              message="Scoring mode was not changed"
              description={scoringError}
            />
          )}
        </div>
      </AccessGuard>

      <style jsx global data-cy="okr-type-styles">{`
        .custom-brand-radio .ant-radio-inner {
          border-color: #d9d9d9;
          width: 20px;
          height: 20px;
        }
        .custom-brand-radio .ant-radio-checked .ant-radio-inner {
          border-color: #2b54ad !important;
          background-color: #2b54ad !important;
        }
        .custom-brand-radio .ant-radio-checked .ant-radio-inner::after {
          background-color: #fff;
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
