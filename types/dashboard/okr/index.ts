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
  okr: okrValue;
  supervisorOkr: okrValue;
  keyResults: okrValue;
  vp: okrValue;
  issuedReprimand: okrValue;
  receiveReprimand: okrValue;
  issuedAppreciations: okrValue;
  receiveAppreciations: okrValue;
  updatedAt: string;
}
interface okrValue {
  score: string;
  progress: string;
  progressType: boolean;
  achievement?: string;
}
export interface DashboardCardProps {
  updatedAt: string;
  score: okrValue;
  title: string;
  icon: React.ReactNode;
  span: number;
  isTop: boolean;
  cardColor?: string;
}
export interface SelectData {
  key: string;
  value: string;
  label: string;
}

export interface WeeklyScore {
  label: string;
  scoreValue: number;
}
