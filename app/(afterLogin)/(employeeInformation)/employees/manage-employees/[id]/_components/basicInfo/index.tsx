import { Avatar, Card, Divider, List, Tag } from 'antd';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { HiOutlineMail } from 'react-icons/hi';
import { LuPhone } from 'react-icons/lu';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import Link from 'next/link';
function BasicInfo({ id }: { id: string }) {
  const { isLoading, data: employeeData } = useGetEmployee(id);

  return (
    <Card loading={isLoading}>
      <div className="flex flex-col gap-3 items-center">
        <Avatar size={72} src={employeeData?.profileImage} />
        <h5>
          {employeeData?.firstName} {employeeData?.middleName}{' '}
          {employeeData?.lastName}
        </h5>

        <p>
          {employeeData?.employeeJobInformation?.find(
            (e: any) => e.isPositionActive === true,
          )?.jobTitle || '-'}
        </p>
        <Tag color="purple-inverse">
          {employeeData?.employeeJobInformation?.find(
            (e: any) => e.isPositionActive === true,
          )?.employmentType?.name || '-'}
        </Tag>
        <Divider className="my-2" />
      </div>
      <div className="flex gap-5 my-2 items-center">
        <HiOutlineMail color="#BFBFBF" />
        <p className="font-semibold">{employeeData?.email}</p>
      </div>
    
      <Divider className="my-2" />
      <List split={false} size="small">
        <List.Item actions={[<MdKeyboardArrowRight />]}>
          <List.Item.Meta
            title={<p className="text-xs font-light">Department</p>}
            description={
              <p className="font-bold text-black text-sm">
                {employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.department?.name || '-'}
              </p>
            }
          />
        </List.Item>
        <List.Item actions={[<MdKeyboardArrowRight />]}>
          <List.Item.Meta
            title={<p className="text-xs font-light">Office</p>}
            description={
              <p className="font-bold text-black text-sm">
                {employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.branch?.name || '-'}
              </p>
            }
          />
        </List.Item>
        <Link
          href={`/employees/manage-employees/${employeeData?.reportingTo?.id}`}
        >
          <List.Item actions={[<MdKeyboardArrowRight />]}>
            <List.Item.Meta
              title={<p className="text-xs font-light">Manager</p>}
              description={
                <p className="font-bold text-black text-sm">
                  {' '}
                  <span className="mr-2">
                    <Avatar src={employeeData?.reportingTo?.profileImage} />
                  </span>{' '}
                  {employeeData?.reportingTo?.firstName}{' '}
                  {employeeData?.reportingTo?.middleName}{' '}
                  {employeeData?.reportingTo?.lastName}
                </p>
              }
            />
          </List.Item>
        </Link>
      </List>
    </Card>
  );
}

export default BasicInfo;
