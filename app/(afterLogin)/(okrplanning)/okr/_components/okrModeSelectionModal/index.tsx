'use client';
import React from 'react';
import { Modal, Button } from 'antd';
import { FaBolt, FaRocket } from 'react-icons/fa';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

interface OkrModeSelectionModalProps {
  open: boolean;
  onSuccess: () => void;
  saveOkrMode: (mode: 'Basic' | 'Advanced') => Promise<boolean>;
  loading?: boolean;
}

const OkrModeSelectionModal: React.FC<OkrModeSelectionModalProps> = ({
  open,
  onSuccess,
  saveOkrMode,
  loading: externalLoading,
}) => {
  const {
    okrModalSelectedMode: selectedMode,
    setOkrModalSelectedMode: setSelectedMode,
    okrModalIsSaving: isSaving,
    setOkrModalIsSaving: setIsSaving,
  } = useOKRStore();

  const isLoading = externalLoading || isSaving;

  const handleSubmit = async () => {
    if (!selectedMode) return;

    setIsSaving(true);
    try {
      await saveOkrMode(selectedMode);
      setSelectedMode(null); // Reset selection
      onSuccess(); // Call success callback
    } catch (error) {
      // Error handling is done in the mutation
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      centered
      width={900}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      className="okr-mode-selection-modal"
      data-cy="okr-mode-selection-modal"
      maskStyle={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      style={{
        borderRadius: '12px',
      }}
    >
      <div className="px-2">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#14b8a6' }}>
            Welcome to SelamNew OKR
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            Select how you want to track objectives for your organization.
            <br />
            This setting applies to all users but can be changed later by
            admins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Basic OKR Card */}
          <div
            onClick={() => setSelectedMode('Basic')}
            className={`
              relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300
              ${
                selectedMode === 'Basic'
                  ? 'border-teal-500 bg-teal-50 shadow-lg scale-105 ring-2 ring-teal-200'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md'
              }
            `}
            data-cy="okr-mode-basic-card"
            id="okr-mode-basic-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    selectedMode === 'Basic'
                      ? 'bg-teal-100 scale-110'
                      : 'bg-gray-100'
                  }`}
                >
                  <FaBolt
                    className={`text-2xl transition-colors duration-300 ${
                      selectedMode === 'Basic'
                        ? 'text-teal-600'
                        : 'text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      selectedMode === 'Basic'
                        ? 'text-teal-700'
                        : 'text-gray-900'
                    }`}
                  >
                    Basic OKR
                  </h3>
                </div>
              </div>
              {selectedMode === 'Basic' && (
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Recommended
              </span>
            </div>
            <ul
              className={`space-y-2.5 text-sm transition-colors duration-300 ${
                selectedMode === 'Basic' ? 'text-gray-700' : 'text-gray-600'
              }`}
            >
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Basic' ? 'text-teal-500' : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Simple 'Done / Not Done' tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Basic' ? 'text-teal-500' : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>No complex metrics or weights</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Basic' ? 'text-teal-500' : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Best for getting started quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Basic' ? 'text-teal-500' : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Manual progress updates</span>
              </li>
            </ul>
          </div>

          {/* Advanced OKR Card */}
          <div
            onClick={() => setSelectedMode('Advanced')}
            className={`
              relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300
              ${
                selectedMode === 'Advanced'
                  ? 'border-teal-500 bg-teal-50 shadow-lg scale-105 ring-2 ring-teal-200'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md'
              }
            `}
            data-cy="okr-mode-advanced-card"
            id="okr-mode-advanced-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    selectedMode === 'Advanced'
                      ? 'bg-teal-100 scale-110'
                      : 'bg-gray-100'
                  }`}
                >
                  <FaRocket
                    className={`text-2xl transition-colors duration-300 ${
                      selectedMode === 'Advanced'
                        ? 'text-teal-600'
                        : 'text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold transition-colors duration-300 ${
                      selectedMode === 'Advanced'
                        ? 'text-teal-700'
                        : 'text-gray-900'
                    }`}
                  >
                    Advanced OKR
                  </h3>
                </div>
              </div>
              {selectedMode === 'Advanced' && (
                <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
              )}
            </div>
            <ul
              className={`space-y-2.5 text-sm transition-colors duration-300 ${
                selectedMode === 'Advanced' ? 'text-gray-700' : 'text-gray-600'
              }`}
            >
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Advanced'
                      ? 'text-teal-500'
                      : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Detailed metrics (%, Currency, #)</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Advanced'
                      ? 'text-teal-500'
                      : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Weighted Key Results</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Advanced'
                      ? 'text-teal-500'
                      : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Automated scoring & reporting</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`mt-1 transition-colors duration-300 ${
                    selectedMode === 'Advanced'
                      ? 'text-teal-500'
                      : 'text-gray-400'
                  }`}
                >
                  •
                </span>
                <span>Integrated with Planning module</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!selectedMode || isLoading}
            loading={isLoading}
            className="bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700 h-14 px-10 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            data-cy="okr-mode-submit-button"
            id="okr-mode-submit-button"
          >
            {selectedMode
              ? `Get Started with ${selectedMode}`
              : 'Get Started with OKR'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OkrModeSelectionModal;
