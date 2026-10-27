export type NavigationTab =
  | 'tong-quan'
  | 'bao-cao-da-kenh'
  | 'call-center'
  | 'chat-freshchat'
  | 'ticket-ho-tro'
  | 'nhan-su-inhouse'
  | 'nhan-su-outsourced'
  | 'danh-gia-kpi'
  | 'kiotviet-retail'
  | 'kiotviet-fnb'
  | 'kat-fnb-bar'
  | 'kiotviet-booking'
  | 'kiotviet-employ'
  | 'cau-hinh-bao-cao';

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatarText: string;
  provider?: 'google' | 'sso';
  isAdmin?: boolean;
}

export interface MultiChannelMetricRow {
  channel: string;
  metric: string;
  months: (number | string | null)[];
  definition: string;
  isCalculated?: boolean;
  unit?: string;
  target?: string;
}

export interface SyncAuditLog {
  id: string;
  timestamp: string;
  updatedBy: string;
  source: string;
  rowCount: number;
  status: 'success' | 'failed';
  notes?: string;
}

export interface AllowedUser {
  email: string;
  name: string;
  role: string;
  addedAt: string;
  addedBy: string;
}

export interface KpiGroup {
  id: number;
  name: string;
  description: string;
  weight: number;
  target: string;
  actual: string;
  contribution: string;
  maxScore: number;
  score: number;
  status: 'good' | 'improving' | 'danger' | 'excellent';
  statusText: string;
}

export interface CallDailyRecord {
  date: string;
  dayName: string;
  totalOffered: number;
  served: number;
  missCallRate: number;
  callbackRate: number;
  inhouse: number;
  osPartner: number;
  aiBot: number;
  sl8020: number;
  csat: number;
  isT1?: boolean;
}

export interface IvrQueue {
  id: number;
  name: string;
  description: string;
  total: number;
  inhouse: number;
  os: number;
  ai: number;
  aht: string;
  sl8020: string;
  csat: string;
}

export interface AgentCallRank {
  rank: number;
  name: string;
  code: string;
  ext: string;
  team: string;
  isOutsourced?: boolean;
  specialty: string;
  calls: number;
  aht: string;
  callbackSuccess: string;
  fcr: string;
  qaScore: number;
  tag: string;
  tagType: 'excellent' | 'top-os' | 'good' | 'warning' | 'verified';
}

export interface FreshchatAccount {
  code: string;
  name: string;
  transferRate: string;
  chats: number;
  responseTime: string;
  firstResponseTime: string;
  kpi41Rate: string;
  status: string;
  isAi?: boolean;
  isAlert?: boolean;
  isWarning?: boolean;
}

export interface FreshchatAgent {
  id: string;
  name: string;
  code: string;
  team: string;
  teamGroup: 'team-1' | 'team-2' | 'team-bpo';
  chats: number;
  responseTime: string;
  firstResponseTime: string;
  kpiRate: string;
  status: 'good' | 'warning' | 'alert' | 'excellent';
  statusText: string;
}

export interface TicketDailyRecord {
  dayName: string;
  day: number;
  created: number;
  resolved: number;
  resolutionRate: string;
  assign45pRate: string;
  assignTimeMin: number;
  sla4hRate: string;
  handlingTimeMin: number;
  isAlertAssign?: boolean;
  isAlertSla?: boolean;
}

export interface InhouseSummaryRow {
  stt: number | string;
  team: string;
  target: number;
  actual: number;
  fulfillmentRate: number;
  man: number;
  leader: number;
  internal: number;
  specialist: number;
  probation: number;
  total: number;
  gapText: string;
  gapType: 'danger' | 'warning' | 'balanced' | 'surplus' | 'neutral';
  isTotalRow?: boolean;
  isAllCenterRow?: boolean;
}

export interface InhouseStaffMember {
  id: string;
  ext: string;
  name: string;
  email: string;
  initials: string;
  team: string;
  teamCode: string;
  line: string;
  level: string;
  levelType: 'manager' | 'leader' | 'qa' | 'senior' | 'standard' | 'junior' | 'probation';
  startDate: string;
  tenure: string;
}

export interface OutsourceStaffMember {
  stt: number;
  name: string;
  code: string;
  birthYear: number;
  startDate: string;
  shifts: number;
  totalCalls: number;
  successfulCalls: number;
  supportRate: string;
  avgCallPerShift: number;
}

export interface ViolationRecord {
  stt: number;
  name: string;
  times: number;
  penalty: number;
}

export interface KpiTeamRecord {
  teamName: string;
  teamCode: string;
  region: string;
  staffCount: number;
  totalRate: string;
  status: 'pass' | 'check' | 'urgent';
  members: KpiMemberRecord[];
}

export interface KpiMemberRecord {
  stt: number;
  code: string;
  ms: string;
  name: string;
  level: number;
  kpiPlan: number;
  kpiActual: number;
  achievedPlan: number;
  achievedActual: number;
  ratePlan: string;
  rateActual: string;
  totalAchieved: string;
  result: string;
  contract: string;
  isWarning?: boolean;
  isCritical?: boolean;
  isTop?: boolean;
}

export interface RetailIncident {
  stt: number;
  day: number;
  month: string;
  issue: string;
  affectedModule: string;
  interface: string;
  impact: number;
  reportedTime: string;
  resolvedTime: string;
  totalTime: string;
  scope: string;
  ticketId: string;
  cause: string;
  status: string;
}

export interface RetailBug {
  stt: number;
  ticketId: string;
  createdDate: string;
  title: string;
  impact: number;
  priority: 'Highest' | 'High' | 'Medium' | 'Low';
  status: string;
  module: string;
  type: string;
  cause: string;
}
