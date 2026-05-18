export type ReportStatus = 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';

export interface ReportUser {
  id: number;
  nickname: string;
  email?: string;
}

export interface ReportSummary {
  reportId: string;
  intvId: string;
  user: ReportUser;
  jobCategory: string | null;
  status: ReportStatus;
  score: number | null;
  completedAt: string;
}

export interface QuestionResult {
  questionId: string;
  question: string;
  answer: string;
  score: number | null;
  feedback: string;
}

export interface ReportDetail extends ReportSummary {
  feedback: string | null;
  strengths: string[];
  improvements: string[];
  questionResults: QuestionResult[];
  createdAt: string;
}

export interface ListReportsQuery {
  status?: ReportStatus;
  search?: string;
  sortBy?: 'completedAt' | 'createdAt' | 'score';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}
