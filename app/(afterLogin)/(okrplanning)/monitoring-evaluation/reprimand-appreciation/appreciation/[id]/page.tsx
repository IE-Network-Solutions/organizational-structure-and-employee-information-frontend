'use client';
import { Card, Avatar, Button, Tag, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useGetAppreciationLogById } from '@/store/server/features/okrplanning/monitoring-evaluation/appreciation-log/queries';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import dayjs from 'dayjs';

interface Params {
  id: string;
}
interface AppreciationDetailProps {
  params: Params;
}
function DetailPage({ params: { id } }: AppreciationDetailProps) {
  const { data: appDetail, isLoading } = useGetAppreciationLogById(
    id as string,
  );
  const { data: allUsers } = useGetAllUsers();

  function employeeInfo(id: string) {
    return allUsers?.items?.find((user: any) => user.id === id) || {};
  }

  return (
    <div className="p-4 md:p-6">
      {/* Back button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
        <Button
          href="/monitoring-evaluation/reprimand-appreciation"
          className="mb-4 text-lg font-semibold"
          type="text"
        >
          ← Detail
        </Button>
        <div className="flex space-x-2">
          <Button
            className="bg-blue text-white border-none"
            icon={<EditOutlined />}
          />
          <Button
            className="bg-red-500 text-white border-none"
            icon={<DeleteOutlined />}
          />
        </div>
      </div>

      {/* Main Card */}
      <Card loading={isLoading} className="rounded-md">
        <Divider />
        {/* Content Section */}
        <div className="mt-4">
          {/* Given To Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Given To</h4>
            <div className="flex items-center space-x-3 w-full col-span-9">
              {employeeInfo(appDetail?.recipientId || '')?.profileImage ? (
                <Avatar
                  size={40}
                  src={employeeInfo(appDetail?.recipientId || '')?.profileImage}
                />
              ) : (
                <Avatar
                  size={40}
                  className="capitalize"
                  icon={<UserOutlined />}
                />
              )}
              <div>
                <p className="text-lg font-semibold">
                  {employeeInfo(appDetail?.recipientId || '')?.firstName ||
                    'N/A'}
                </p>
                <p className="text-gray-500">
                  Joined on:{' '}
                  {dayjs(
                    employeeInfo(appDetail?.recipientId || '')?.createdAt,
                  ).format('ddd - MMM - YYYY') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Last Updated</h4>
            <p className="col-span-9">
              {dayjs(appDetail?.updatedAt).format('ddd - MMM - YYYY') || 'N/A'}
            </p>
          </div>

          {/* Given By Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Given By</h4>
            <div className="flex items-center space-x-3 w-full col-span-9">
              {employeeInfo(appDetail?.issuerId || '')?.profileImage ? (
                <Avatar
                  size={40}
                  src={employeeInfo(appDetail?.issuerId || '')?.profileImage}
                />
              ) : (
                <Avatar
                  size={40}
                  className="capitalize"
                  icon={<UserOutlined />}
                />
              )}
              <div>
                <p className="text-lg font-semibold">
                  {employeeInfo(appDetail?.issuerId || '')?.firstName || 'N/A'}
                </p>
                <p className="text-gray-500">
                  Joined on:{' '}
                  {dayjs(
                    employeeInfo(appDetail?.issuerId || '')?.createdAt,
                  ).format('ddd - MMM - YYYY') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Total No of Appreciations and Reprimands */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">
              Total No of Appreciations
            </h4>
            <Tag className="col-span-9 w-fit" color="green">
              {appDetail?.totalNumberOfAppreciation || 0}
            </Tag>
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">
              Total No of Reprimands
            </h4>
            <Tag className="col-span-9 w-fit" color="red">
              {appDetail?.totalNumberOfRepremand || 0}
            </Tag>
          </div>

          {/* Reason Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 items-start gap-y-4 md:gap-0">
            <h4 className="text-gray-500 text-sm col-span-3">Reason</h4>
            <p className="text-gray-700 col-span-9">
              {appDetail?.action || 'No reason provided.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DetailPage;
