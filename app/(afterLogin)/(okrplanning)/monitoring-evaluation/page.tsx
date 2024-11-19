'use client';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { Input, Card } from 'antd';
import Link from 'next/link';
import { FaArrowRightLong } from 'react-icons/fa6';

const { Search } = Input;

const MonitoringEvaluation = () => {
  return (
    <div className="p-6 min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Monitoring & Evaluation</h1>
        <p className="text-gray-500">Monitoring & Evaluation</p>
      </div>
      <Search placeholder="Search" className="mb-6" size="large" />
      <AccessGuard permissions={[Permissions.ViewReprimandAndAppreciation]}>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gray-100" bodyStyle={{ padding: '20px' }} hoverable>
            <h3 className="text-lg font-semibold">Reprimand & Appreciation</h3>
            <p className="text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
              scelerisque, urna sed tincidunt malesuada, nulla purus tempus lorem
              purus tempus lorem purus tempus.
            </p>
            <Link
              href="monitoring-evaluation/reprimand-appreciation"
              className="flex justify-end mt-10"
            >
              <FaArrowRightLong key="arrow" />
            </Link>
          </Card>
        </div>
      </AccessGuard>
    </div>
  );
};

export default MonitoringEvaluation;
