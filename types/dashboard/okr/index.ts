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
  okr: OkrValue;
  supervisorOkr: OkrValue;
  keyResults: OkrValue;
  vp: OkrValue;
  issuedReprimand: OkrValue;
  receiveReprimand: OkrValue;
  issuedAppreciations: OkrValue;
  receiveAppreciations: OkrValue;
  updatedAt: string;
}
interface OkrValue {
  score: string;
  progress: string;
  progressType: boolean;
  achievement?: string;
}
export interface DashboardCardProps {
  updatedAt: string;
  score: OkrValue;
  title: string;
  icon: React.ReactNode;
  span: number;
  isTop: boolean;
  cardColor?: string;
  isLoading?: boolean;
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
