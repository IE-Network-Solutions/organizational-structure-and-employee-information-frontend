import { Progress, Badge, Avatar } from 'antd';
import { PiUserSquare } from 'react-icons/pi';

const applicants = [
  { name: 'Giana Lipshutz', status: 'Hired' },
  { name: 'Giana Lipshutz', status: 'Hired' },
  { name: 'Giana Lipshutz', status: 'Pending' },
  { name: 'Giana Lipshutz', status: 'Pending' },
];

export const Applicants = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md w-full ">
      <h2 className="text-xl font-semibold mb-4">Applicants</h2>
      <div className="flex justify-center items-center mb-6">
        <Progress
          type="dashboard"
          percent={75}
          format={() => (
            <div className='bg-white shadow-xl rounded-full w-24 h-24 relative left-3 top-1 flex flex-col justify-center items-center '>
              <div className="text-xs font-light">Out Of</div>
              <div className="text-2xl font-extrabold">120</div>
            </div>
          )}
        />
      </div>
      <div>
        {applicants.map((applicant, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b last:border-none"
          >
            <div className="flex items-center space-x-3">
              <Avatar
                icon={<PiUserSquare/>}
                alt="Applicant Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{applicant.name}</span>
            </div>
            <Badge
              status={applicant.status === 'Hired' ? 'success' : 'warning'}
              text={applicant.status}
              className={`text-sm ${
                applicant.status === 'Hired' ? 'text-blue-600' : 'text-yellow-500'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
