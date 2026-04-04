import React from 'react';
import { Modal, Avatar, Spin, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useFetchIncentiveUserDetails } from '@/store/server/features/incentive/all/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';

interface IncentiveDetailModalProps {
  open: boolean;
  onCancel: () => void;
  detailId: string | null;
}

const IncentiveDetailModal: React.FC<IncentiveDetailModalProps> = ({
  open,
  onCancel,
  detailId,
}) => {
  const { data: userDetail, isLoading: userDetailLoading } =
    useFetchIncentiveUserDetails(detailId || '');
  const { data: employeeData, isLoading: employeeDataLoading } =
    useGetAllUsers();

  const getEmployeeInformation = (id: string) => {
    return employeeData?.items?.find((item: any) => item.id === id) || {};
  };

  const userInfo = getEmployeeInformation(userDetail?.userId);

  const renderFormula = () => {
    const expression = userDetail?.Formula?.expression || '';
    if (!expression)
      return (
        <span
          data-cy="incentive-detail-modal-formula-expression-empty"
          className="text-gray-500"
        >
          -
        </span>
      );

    // Split by '*'
    const parts = expression.split('*').map((s: string) => s.trim());

    return (
      <div
        data-cy="incentive-detail-modal-formula-expression-container"
        className="flex flex-wrap items-center justify-center p-3 rounded-lg border border-[#F0F0F0] gap-3"
      >
        {parts.map((p: string, i: number) => (
          <React.Fragment key={i}>
            <div
              data-cy="incentive-detail-modal-formula-expression-part"
              className="border border-[#D9D9D9] bg-white rounded-[4px] px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm whitespace-nowrap"
            >
              {p}
            </div>
            {i !== parts.length - 1 && (
              <span
                data-cy="incentive-detail-modal-formula-expression-part-separator"
                className="text-gray-400 font-bold"
              >
                *
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title={
        <div
          data-cy="incentive-detail-modal-title"
          className="text-black opacity-70 text-base font-bold px-4"
        >
          Incentive Detail
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1100}
      centered
      className="p-0"
      destroyOnClose
      bodyStyle={{
        padding: '0px',
      }}
    >
      <div
        data-cy="incentive-detail-modal-content"
        className="flex justify-center p-2 sm:p-4"
      >
        {userDetailLoading || employeeDataLoading ? (
          <Spin size="large" />
        ) : (
          <div
            data-cy="incentive-detail-modal-content-container"
            className="flex flex-col gap-4 w-full"
          >
            {/* Top Box: User Info & Core Data */}
            <div
              data-cy="incentive-detail-modal-content-container-top-box"
              className="border border-[#E5E7EB] rounded-lg bg-white p-4 sm:p-5 mb-4"
            >
              <div
                data-cy="incentive-detail-modal-content-container-top-box-content"
                className="flex items-center gap-3 pb-4"
              >
                <Avatar
                  size={46}
                  src={userInfo?.profileImage || undefined}
                  icon={!userInfo?.profileImage ? <UserOutlined /> : undefined}
                />
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-name"
                  className="min-w-0 flex flex-col"
                >
                  <h5
                    data-cy="incentive-detail-modal-content-container-top-box-content-name-text"
                    className="m-0 text-[18px] leading-6 font-medium text-black/75"
                  >
                    {`${userInfo?.firstName || 'N/A'} ${userInfo?.middleName || ''}`.trim()}
                  </h5>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-name-job"
                    className="text-sm font-normal text-black/30 mt-0.5"
                  >
                    {userInfo?.employeeJobInformation?.length
                      ? userInfo?.employeeJobInformation
                          ?.map((item: any) => item?.position?.name || 'N/A')
                          .join(', ')
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div
                data-cy="incentive-detail-modal-content-container-top-box-content-recognition"
                className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 px-3"
              >
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for"
                  className="flex flex-col gap-1 min-w-0"
                >
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for-label"
                    className="text-sm font-normal text-black opacity-70"
                  >
                    Recognized For
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for-value"
                    className="text-sm font-bold text-black opacity-70"
                  >
                    {userDetail?.recognitionTypeName || 'N/A'}
                  </span>
                </div>
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-issued-date"
                  className="flex flex-col gap-1"
                >
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-issued-date-label"
                    className="text-sm font-normal text-black opacity-70"
                  >
                    Issued Date
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-issued-date-value"
                    className="text-sm font-bold text-black opacity-70"
                  >
                    {userDetail?.createdAt
                      ? dayjs(userDetail.createdAt).format('DD MMMM, YYYY')
                      : 'N/A'}
                  </span>
                </div>
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-status"
                  className="flex flex-col gap-1"
                >
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-status-label"
                    className="text-sm font-normal text-black opacity-70"
                  >
                    Status
                  </span>
                  <div data-cy="incentive-detail-modal-content-container-top-box-content-status-value">
                    {userDetail?.Status === false ? (
                      <Tag className="inline-flex items-center rounded-[4px] text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 m-0 text-xs font-normal leading-4">
                        Unpaid
                      </Tag>
                    ) : (
                      <Tag className="inline-flex items-center rounded-[4px] text-[#16A34A] bg-[#ECFDF3] border border-[#B8E6CB] px-2 py-0.5 m-0 text-xs font-normal leading-4">
                        Paid
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Box: Formula */}
            <div
              data-cy="incentive-detail-modal-content-container-middle-box"
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm flex flex-col gap-3 mt-1"
            >
              <span
                data-cy="incentive-detail-modal-content-container-middle-box-formula-label"
                className="text-black font-normal text-sm"
              >
                Formula
              </span>
              {renderFormula()}
            </div>

            {/* Bottom Box: Criteria Values */}
            <div
              data-cy="incentive-detail-modal-content-container-bottom-box"
              className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm flex flex-col gap-4 mt-1"
            >
              <span
                data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-label"
                className="text-black font-normal text-sm mb-2"
              >
                Criteria Values
              </span>
              <div
                data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-container"
                className="flex flex-wrap items-center gap-x-12 gap-y-6"
              >
                {userDetail?.breakdown?.map((item: any, index: number) => (
                  <div
                    key={index}
                    data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item"
                    className="flex flex-col gap-1"
                  >
                    <span
                      data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-criterion-key"
                      className="text-black opacity-70 text-sm font-normal"
                    >
                      {item?.criterionKey}
                    </span>
                    <span
                      data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-score"
                      className="text-black opacity-70 text-sm font-bold"
                    >
                      {item?.score ?? 'N/A'}
                    </span>
                  </div>
                ))}
                <div
                  data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-bonus"
                  className="flex flex-col gap-1"
                >
                  <span
                    data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-bonus-label"
                    className="text-black opacity-70 text-sm font-normal"
                  >
                    Bonus
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-bonus-value"
                    className="text-black opacity-70 text-sm font-bold"
                  >
                    {Number(userDetail?.Bonus).toLocaleString() ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IncentiveDetailModal;
