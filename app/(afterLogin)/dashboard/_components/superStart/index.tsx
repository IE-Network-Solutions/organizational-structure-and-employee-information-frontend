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
    <div className="bg-white flex flex-col rounded-lg p-1 gap-5 shadow-lg">
      <div className="text-base lg:text-xl font-bold gap-10 flex items-center justify-center">
        <LuCrown className="text-primary" /> Achievement Unlocked{' '}
        <LuCrown className="text-primary" />
      </div>

      {isUserValid ? (
        <div className="flex flex-col justify-between gap-5">
          <div className="flex flex-col items-center gap-2 min-w-28 transition-all duration-500">
            {currentUser.profileImage ? (
              <Avatar
                src={currentUser.profileImage}
                alt={`${currentUser.firstName || ''}`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <Avatar
                icon={<UserOutlined />}
                className="w-16 h-16 rounded-full"
              />
            )}
            <p className="font-medium text-center text-base">
              {`${currentUser.firstName || ''} ${currentUser.middleName || ''} ${currentUser.lastName || ''}`}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="rounded-full bg-green-100 text-green-600 px-4 py-1 font-medium text-base">
              Super Start Of The Quarter
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex items-center justify-center">
              <div className="text-base font-bold">Achievement Unlocked</div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col gap-3 justify-center items-center">
                <GoGoal className="text-3xl text-green-600" />
                <div className="text-xs font-thin">Goal Achieved</div>
              </div>
              <div className="flex flex-col gap-3 justify-center items-center">
                <BsLightningCharge className="text-3xl text-sky-600" />
                <div className="text-xs font-thin">Team Energizer</div>
              </div>
              <div className="flex flex-col gap-3 justify-center items-center">
                <TbAward className="text-3xl text-indigo-700" />
                <div className="text-xs font-thin">Most Valuable Player</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-lg font-light flex h-full justify-center items-center min-h-32">
          No rockstar of the Quarter
        </div>
      )}
    </div>
  );
};

export default SuperStart;
