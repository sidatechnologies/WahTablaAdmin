export interface ExamAttemptSubmission {
  submissionId: number;
  questionId: number;
  question: string;
  questionOrder: number;
  submissionType: 'text' | 'link';
  textAnswer: string | null;
  linkUrl: string | null;
  notes: string;
  isChecked: boolean;
  passed: boolean | null;
  feedback: string | null;
}

export interface FinalExamDetails {
  submissionId: number;
  submissionType: 'text' | 'link';
  linkUrl: string | null;
  notes: string;
  totalMarks: number | string | null;
  isChecked: boolean;
  passed: boolean | null;
  feedback: string | null;
  requiresCertificate: boolean;
}

export interface ExamAttempt {
  attemptId: number;
  examId: number;
  examType: 'assignment' | 'final';
  examTitle: string;
  examDescription: string;
  course: string;
  year: string;
  week: number;
  attemptNumber: number;
  dateTime: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  status: 'passed' | 'failed' | 'pending';
  gradedAt: string | null;
  gradedBy: string | null;
  totalMarks: number | null;
  assignmentDetails?: ExamAttemptSubmission[];
  finalExamDetails?: FinalExamDetails;
}

export interface EntranceExamAttempt {
  attemptId: number;
  examId: number;
  examTitle: string;
  course: string;
  year: string;
  attemptNumber: number;
  dateTime: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  status: 'passed' | 'failed' | 'pending';
  gradedAt: string | null;
  gradedBy: string | null;
  totalMarks: number | null;
  videoUrl: string | null;
}

export interface ExamAttemptsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


export interface UpdateExamAttemptRequest {
  attemptId: number;
  passed: boolean;
  feedback?: string | null;
  marks?: number | string;
}

export interface UpdateExamAttemptData {
  attemptId: number;
  passed: boolean;
  feedback: string;
  marks: number;
  gradedAt: string;
  gradedBy: number;
}

export interface UpdateExamAttemptApiResponse {
  success: boolean;
  message: string;
  data: UpdateExamAttemptData;
}

// Server action response type
export interface UpdateExamAttemptResult {
  success: boolean;
  data?: UpdateExamAttemptData;
  error?: string;
}