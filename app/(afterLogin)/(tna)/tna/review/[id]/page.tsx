'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { FaArrowLeftLong } from 'react-icons/fa6';
import UserCard from '@/components/common/userCard/userCard';

const TnaDetailPage = () => {
  const router = useRouter();
  return (
    <BlockWrapper>
      <PageHeader
        title={
          <div className="flex items-center gap-1">
            <Button
              icon={<FaArrowLeftLong size={18} />}
              className="text-gray-900 bg-transparent shadow-none"
              type="primary"
              size="small"
              onClick={router.back}
            />{' '}
            Details
          </div>
        }
      />
      <div className="mt-6 rounded-lg border border-gray-200 p-6">
        <div className="border-b border-gray-200 text-lg font-semibold text-gray-900 pb-4 mb-8">
          Jennifer Law
        </div>

        <div>
          <div className="flex gap-2.5 mb-4">
            <div className="w-[200px] text-sm text-gray-600">Requester</div>
            <div className="flex-1">
              <UserCard
                name="Jennifer Law"
                description="Join Date: 23 Feb, 2023 "
              />
            </div>
          </div>

          <div className="flex gap-2.5 mb-4">
            <div className="w-[200px] text-sm text-gray-600">Training</div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2.5 mb-4">
            <div className="w-[200px] text-sm text-gray-600">Status</div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2.5 mb-4">
            <div className="w-[200px] text-sm text-gray-600">Completed on</div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2.5 mb-4">
            <div className="w-[200px] text-sm text-gray-600">Attachments</div>
            <div className="flex-1"></div>
          </div>

          <div className="flex gap-2.5">
            <div className="w-[200px] text-sm text-gray-600">
              Detailed information
            </div>
            <div className="flex-1"></div>
          </div>
        </div>
      </div>
    </BlockWrapper>
  );
};

export default TnaDetailPage;
