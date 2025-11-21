// types/student.ts


export interface Student {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  gender: string;
  registeredAt: string;
  lastUpdated: string;
  profileCompleted: boolean;
  totalOrders: string;
  totalSpent: number;
  lastOrderDate: string | null;
  hasPurchases: boolean;
  purchasedDetails: any | null
  analytics: any | null
  currency: string
}

export interface StudentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentsData {
  users: Student[];
  totalUsers: number;
  usersWithCompleteProfiles: number;
  pagination: StudentsPagination;
}

// API Response type
export interface FetchStudentsApiResponse {
  success: boolean;
  data: StudentsData;
  message: string;
}

// Server action response type
export interface FetchStudentsResult {
  success: boolean;
  data?: StudentsData;
  error?: string;
}