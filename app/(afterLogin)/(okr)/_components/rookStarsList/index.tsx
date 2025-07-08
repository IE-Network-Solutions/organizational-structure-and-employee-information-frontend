import { useGetRockStars } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { RookStarsListProps } from '@/types/dashboard/okr';
import { Avatar, Card, List } from 'antd';

const RookStarsList: React.FC<RookStarsListProps> = ({
  title,
  planningPeriodId,
}) => {
  const { data: rockStars = [] } = useGetRockStars(planningPeriodId, {
    enabled: !!planningPeriodId,
  });

  return (
    <Card
      className="h-80"
      title={
        <div className="text-lg font-bold gap-2 flex items-center justify-between  ">
          {title}
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <List
        className=" overflow-y-auto max-h-72 scrollbar-none "
        dataSource={rockStars}
        size="small"
        renderItem={(item: any) => (
          <List.Item className=" ">
            <div className="text-sm font-medium">
              {item?.report_reportScore || '0%'}
            </div>
            <div className="bg-gradient-to-b from-[#7152F3] to-transparent h-10 w-[2px] rounded inline-block mx-4"></div>
            <List.Item.Meta
              avatar={<Avatar src={item?.user?.profileImage} size={24} />}
              title={
                <div className="-m-1 text-sm font-normal">
                  {(item?.user?.firstName || 'Unknown') +
                    ' ' +
                    (item?.user?.middleName || 'Unknown')}
                </div>
              }
              description={
                <div className="-m-1 text-sm font-normal">
                  {item?.user?.role?.name || 'Unknown'}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
export default RookStarsList;
