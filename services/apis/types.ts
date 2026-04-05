import type { UserDataInterface } from "@/constants/UserInterface";

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload {
  user?: UserDataInterface;
  tokens?: Tokens;
  fullyVerified?: boolean;
  requiresVerification?: boolean;
  email?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export type AuthResult = ApiResult<AuthPayload> & {
  requiresVerification?: boolean;
  email?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};

export type IssueStatus = "submitted" | "acknowledged" | "pending" | "resolved";

export interface Issue {
  _id: string;
  title?: string;
  description?: string;
  category: string;
  priority?: string;
  status: IssueStatus;
  trackingNumber?: string;
  submittedAt?: string;
  createdAt?: string;
  location?: {
    type?: string;
    coordinates?: [number, number];
    address?: string;
    district?: string;
    sector?: string;
  };
  photos?: Array<{ url: string; thumbnailUrl?: string }>;
  activities?: Array<{
    action: string;
    description: string;
    performedBy: string;
    performedByModel: string;
    timestamp: string;
  }>;
}

export interface IssuePage {
  issues: Issue[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface IssueStats {
  total: number;
  submitted: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
}
