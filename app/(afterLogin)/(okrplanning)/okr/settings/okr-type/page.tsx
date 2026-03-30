'use client';

import React, { useState, useEffect } from 'react';
import { Radio } from 'antd';
import { useOkrSetting } from '@/hooks/useOkrSetting';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useSwitchOkrMode } from '@/store/server/features/okrplanning/okr-setting/mutations';
import { useGetOkrSetting } from '@/store/server/features/okrplanning/okr-setting/queries';
import OkrModeConfirmationModal from './_components/OkrModeConfirmationModal';
import OkrModeEffectsModal from './_components/OkrModeEffectsModal';
import UnreportedUsersModal from './_components/UnreportedUsersModal';
import NotReportedEmployeesList from './_components/NotReportedEmployeesList';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';

const OkrTypePage = () => {
  const { okrMode, refetch } = useOkrSetting();
  const setStoreOkrMode = useOKRStore((state) => state.setOkrMode);
  const { refetch: refetchSetting } = useGetOkrSetting();
  const { mutate: switchOkrMode, isLoading: isSwitching } = useSwitchOkrMode();
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

  // Fetch setting data when component mounts
  useEffect(() => {
    refetchSetting();
  }, [refetchSetting]);

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
        setStoreOkrMode(targetMode);
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

      {/* Radio Button Cards */}
      <div
        className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-12 px-4"
        data-cy="okr-type-cards-container"
        id="okr-type-cards-container"
      >
        {/* Advanced OKR Card */}
        <div
          onClick={() => !isSwitching && handleRadioChange('Advanced')}
          className={`relative cursor-pointer border-2 rounded-[8px] p-8 w-full max-w-[420px] lg:w-[420px] transition-all duration-300 ${
            isAdvancedActive
              ? 'border-[#2b54ad] bg-white shadow-md'
              : 'border-[#f0f0f0] bg-white hover:border-[#d9d9d9] hover:shadow-sm'
          } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-cy="okr-type-advanced-card"
          id="okr-type-advanced-card"
        >
          <div
            className="flex items-center gap-4 mb-4"
            data-cy="okr-type-advanced-card-header"
          >
            <Radio
              checked={isAdvancedActive}
              disabled={isSwitching}
              onChange={() => !isSwitching && handleRadioChange('Advanced')}
              className="custom-brand-radio"
              data-cy="okr-type-advanced-radio"
            />
            <h3
              className="text-[18px] font-bold text-[#262626] m-0"
              data-cy="okr-type-advanced-card-title"
            >
              Advanced OKR
            </h3>
          </div>
          <p
            className="text-[14px] text-[#595959] leading-relaxed m-0"
            data-cy="okr-type-advanced-card-description"
          >
            Advanced OKR allows employees to define Objectives and Key Results
            for goal tracking. Daily and weekly plans are not linked to OKRs.
            OKR progress has no impact on variable pay.
          </p>
        </div>

        {/* Basic OKR Card */}
        <div
          onClick={() => !isSwitching && handleRadioChange('Basic')}
          className={`relative cursor-pointer border-2 rounded-[8px] p-8 w-full max-w-[420px] lg:w-[420px] transition-all duration-300 ${
            isBasicActive
              ? 'border-[#2b54ad] bg-white shadow-md'
              : 'border-[#f0f0f0] bg-white hover:border-[#d9d9d9] hover:shadow-sm'
          } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
          data-cy="okr-type-basic-card"
          id="okr-type-basic-card"
        >
          <div
            className="flex items-center gap-4 mb-4"
            data-cy="okr-type-basic-card-header"
          >
            <Radio
              checked={isBasicActive}
              disabled={isSwitching}
              onChange={() => !isSwitching && handleRadioChange('Basic')}
              className="custom-brand-radio"
              data-cy="okr-type-basic-radio"
            />
            <h3
              className="text-[18px] font-bold text-[#262626] m-0"
              data-cy="okr-type-basic-card-title"
            >
              Basic
            </h3>
          </div>
          <p
            className="text-[14px] text-[#595959] leading-relaxed m-0"
            data-cy="okr-type-basic-card-description"
          >
            Basic OKR allows employees to define Objectives and Key Results for
            goal tracking. Daily and weekly plans are not linked to OKRs. OKR
            progress has no impact on variable pay.
          </p>
        </div>
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
    </div>
  );
};

export default OkrTypePage;
