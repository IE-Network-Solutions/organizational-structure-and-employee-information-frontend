import { RookStarsListProps } from '@/types/dashboard/okr';
import { Avatar, Card, List } from 'antd';

const RookStarsList: React.FC<RookStarsListProps> = ({ dataSource, title }) => {
  return (
    <Card
      title={
        <div className="text-lg font-bold gap-2 flex items-center justify-between  ">
          {title}
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <List
        className=" overflow-y-auto scrollbar-none "
        dataSource={dataSource}
        size="small"
        renderItem={(item) => (
          <List.Item className=" ">
            <div className="text-sm font-medium">{item.completion} %</div>
            <div className="bg-gradient-to-b from-[#7152F3] to-transparent h-10 w-[2px] rounded inline-block mx-4"></div>
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} size={24} />}
              title={
                <div className="-m-1 text-sm font-normal">{item.name}</div>
              }
              description={
                <div className="-m-1 text-sm font-normal">{item.title}</div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};
export default RookStarsList;
