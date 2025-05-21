import { Avatar } from 'antd';
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { LuCrown } from 'react-icons/lu';
import { GoGoal } from 'react-icons/go';
import { BsLightningCharge } from 'react-icons/bs';
import { TbAward } from 'react-icons/tb';

const SuperStart = () => {
  // const user = {};
  const user = {
    profileImage:
      'https://files.ienetworks.co/view/production/9b320d7d-bece-4dd4-bb87-dd226f70daef/surafelmain.jpg',
    firstName: 'Alice',
    middleName: 'Johnson',
    lastName: 'Smith',
    role: {
      name: 'Developer',
    },
  };

  return (
    <div className="bg-white flex flex-col rounded-lg p-1 gap-3">
      <div className="text-xl font-semibold gap-3 flex items-center justify-center  ">
        <LuCrown className="text-primary" /> Achievement Unlocked
        <LuCrown className="text-primary" />
      </div>
      {user?.firstName ? (
        <div>
          <div className="flex flex-col items-center gap-2 min-w-28">
            {user?.profileImage ? (
              <Avatar
                src={user?.profileImage}
                alt={`${user?.firstName || ''}`}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <Avatar
                icon={<UserOutlined size={40} />}
                className="w-16 h-16 rounded-full"
              />
            )}
            <p className="font-normal text-center text-sm   ">
              {`${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`}
            </p>
          </div>
          <div className="flex items-center justify-center  ">
            <div className="rounded-full bg-green-100 text-green-600 px-4 py-1 font-semibold text-base">
              Super Start Of The Quarter
            </div>
          </div>
          <div className="flex items-center justify-center  ">
            <div className=" text-base font-bold"> Achievement Unlocked</div>
          </div>
          <div className="flex items-center justify-center gap-2  ">
            <div className=" flex flex-col gap-3 justify-center items-center ">
              <GoGoal className="text-2xl text-green-600" />
              <div className="text-xs font-light">Goal Achieved</div>
            </div>
            <div className=" flex flex-col gap-3 justify-center items-center ">
              <BsLightningCharge className="text-2xl text-sky-600" />
              <div className="text-xs font-light">Team Energizer</div>
            </div>
            <div className=" flex flex-col gap-3 justify-center items-center ">
              <TbAward className="text-2xl text-indigo-700" />
              <div className="text-xs font-light">Most Valuable Player</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm font-light flex h-full justify-center items-center  min-h-32">
          No rockstar of the Quarter
        </div>
      )}
    </div>
  );
};

export default SuperStart;
