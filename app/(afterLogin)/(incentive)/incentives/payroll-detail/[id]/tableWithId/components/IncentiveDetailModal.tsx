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
        className="flex flex-wrap items-center justify-center bg-[#FAFAFA] p-3 rounded-lg border border-[#F0F0F0] gap-3"
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
          className="text-gray-800 font-bold text-lg"
        >
          Incentive Detail
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1000}
      centered
      className="p-0"
      destroyOnClose
    >
      <div
        data-cy="incentive-detail-modal-content"
        className="flex justify-center p-8"
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
              className="border border-gray-200 rounded-lg p-6 bg-white flex flex-wrap lg:flex-nowrap items-start justify-between gap-6 shadow-sm"
            >
              <div
                data-cy="incentive-detail-modal-content-container-top-box-content"
                className="flex items-center gap-4 flex-1"
              >
                <Avatar
                  size={56}
                  src={userInfo?.profileImage || undefined}
                  icon={!userInfo?.profileImage ? <UserOutlined /> : undefined}
                />
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-name"
                  className="flex flex-col"
                >
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-name-text"
                    className="text-gray-800 font-medium text-base"
                  >
                    {`${userInfo?.firstName || 'N/A'} ${userInfo?.middleName || ''}`.trim()}
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-name-job"
                    className="text-gray-400 text-sm"
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
                className="flex flex-1 gap-8 items-center border-l pl-8 pr-4"
              >
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for"
                  className="flex flex-col gap-1"
                >
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for-label"
                    className="text-gray-400 text-sm font-medium"
                  >
                    Recognized For
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for-value"
                    className="text-gray-800 font-medium"
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
                    className="text-gray-400 text-sm font-medium"
                  >
                    Issued Date
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-issued-date-value"
                    className="text-gray-800 font-medium"
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
                    className="text-gray-400 text-sm font-medium"
                  >
                    Status
                  </span>
                  <div data-cy="incentive-detail-modal-content-container-top-box-content-status-value">
                    {userDetail?.Status === false ? (
                      <Tag className="rounded text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] px-2 m-0 py-0.5">
                        Unpaid
                      </Tag>
                    ) : (
                      <Tag className="rounded text-[#16A34A] bg-[#ECFDF3] border border-[#B8E6CB] px-2 m-0 py-0.5">
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
                className="text-gray-800 font-semibold"
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
                className="text-gray-800 font-semibold mb-2"
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
                      className="text-gray-500 text-sm font-medium"
                    >
                      {item?.criterionKey}
                    </span>
                    <span
                      data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-score"
                      className="text-gray-800 font-bold"
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
                    className="text-gray-500 text-sm font-medium"
                  >
                    Bonus
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-bonus-value"
                    className="text-gray-800 font-bold"
                  >
                    {userDetail?.Bonus ?? 'N/A'}
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
