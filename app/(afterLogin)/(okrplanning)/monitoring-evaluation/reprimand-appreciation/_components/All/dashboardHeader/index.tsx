import { useAppRepDashboard } from '@/store/server/features/okrplanning/monitoring-evaluation/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Card } from 'antd';
import { FaBomb } from 'react-icons/fa';
import { LuUsers } from 'react-icons/lu';
import { RiAwardFill } from 'react-icons/ri';

const DashboardHeader = () => {
  const { userId } = useAuthenticationStore();
  const { data: dashboard, isLoading } = useAppRepDashboard(userId);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card
        bodyStyle={{ padding: 10 }}
        loading={isLoading}
        className="bg-gray-50 rounded-lg"
        bordered={false}
      >
        <div className="flex justify-between items-center">
          <div className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl">
            <RiAwardFill className="text-green-400" />
          </div>
        </div>
        <div className="flex items-center justify-between"></div>

        <div>
          <p className="text-gray-500 text-[11px] mt-2">
            Total Number of Appreciations Issued
          </p>
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">
              {dashboard?.totalNumberOfAppreciationsIssued}
            </h2>
            <div className="flex justify-end items-center gap-2">
              <LuUsers className="text-gray-400" />
              <p className="text-gray-400 text-[10px]">
                {dashboard?.employeesAffectedByAppreciation || 0} Employees
                Affected
              </p>
            </div>
          </div>
        </div>
      </Card>
      <Card
        bodyStyle={{ padding: 10 }}
        loading={isLoading}
        className="bg-gray-50 rounded-lg "
        bordered={false}
      >
        <div className="flex justify-between items-center">
          <div className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl">
            <RiAwardFill className="text-green-400 rotate-180" />
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-[11px] mt-2">
              Total Number of Appreciations Received
            </p>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {dashboard?.totalAppreciationsReceived}
              </h2>
              <div className="flex justify-end items-center gap-2">
                <LuUsers className="text-gray-400" />
                <p className="text-gray-400 text-[10px]">
                  {dashboard?.employeesContributedAppreciation} Employees
                  Affected
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card
        bodyStyle={{ padding: 10 }}
        loading={isLoading}
        className="bg-gray-50 rounded-lg"
        bordered={false}
      >
        <div className="flex justify-between items-center">
          <div className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl">
            <FaBomb className="text-red-400" />
          </div>
          {/* <span
              className={`text-xs font-semibold ${dashboard?.totalNumberOfAppreciationsIssued ? 'text-green-500' : 'text-red-500'}`}
            >
              {dashboard?.totalNumberOfAppreciationsIssued}
            </span> */}
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-[11px] mt-2">
              Total Number of Reprimands Issued
            </p>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {dashboard?.totalNumberOfReprimandIssued}
              </h2>
              <div className="flex justify-end items-center gap-2">
                <LuUsers className="text-gray-400" />
                <p className="text-gray-400 text-[10px]">
                  {dashboard?.employeesAffectedByReprimand || 0} Employees
                  Affected
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card
        bodyStyle={{ padding: 10 }}
        loading={isLoading}
        className="bg-gray-50 rounded-lg"
        bordered={false}
      >
        <div className="flex justify-between items-center">
          <div className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl">
            <FaBomb className="text-red-400 rotate-180" />{' '}
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-[11px] mt-2">
              Total Number of Reprimands Received
            </p>
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold">
                {dashboard?.totalReprimandReceived}
              </h2>
              <div className="flex justify-end items-center gap-2">
                <LuUsers className="text-gray-400" />
                <p className="text-gray-400 text-[10px]">
                  {dashboard?.employeesContributedReprimand || 0} Employees
                  Affected
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHeader;
