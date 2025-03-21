export interface RookStarsListProps {
  title: string;
  planningPeriodId: string;
}

export interface ListData {
  key: string;
  name: string;
  title: string;
  avatar: string;
  completion: number;
}

export interface SelectOption {
  key: string;
  value: string;
  label: string;
}

interface OKRValue {
  userOkr: number;
  score: string;
  progress: string;
  progressType: boolean;
  achievement?: string;
}
export interface CardData {
  key: string;
  name: string;
  position: string;
  department: string;
  okr: OKRValue;
  supervisorOkr: OKRValue;
  keyResults: OKRValue;
  vp: OKRValue;
  issuedReprimand: OKRValue;
  receiveReprimand: OKRValue;
  issuedAppreciations: OKRValue;
  receiveAppreciations: OKRValue;
  updatedAt: string;
}

export interface DashboardCardProps {
  updatedAt: string;
  score: OKRValue;
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
