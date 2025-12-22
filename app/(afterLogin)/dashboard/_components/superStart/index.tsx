import { Avatar } from 'antd';
import React, { useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { LuCrown } from 'react-icons/lu';
import { GoGoal } from 'react-icons/go';
import { BsLightningCharge } from 'react-icons/bs';
import { TbAward } from 'react-icons/tb';
import { useGetSuperStar } from '@/store/server/features/dashboard/recognitions/queries';
import { useDashboardRecognitionStore } from '@/store/uistate/features/dashboard/recognition';

const SuperStart = () => {
  const { data: superStarData } = useGetSuperStar();
  const { currentIndex, setCurrentIndex } = useDashboardRecognitionStore();

  useEffect(() => {
    if (!superStarData || superStarData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        currentIndex + 1 >= superStarData.length ? 0 : currentIndex + 1,
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [superStarData, currentIndex]); // include currentIndex in deps

  const currentUser = superStarData?.[currentIndex]?.user;
  const isUserValid = !!currentUser;

  return (
    <div
      className="bg-white flex flex-col rounded-lg p-1 gap-5 shadow-lg"
      data-cy="dashboard-super-start-container"
    >
      <div
        className="text-base lg:text-xl font-bold gap-10 flex items-center justify-center"
        data-cy="dashboard-super-start-title"
      >
        <LuCrown
          className="text-primary"
          data-cy="dashboard-super-start-title-icon-left"
        />
        <span data-cy="dashboard-super-start-title-text">
          Achievement Unlocked
        </span>
        <LuCrown
          className="text-primary"
          data-cy="dashboard-super-start-title-icon-right"
        />
      </div>

      {isUserValid ? (
        <div
          className="flex flex-col justify-between gap-5"
          data-cy="dashboard-super-start-content"
        >
          <div
            className="flex flex-col items-center gap-2 min-w-28 transition-all duration-500"
            data-cy="dashboard-super-start-user-info"
          >
            {currentUser.profileImage ? (
              <Avatar
                src={currentUser.profileImage}
                alt={`${currentUser.firstName || ''}`}
                className="w-16 h-16 rounded-full"
                data-cy="dashboard-super-start-user-avatar"
              />
            ) : (
              <Avatar
                icon={
                  <UserOutlined data-cy="dashboard-super-start-user-avatar-icon" />
                }
                className="w-16 h-16 rounded-full"
                data-cy="dashboard-super-start-user-avatar-default"
              />
            )}
            <p
              className="font-medium text-center text-base"
              data-cy="dashboard-super-start-user-name"
            >
              <span data-cy="dashboard-super-start-user-name-text">
                {`${currentUser.firstName || ''} ${currentUser.middleName || ''} ${currentUser.lastName || ''}`}
              </span>
            </p>
          </div>

          <div
            className="flex items-center justify-center"
            data-cy="dashboard-super-start-badge-container"
          >
            <div
              className="rounded-full bg-green-100 text-green-600 px-4 py-1 font-medium text-base"
              data-cy="dashboard-super-start-badge"
            >
              <span data-cy="dashboard-super-start-badge-text">
                Super Start Of The Quarter
              </span>
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center gap-5"
            data-cy="dashboard-super-start-achievements"
          >
            <div
              className="flex items-center justify-center"
              data-cy="dashboard-super-start-achievements-title"
            >
              <div
                className="text-base font-bold"
                data-cy="dashboard-super-start-achievements-title-text"
              >
                <span data-cy="dashboard-super-start-achievements-title-text-content">
                  Achievement Unlocked
                </span>
              </div>
            </div>
            <div
              className="flex items-center justify-center gap-2"
              data-cy="dashboard-super-start-achievements-list"
            >
              <div
                className="flex flex-col gap-3 justify-center items-center"
                data-cy="dashboard-super-start-achievement-goal"
              >
                <GoGoal
                  className="text-3xl text-green-600"
                  data-cy="dashboard-super-start-achievement-goal-icon"
                />
                <div
                  className="text-xs font-thin"
                  data-cy="dashboard-super-start-achievement-goal-label"
                >
                  <span data-cy="dashboard-super-start-achievement-goal-label-text">
                    Goal Achieved
                  </span>
                </div>
              </div>
              <div
                className="flex flex-col gap-3 justify-center items-center"
                data-cy="dashboard-super-start-achievement-energizer"
              >
                <BsLightningCharge
                  className="text-3xl text-sky-600"
                  data-cy="dashboard-super-start-achievement-energizer-icon"
                />
                <div
                  className="text-xs font-thin"
                  data-cy="dashboard-super-start-achievement-energizer-label"
                >
                  <span data-cy="dashboard-super-start-achievement-energizer-label-text">
                    Team Energizer
                  </span>
                </div>
              </div>
              <div
                className="flex flex-col gap-3 justify-center items-center"
                data-cy="dashboard-super-start-achievement-mvp"
              >
                <TbAward
                  className="text-3xl text-indigo-700"
                  data-cy="dashboard-super-start-achievement-mvp-icon"
                />
                <div
                  className="text-xs font-thin"
                  data-cy="dashboard-super-start-achievement-mvp-label"
                >
                  <span data-cy="dashboard-super-start-achievement-mvp-label-text">
                    Most Valuable Player
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="text-lg font-light flex h-full justify-center items-center min-h-32"
          data-cy="dashboard-super-start-empty"
        >
          <span data-cy="dashboard-super-start-empty-text">
            No rockstar of the Quarter
          </span>
        </div>
      )}
    </div>
  );
};

export default SuperStart;
