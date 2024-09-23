import { RookStarsListProps } from '@/types/dashboard/okr';
import { Avatar, Card, List } from 'antd';

const RookStarsList: React.FC<RookStarsListProps> = ({ dataSource, title }) => {
  return (
    <Card
      title={
        <div className="text-lg font-extrabold gap-2 flex items-center justify-between ">
          {title}
        </div>
      }
    >
      <List
        className="-m-6"
        dataSource={dataSource}
        size="small"
        renderItem={(item) => (
          <List.Item className=" ">
            <div className="text-lg font-medium">{item.completion} %</div>

            <div className="bg-gradient-to-b from-[#7152F3] to-transparent h-10 w-[2px] rounded inline-block mx-4"></div>

            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={
                <div className="-m-1 text-lg font-normal">{item.name}</div>
              }
              description={item.title}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
export default RookStarsList;
