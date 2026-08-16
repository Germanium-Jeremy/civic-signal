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

export type IssueStatus = 'submitted' | 'acknowledged' | 'pending' | 'resolved' | 'closed';

export interface IssueLocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  district?: string;
  sector?: string;
}

export interface IssueMedia {
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  size: number;
  mimeType: string;
  mediaType: 'image' | 'audio' | 'video';
}

export interface Issue {
  _id: string;
  tenantId: string;
  tenantSlug?: string;
  trackingNumber: string;
  title: string;
  description?: string;
  category: string;
  categoryTemplateId?: string;
  categoryTemplateVersion?: number;
  priority: 'High' | 'Medium' | 'Low';
  status: IssueStatus;
  location?: IssueLocation;
  media: IssueMedia[];
  customFields: Record<string, any>;
  reportMarkdown?: string;
  slaDeadline?: string;
  slaStatus: 'within_sla' | 'at_risk' | 'breached';
  reportedBy: string;
  reporterDevice: {
    deviceId: string;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
    registeredAt: string;
  };
  isVerifiedReporter: boolean;
  assignedAgency?: string;
  assignedOfficer?: string;
  assignedAt?: string;
  submittedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  activities: Array<{
    action: IssueStatus | 'status_changed' | 'sla_breached' | 'assigned' | 'submitted';
    description: string;
    performedBy: string;
    performedByModel: 'User' | 'Agency';
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  workflowHistory: Array<{
    fromStatus?: IssueStatus;
    toStatus: IssueStatus;
    changedAt: string;
    changedBy: string;
    changedByModel: 'User' | 'Agency';
    comment?: string;
  }>;
  isPublic: boolean;
  showOnMap: boolean;
  viewCount: number;
  upvoteCount: number;
  upvotedBy: string[];
  resolutionNotes?: string;
  resolutionMedia: IssueMedia[];
  source: 'web' | 'mobile' | 'ios' | 'android' | 'api';
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
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
