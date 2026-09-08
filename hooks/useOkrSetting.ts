import { useState, useEffect } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import {
  useCheckOkrSetting,
  useGetOkrSetting,
} from '@/store/server/features/okrplanning/okr-setting/queries';
import { useCreateOrUpdateOkrSetting } from '@/store/server/features/okrplanning/okr-setting/mutations';

export function useOkrSetting() {
  const { userData } = useAuthenticationStore();
  const { okrMode: storeOkrMode, setOkrMode: setStoreOkrMode } = useOKRStore();
  const [showModal, setShowModal] = useState(false);
  const [okrMode, setOkrMode] = useState<'Basic' | 'Advanced' | null>(
    storeOkrMode,
  );

  // Check if user is admin or owner
  const userRole = userData?.role?.slug?.toLowerCase() || '';
  const isAdminOrOwner =
    userRole === 'admin' ||
    userRole === 'administrator' ||
    userRole === 'owner';

  // Check if OKR setting exists (for all users so everyone gets current mode)
  const {
    data: checkData,
    isLoading: isChecking,
    refetch: refetchCheck,
  } = useCheckOkrSetting(true);

  // Get OKR setting
  const {
    data: settingData,
    isLoading: isLoadingSetting,
    refetch: refetchSetting,
  } = useGetOkrSetting();

  // Mutation for creating/updating OKR setting
  const { mutate: createOrUpdate, isLoading: isSaving } =
    useCreateOrUpdateOkrSetting();

  // Check setting on mount: refetch for all when exists; show modal for all when no setting
  useEffect(() => {
    if (checkData) {
      if (!checkData.exists && !okrMode) {
        // Setting doesn't exist and we don't have a mode yet, show modal
        setShowModal(true);
      } else if (checkData.exists) {
        // Setting exists, fetch it and hide modal
        setShowModal(false);
        refetchSetting();
      }
    }
  }, [checkData, okrMode, refetchSetting]);

  // Update mode when setting is loaded
  useEffect(() => {
    if (settingData?.name) {
      setOkrMode(settingData.name);
      setStoreOkrMode(settingData.name); // Update Zustand store
    } else if (settingData === null) {
      // Setting doesn't exist
      setOkrMode(null);
      setStoreOkrMode(null);
    }
  }, [settingData, setStoreOkrMode]);

  // Save OKR mode
  const saveOkrMode = async (mode: 'Basic' | 'Advanced'): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      createOrUpdate(mode, {
        onSuccess: async (data) => {
          setOkrMode(data.name);
          setStoreOkrMode(data.name); // Update Zustand store
          setShowModal(false); // Hide modal immediately
          // Refetch both check and setting to ensure state is up to date
          await refetchCheck();
          await refetchSetting();
          resolve(true);
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  // Refetch function
  const refetch = () => {
    refetchCheck();
    refetchSetting();
  };

  const isLoading = isChecking || isLoadingSetting || isSaving;
  const isInitialLoading = isChecking || isLoadingSetting;

  return {
    okrMode,
    isLoading,
    isInitialLoading,
    showModal,
    setShowModal,
    saveOkrMode,
    refetch,
    isAdminOrOwner,
  };
}
