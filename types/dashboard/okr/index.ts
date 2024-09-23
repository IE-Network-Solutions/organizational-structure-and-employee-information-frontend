export interface RookStarsListProps {
  dataSource: Array<{
    avatar: string;
    name: string;
    title: string;
    completion: number;
  }>;
  title: string;
}

export interface ListData {
  key: string;
  name: string;
  title: string;
  avatar: string;
  completion: number;
}

export interface CardData {
  key: string;
  name: string;
  position: string;
  department: string;
  okr: value;
  supervisorOkr: value;
  keyResults: value;
  vp: value;
  issuedReprimand: value;
  receiveReprimand: value;
  issuedAppreciations: value;
  receiveAppreciations: value;
  updatedAt: string;
}
interface value {
  score: string;
  progress: string;
  progressType: boolean;
  achievement?: string;
}
export interface DashboardCardProps {
  updatedAt: string;
  score: value;
  title: string;
  icon: React.ReactNode;
  span: number;
  isTop: boolean;
  cardColor?: string;
}
export interface selectData {
  key: string;
  value: string;
  label: string;
}

export interface WeeklyScore {
  label: string;
  scoreValue: number;
}
