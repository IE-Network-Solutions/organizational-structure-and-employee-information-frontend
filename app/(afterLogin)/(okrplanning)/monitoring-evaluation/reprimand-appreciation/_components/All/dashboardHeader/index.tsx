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
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      data-cy="dashboard-header-container"
    >
      <Card
        bodyStyle={{ padding: 10 }}
        loading={isLoading}
        className="bg-gray-50 rounded-lg"
        bordered={false}
      >
        <div
          className="flex justify-between items-center"
          data-cy="dashboard-header-icon-container"
        >
          <div
            className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl"
            data-cy="dashboard-header-icon-wrapper"
          >
            <RiAwardFill className="text-green-400" />
          </div>
        </div>
        <div
          className="flex items-center justify-between"
          data-cy="dashboard-header-spacer"
        ></div>

        <div data-cy="dashboard-header-content">
          <p
            className="text-gray-500 text-[11px] mt-2"
            data-cy="dashboard-header-title"
          >
            Total Number of Appreciations Issued
          </p>
          <div
            className="flex justify-between"
            data-cy="dashboard-header-stats"
          >
            <h2
              className="text-2xl font-bold"
              data-cy="dashboard-header-appreciations-issued-count"
            >
              {dashboard?.totalNumberOfAppreciationsIssued}
            </h2>
            <div
              className="flex justify-end items-center gap-2"
              data-cy="dashboard-header-appreciations-issued-employees"
            >
              <LuUsers className="text-gray-400" />
              <p
                className="text-gray-400 text-[10px]"
                data-cy="dashboard-header-appreciations-issued-employees-text"
              >
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
        <div
          className="flex justify-between items-center"
          data-cy="dashboard-header-appreciations-received-icon-container"
        >
          <div
            className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl"
            data-cy="dashboard-header-appreciations-received-icon-wrapper"
          >
            <RiAwardFill className="text-green-400 rotate-180" />
          </div>
        </div>
        <div
          className="flex justify-between"
          data-cy="dashboard-header-appreciations-received-content"
        >
          <div data-cy="dashboard-header-appreciations-received-inner">
            <p
              className="text-gray-500 text-[11px] mt-2"
              data-cy="dashboard-header-appreciations-received-title"
            >
              Total Number of Appreciations Received
            </p>
            <div
              className="flex justify-between items-center"
              data-cy="dashboard-header-appreciations-received-stats"
            >
              <h2
                className="text-2xl font-bold"
                data-cy="dashboard-header-appreciations-received-count"
              >
                {dashboard?.totalAppreciationsReceived}
              </h2>
              <div
                className="flex justify-end items-center gap-2"
                data-cy="dashboard-header-appreciations-received-employees"
              >
                <LuUsers className="text-gray-400" />
                <p
                  className="text-gray-400 text-[10px]"
                  data-cy="dashboard-header-appreciations-received-employees-text"
                >
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
        <div
          className="flex justify-between items-center"
          data-cy="dashboard-header-reprimands-issued-icon-container"
        >
          <div
            className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl"
            data-cy="dashboard-header-reprimands-issued-icon-wrapper"
          >
            <FaBomb className="text-red-400" />
          </div>
          {/* <span
              className={`text-xs font-semibold ${dashboard?.totalNumberOfAppreciationsIssued ? 'text-green-500' : 'text-red-500'}`}
            >
              {dashboard?.totalNumberOfAppreciationsIssued}
            </span> */}
        </div>
        <div
          className="flex justify-between"
          data-cy="dashboard-header-reprimands-issued-content"
        >
          <div data-cy="dashboard-header-reprimands-issued-inner">
            <p
              className="text-gray-500 text-[11px] mt-2"
              data-cy="dashboard-header-reprimands-issued-title"
            >
              Total Number of Reprimands Issued
            </p>
            <div
              className="flex justify-between items-center"
              data-cy="dashboard-header-reprimands-issued-stats"
            >
              <h2
                className="text-2xl font-bold"
                data-cy="dashboard-header-reprimands-issued-count"
              >
                {dashboard?.totalNumberOfReprimandIssued}
              </h2>
              <div
                className="flex justify-end items-center gap-2"
                data-cy="dashboard-header-reprimands-issued-employees"
              >
                <LuUsers className="text-gray-400" />
                <p
                  className="text-gray-400 text-[10px]"
                  data-cy="dashboard-header-reprimands-issued-employees-text"
                >
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
        <div
          className="flex justify-between items-center"
          data-cy="dashboard-header-reprimands-received-icon-container"
        >
          <div
            className="bg-[#7152F30D] w-10 h-10 flex justify-center items-center rounded-full text-xl"
            data-cy="dashboard-header-reprimands-received-icon-wrapper"
          >
            <FaBomb className="text-red-400 rotate-180" />{' '}
          </div>
        </div>
        <div
          className="flex justify-between"
          data-cy="dashboard-header-reprimands-received-content"
        >
          <div data-cy="dashboard-header-reprimands-received-inner">
            <p
              className="text-gray-500 text-[11px] mt-2"
              data-cy="dashboard-header-reprimands-received-title"
            >
              Total Number of Reprimands Received
            </p>
            <div
              className="flex justify-between"
              data-cy="dashboard-header-reprimands-received-stats"
            >
              <h2
                className="text-2xl font-bold"
                data-cy="dashboard-header-reprimands-received-count"
              >
                {dashboard?.totalReprimandReceived}
              </h2>
              <div
                className="flex justify-end items-center gap-2"
                data-cy="dashboard-header-reprimands-received-employees"
              >
                <LuUsers className="text-gray-400" />
                <p
                  className="text-gray-400 text-[10px]"
                  data-cy="dashboard-header-reprimands-received-employees-text"
                >
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
