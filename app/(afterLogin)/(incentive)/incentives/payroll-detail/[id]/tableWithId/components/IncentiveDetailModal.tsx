import React from 'react';
import { Modal, Avatar, Tag, Skeleton } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useFetchIncentiveUserDetails } from '@/store/server/features/incentive/all/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';

interface IncentiveDetailModalProps {
  open: boolean;
  onCancel: () => void;
  detailId: string | null;
}

function IncentiveDetailModalSkeleton() {
  return (
    <div
      data-cy="incentive-detail-modal-skeleton"
      className="flex w-full flex-col gap-4"
      aria-busy="true"
    >
      <div
        data-cy="incentive-detail-modal-skeleton-top-box"
        className="mb-4 rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5"
      >
        <div
          data-cy="incentive-detail-modal-skeleton-top-header"
          className="flex items-center gap-3 pb-4"
        >
          <Skeleton.Avatar active size={46} shape="circle" />
          <div
            data-cy="incentive-detail-modal-skeleton-top-name-block"
            className="flex min-w-0 flex-1 flex-col gap-2"
          >
            <Skeleton.Input
              active
              size="small"
              style={{ width: 200, height: 22 }}
            />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 160, height: 16 }}
            />
          </div>
        </div>
        <div
          data-cy="incentive-detail-modal-skeleton-top-meta-grid"
          className="grid grid-cols-1 gap-5 px-3 pt-4 sm:grid-cols-3"
        >
          {[0, 1, 2].map((metaIndex) => (
            <div
              key={metaIndex}
              data-cy={`incentive-detail-modal-skeleton-meta-${metaIndex}`}
              className="flex min-w-0 flex-col gap-2"
            >
              <Skeleton.Input
                active
                size="small"
                style={{ width: 100, height: 14 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 140, height: 18 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        data-cy="incentive-detail-modal-skeleton-middle-box"
        className="mt-1 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <Skeleton.Input active size="small" style={{ width: 72, height: 16 }} />
        <div
          data-cy="incentive-detail-modal-skeleton-formula-pills"
          className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-[#F0F0F0] p-3"
        >
          <Skeleton.Button active style={{ width: 88, height: 36 }} />
          <span
            data-cy="incentive-detail-modal-skeleton-formula-sep-0"
            className="text-sm font-bold text-transparent"
            aria-hidden
          >
            *
          </span>
          <Skeleton.Button active style={{ width: 96, height: 36 }} />
        </div>
      </div>

      <div
        data-cy="incentive-detail-modal-skeleton-bottom-box"
        className="mt-1 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <Skeleton.Input
          active
          size="small"
          style={{ width: 110, height: 16 }}
        />
        <div
          data-cy="incentive-detail-modal-skeleton-criteria-row"
          className="flex flex-wrap items-center gap-x-12 gap-y-6"
        >
          {[0, 1, 2, 3].map((criterionIndex) => (
            <div
              key={criterionIndex}
              data-cy={`incentive-detail-modal-skeleton-criterion-${criterionIndex}`}
              className="flex flex-col gap-2"
            >
              <Skeleton.Input
                active
                size="small"
                style={{ width: 90, height: 14 }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: 48, height: 18 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
        className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-[#F0F0F0] p-3"
      >
        {parts.map((p: string, i: number) => (
          <React.Fragment key={i}>
            <div
              data-cy="incentive-detail-modal-formula-expression-part"
              className="whitespace-nowrap rounded-[4px] border border-[#D9D9D9] bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
            >
              {p}
            </div>
            {i !== parts.length - 1 && (
              <span
                data-cy="incentive-detail-modal-formula-expression-part-separator"
                className="font-bold text-gray-400"
              >
                *
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const isLoading = userDetailLoading || employeeDataLoading;

  return (
    <Modal
      title={
        <div
          data-cy="incentive-detail-modal-title"
          className="px-4 text-base font-bold text-black opacity-70"
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
        {isLoading ? (
          <IncentiveDetailModalSkeleton />
        ) : (
          <div
            data-cy="incentive-detail-modal-content-container"
            className="flex w-full flex-col gap-4"
          >
            {/* Top Box: User Info & Core Data */}
            <div
              data-cy="incentive-detail-modal-content-container-top-box"
              className="mb-4 rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5"
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
                  className="flex min-w-0 flex-col"
                >
                  <h5
                    data-cy="incentive-detail-modal-content-container-top-box-content-name-text"
                    className="m-0 text-[18px] font-medium leading-6 text-black/75"
                  >
                    {`${userInfo?.firstName || 'N/A'} ${userInfo?.middleName || ''}`.trim()}
                  </h5>
                  <span
                    data-cy="incentive-detail-modal-content-container-top-box-content-name-job"
                    className="mt-0.5 text-sm font-normal text-black/30"
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
                className="grid grid-cols-1 gap-5 px-3 pt-4 sm:grid-cols-3"
              >
                <div
                  data-cy="incentive-detail-modal-content-container-top-box-content-recognition-for"
                  className="flex min-w-0 flex-col gap-1"
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
                      <Tag className="m-0 inline-flex items-center rounded-[4px] border border-[#FECACA] bg-[#FEF2F2] px-2 py-0.5 text-xs font-normal leading-4 text-[#EF4444]">
                        Unpaid
                      </Tag>
                    ) : (
                      <Tag className="m-0 inline-flex items-center rounded-[4px] border border-[#B8E6CB] bg-[#ECFDF3] px-2 py-0.5 text-xs font-normal leading-4 text-[#16A34A]">
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
              className="mt-1 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <span
                data-cy="incentive-detail-modal-content-container-middle-box-formula-label"
                className="text-sm font-normal text-black"
              >
                Formula
              </span>
              {renderFormula()}
            </div>

            {/* Bottom Box: Criteria Values */}
            <div
              data-cy="incentive-detail-modal-content-container-bottom-box"
              className="mt-1 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <span
                data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-label"
                className="mb-2 text-sm font-normal text-black"
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
                      className="text-sm font-normal text-black opacity-70"
                    >
                      {item?.criterionKey}
                    </span>
                    <span
                      data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-score"
                      className="text-sm font-bold text-black opacity-70"
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
                    className="text-sm font-normal text-black opacity-70"
                  >
                    Bonus
                  </span>
                  <span
                    data-cy="incentive-detail-modal-content-container-bottom-box-criteria-values-item-bonus-value"
                    className="text-sm font-bold text-black opacity-70"
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
