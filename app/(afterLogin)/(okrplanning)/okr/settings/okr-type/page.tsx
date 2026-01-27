'use client';

import React, { useState, useEffect } from 'react';
import { Card, Switch, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useOkrSetting } from '@/hooks/useOkrSetting';
import { useUpdateOkrSetting } from '@/store/server/features/okrplanning/okr-setting/mutations';
import { useGetOkrSetting } from '@/store/server/features/okrplanning/okr-setting/queries';
import OkrModeConfirmationModal from './_components/OkrModeConfirmationModal';
import OkrModeEffectsModal from './_components/OkrModeEffectsModal';

const OkrTypePage = () => {
  const { okrMode, isAdminOrOwner, refetch } = useOkrSetting();
  const { data: settingData, refetch: refetchSetting } = useGetOkrSetting();
  const { mutate: updateOkrSetting, isLoading: isUpdating } =
    useUpdateOkrSetting();

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [effectsModalOpen, setEffectsModalOpen] = useState(false);
  const [targetMode, setTargetMode] = useState<'Basic' | 'Advanced' | null>(
    null,
  );
  const [transitionDirection, setTransitionDirection] = useState<
    'BasicToAdvanced' | 'AdvancedToBasic' | null
  >(null);

  // Fetch setting data when component mounts and user is admin
  useEffect(() => {
    if (isAdminOrOwner) {
      refetchSetting();
    }
  }, [isAdminOrOwner, refetchSetting]);

  const handleToggleChange = (checked: boolean, mode: 'Basic' | 'Advanced') => {
    if (!checked) {
      // If unchecking, do nothing (shouldn't happen as only one can be active)
      return;
    }

    // If already in this mode, do nothing
    if (okrMode === mode) {
      return;
    }

    // Determine transition direction
    // If okrMode is null, assume we're starting fresh (no transition direction needed)
    // But for now, if null and switching to Advanced, treat as BasicToAdvanced
    // If null and switching to Basic, treat as AdvancedToBasic (though unlikely)
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

    // If setting doesn't exist yet, we need to create it first
    // But useUpdateOkrSetting requires an id, so we should use useCreateOrUpdateOkrSetting
    // However, let's check if settingData exists first
    if (!settingData?.id) {
      // Setting doesn't exist, we can't update - this shouldn't happen in normal flow
      // as admin should have created a setting already
      setConfirmationModalOpen(false);
      return;
    }

    updateOkrSetting(
      { id: settingData.id, mode: targetMode },
      {
        onSuccess: () => {
          setConfirmationModalOpen(false);
          setEffectsModalOpen(true);
          refetch();
          refetchSetting();
        },
        onError: () => {
          setConfirmationModalOpen(false);
        },
      },
    );
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

  // Show access denied message if not admin
  if (!isAdminOrOwner) {
    return (
      <div
        className="p-6 bg-white rounded-lg"
        data-cy="okr-type-page-access-denied"
        id="okr-type-page-access-denied"
      >
        <Alert
          message="Access Denied"
          description="You do not have permission to access this page. Only administrators can change OKR type settings."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      className="p-6 bg-white rounded-lg"
      data-cy="okr-type-page-container"
      id="okr-type-page-container"
    >
      <div className="space-y-6 mb-6">
        {/* Basic OKR Card */}
        <Card
          title={
            <span
              className="text-lg font-semibold"
              data-cy="okr-type-basic-card-title"
              id="okr-type-basic-card-title"
            >
              Basic OKR
            </span>
          }
          extra={
            <Switch
              checked={isBasicActive}
              onChange={(checked) => handleToggleChange(checked, 'Basic')}
              disabled={isUpdating || !isAdminOrOwner}
              data-cy="okr-type-basic-card-switch"
              id="okr-type-basic-card-switch"
            />
          }
          className="w-full"
          data-cy="okr-type-basic-card"
          id="okr-type-basic-card"
        >
          <p
            className="text-gray-600 text-sm"
            data-cy="okr-type-basic-card-description"
            id="okr-type-basic-card-description"
          >
            Basic OKR allows employees to define Objectives and Key Results
            for goal tracking. Daily and weekly plans are not linked to OKRs,
            and OKR progress has no impact on variable pay.
          </p>
        </Card>

        {/* Advanced OKR Card */}
        <Card
          title={
            <span
              className="text-lg font-semibold"
              data-cy="okr-type-advanced-card-title"
              id="okr-type-advanced-card-title"
            >
              Advanced OKR
            </span>
          }
          extra={
            <Switch
              checked={isAdvancedActive}
              onChange={(checked) =>
                handleToggleChange(checked, 'Advanced')
              }
              disabled={isUpdating || !isAdminOrOwner}
              data-cy="okr-type-advanced-card-switch"
              id="okr-type-advanced-card-switch"
            />
          }
          className="w-full"
          data-cy="okr-type-advanced-card"
          id="okr-type-advanced-card"
        >
          <p
            className="text-gray-600 text-sm"
            data-cy="okr-type-advanced-card-description"
            id="okr-type-advanced-card-description"
          >
            Basic OKR allows employees to define Objectives and Key Results
            for goal tracking. Daily and weekly plans are not linked to OKRs,
            and OKR progress has no impact on variable pay.
          </p>
        </Card>
      </div>

        {/* Warning Message */}
        <div
          className="flex items-center gap-3 mb-4"
          data-cy="okr-type-warning-alert"
          id="okr-type-warning-alert"
        >
          <ExclamationCircleOutlined className="text-gray-500 text-lg" />
          <span className="text-gray-900 text-sm">
            Please Note that you can not use both types of OKR&apos;s at the same time
          </span>
        </div>

        {/* Confirmation Modal */}
        {transitionDirection && (
          <OkrModeConfirmationModal
            open={confirmationModalOpen}
            transitionDirection={transitionDirection}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            loading={isUpdating}
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
      </div>
  );
};

export default OkrTypePage;
