import { useGetApplicantSummary } from '@/store/server/features/dashboard/applicant-summary/queries';
import { Badge, Avatar, Card, Empty, Pagination } from 'antd';
import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import ApplicantSummary from './applicant';
import { useApplicantStore } from '@/store/uistate/features/dashboard/applicant';

export const Applicants = () => {
  const { status } = useApplicantStore();
  const { data: applicants, isLoading } = useGetApplicantSummary(status);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [pageSize, setPageSize] = useState(4); // Number of items per page

  // Calculate the current slice of applicants to display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedApplicants = applicants?.candidates?.slice(
    startIndex,
    endIndex,
  );
  return (
    <Card
      loading={isLoading}
      bodyStyle={{ padding: '0px' }}
      className="bg-white rounded-lg p-6 w-full "
    >
      {applicants?.applicant?.length != 0 ? (
        <>
          <ApplicantSummary applicant={applicants?.applicant || []} />
          <div>
            {paginatedApplicants?.map((applicant, index) => (
              <>
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-none"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar
                      icon={<UserOutlined />}
                      alt="Applicant Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{applicant.fullName}</span>
                  </div>
                  <Badge
                    status={
                      applicant.stage === 'Initial Stage'
                        ? 'success'
                        : 'warning'
                    }
                    text={applicant.stage}
                    className={`text-sm ${
                      applicant.stage === 'Initial Stage'
                        ? 'text-blue-600'
                        : 'text-yellow-500'
                    }`}
                  />
                </div>
              </>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Pagination
              size="small"
              current={currentPage}
              pageSize={pageSize}
              total={applicants?.applicant?.length || 0} // Total number of items
              onChange={(page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
              // To allow changing page size
            />
          </div>
        </>
      ) : (
        <Empty />
      )}
    </Card>
  );
};
