export type ChangeDirection = 'up' | 'down' | 'neutral';

export interface KpiItem {
  value: number;
  changeRate: number;
  changeDirection: ChangeDirection;
}

export interface KpiResponse {
  totalUsers: KpiItem;
  activeQuestions: KpiItem;
  totalNotices: KpiItem;
  pausedInterviews: KpiItem;
  analyzingReports: KpiItem;
}

export interface SignupTrendItem {
  date: string;
  count: number;
}

export interface SignupTrendResponse {
  period: string;
  items: SignupTrendItem[];
}

export interface ChartSegment {
  label: string;
  count: number;
  percentage: number;
}

export interface InterviewCompletionResponse {
  completionRate: number;
  segments: ChartSegment[];
}

export interface ReportAnalysisResponse {
  completionRate: number;
  totalCount: number;
  segments: ChartSegment[];
}

export type ActivityType =
  | 'USER_JOINED'
  | 'REPORT_COMPLETED'
  | 'INTERVIEW_INTERRUPTED'
  | 'NOTICE_CREATED'
  | 'REPORT_STARTED'
  | 'INTERVIEW_COMPLETED';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  relativeTime: string;
}

export interface RecentActivitiesResponse {
  items: ActivityItem[];
}

export interface DashboardSummaryResponse {
  kpi: KpiResponse;
  signupTrend: SignupTrendResponse;
  interviewCompletion: InterviewCompletionResponse;
  reportAnalysis: ReportAnalysisResponse;
  recentActivities: RecentActivitiesResponse;
}
