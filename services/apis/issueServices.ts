import * as Application from "expo-application";
import * as Device from "expo-device";
import api, { TokenManager } from "./config";
import type { ApiResult, Issue, IssuePage, IssueStats, IssueStatus } from "./types";

type ApiBody = { success?: boolean; message?: string; error?: string; data?: Record<string, unknown> };
type Media = { url: string; mediaType: "image" | "audio" | "video"; thumbnailUrl?: string; size?: number; mimeType?: string };

export const getDeviceInfo = () => ({
  deviceId: Device.modelId || "Unknown",
  deviceModel: `${Device.manufacturer || "Unknown"} ${Device.modelName || "Device"}`,
  osVersion: `${Device.osName || "Unknown"} ${Device.osVersion || ""}`.trim(),
  appVersion: Application.nativeApplicationVersion || "1.0.0",
});

function errorResult(error: unknown, fallback: string): ApiResult<never> {
  const body = (error as { response?: { data?: ApiBody } })?.response?.data;
  return { success: false, error: body?.error || (error instanceof Error ? error.message : fallback) };
}

function validIssue(value: unknown): value is Issue {
  return Boolean(value && typeof value === "object" && typeof (value as Issue)._id === "string" && typeof (value as Issue).category === "string");
}

function pageFromBody(body: ApiBody): IssuePage | null {
  const data = body.data;
  const issues = data?.issues;
  const pagination = data?.pagination;
  if (!Array.isArray(issues) || !issues.every(validIssue) || !pagination || typeof pagination !== "object") return null;
  const value = pagination as IssuePage["pagination"];
  if (![value.page, value.limit, value.total, value.totalPages].every((item) => typeof item === "number")) return null;
  return { issues, pagination: value };
}

async function currentUserId(): Promise<string | null> {
  const user = await TokenManager.getUserData<{ id?: string }>();
  return typeof user?.id === "string" && user.id ? user.id : null;
}

export const IssueService = {
  async getCategories(): Promise<ApiResult<unknown[]>> {
    try {
      const body = (await api.get("/issues/categories")).data as ApiBody;
      const categories = body.data?.categories;
      return Array.isArray(categories) ? { success: true, data: categories, message: body.message } : { success: false, error: "The server returned invalid categories." };
    } catch (error) { return errorResult(error, "Failed to fetch categories"); }
  },

  async updateIssueMedia(issueId: string, media: Media[]): Promise<ApiResult<Issue>> {
    try {
      const body = (await api.patch(`/issues/${issueId}`, { media })).data as ApiBody;
      const issue = body.data?.issue;
      return validIssue(issue) ? { success: true, data: issue, message: body.message } : { success: false, error: "The server returned an invalid updated issue." };
    } catch (error) { return errorResult(error, "Failed to update issue media"); }
  },

  async uploadMedia(files: Array<{ data: string; mimeType: string }>): Promise<ApiResult<Media[]>> {
    try {
      const body = (await api.post("/issues/upload", { images: files })).data as ApiBody;
      const images = body.data?.images;
      return Array.isArray(images) ? { success: true, data: images as Media[], message: body.message } : { success: false, error: "The server returned invalid uploaded media." };
    } catch (error) { return errorResult(error, "Failed to upload media"); }
  },

  async createIssue(issueData: {
    title?: string; description?: string; category: string; priority?: string;
    location?: { latitude?: number; longitude?: number; address?: string; district?: string; sector?: string };
    media?: Media[]; customFields?: Record<string, unknown>; source?: "web" | "mobile" | "ios" | "android" | "api";
  }): Promise<ApiResult<Issue> & { offline?: boolean; code?: string }> {
    try {
      const body = (await api.post("/issues", { ...issueData, deviceInfo: getDeviceInfo() })).data as ApiBody;
      const issue = body.data?.issue;
      return validIssue(issue) ? { success: true, data: issue, message: body.message } : { success: false, error: body.error || "The server returned an invalid issue." };
    } catch (error) {
      const result = errorResult(error, "Failed to create issue") as ApiResult<Issue> & { offline?: boolean; code?: string };
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403) result.code = "DEVICE_VERIFICATION_FAILED";
      if (status === 429) { result.error = "Daily submission limit reached (10 issues per day)"; result.code = "RATE_LIMIT_EXCEEDED"; }
      result.offline = !status || (error instanceof Error && error.message.includes("Network Error"));
      return result;
    }
  },

  async getMyIssues(filters?: { status?: IssueStatus; page?: number; limit?: number }): Promise<ApiResult<IssuePage>> {
    const userId = await currentUserId();
    if (!userId) return { success: false, error: "User not authenticated" };
    try {
      const params = new URLSearchParams({ userId });
      if (filters?.status) params.set("status", filters.status);
      if (filters?.page) params.set("page", String(filters.page));
      if (filters?.limit) params.set("limit", String(filters.limit));
      const body = (await api.get(`/issues?${params.toString()}`)).data as ApiBody;
      const page = pageFromBody(body);
      return page ? { success: true, data: page, message: body.message } : { success: false, error: body.error || "The server returned invalid issues." };
    } catch (error) { return errorResult(error, "Failed to fetch issues"); }
  },

  async getMyStats(): Promise<ApiResult<IssueStats>> {
    const page = await this.getMyIssues({ limit: 1000 });
    if (!page.success || !page.data) return { success: false, error: page.error || "Failed to fetch statistics" };
    const issues = page.data.issues;
    return { success: true, data: {
      total: issues.length,
      submitted: issues.filter((issue) => issue.status === "submitted").length,
      acknowledged: issues.filter((issue) => issue.status === "acknowledged").length,
      inProgress: issues.filter((issue) => issue.status === "pending").length,
      resolved: issues.filter((issue) => issue.status === "resolved").length,
    } };
  },

  async getIssue(issueId: string): Promise<ApiResult<Issue>> {
    try {
      const body = (await api.get(`/issues/${issueId}`)).data as ApiBody;
      const issue = body.data?.issue;
      return validIssue(issue) ? { success: true, data: issue, message: body.message } : { success: false, error: body.error || "The server returned an invalid issue." };
    } catch (error) { return errorResult(error, "Failed to fetch issue details"); }
  },

  async getIssueByTracking(trackingNumber: string): Promise<ApiResult<Issue>> {
    try {
      const body = (await api.get(`/issues/tracking/${trackingNumber}`)).data as ApiBody;
      const issue = body.data?.issue;
      return validIssue(issue) ? { success: true, data: issue, message: body.message } : { success: false, error: body.error || "The server returned an invalid issue." };
    } catch (error) { return errorResult(error, "Failed to fetch issue"); }
  },

  async getNearbyIssues(latitude: number, longitude: number, radius = 5): Promise<ApiResult<IssuePage>> {
    try {
      const body = (await api.get(`/issues?latitude=${latitude}&longitude=${longitude}&radius=${radius}`)).data as ApiBody;
      const page = pageFromBody(body);
      return page ? { success: true, data: page, message: body.message } : { success: false, error: body.error || "The server returned invalid issues." };
    } catch (error) { return errorResult(error, "Failed to fetch nearby issues"); }
  },

  async upvoteIssue(issueId: string): Promise<ApiResult<unknown>> {
    try { const body = (await api.post(`/issues/${issueId}/upvote`)).data as ApiBody; return body.success === false ? { success: false, error: body.error } : { success: true, data: body.data, message: body.message }; } catch (error) { return errorResult(error, "Failed to upvote issue"); }
  },
  async removeUpvote(issueId: string): Promise<ApiResult<unknown>> {
    try { const body = (await api.delete(`/issues/${issueId}/upvote`)).data as ApiBody; return body.success === false ? { success: false, error: body.error } : { success: true, data: body.data, message: body.message }; } catch (error) { return errorResult(error, "Failed to remove upvote"); }
  },

  async getAllPublicIssues(page = 1, limit = 100): Promise<ApiResult<IssuePage>> {
    try {
      const body = (await api.get(`/issues?page=${page}&limit=${limit}`)).data as ApiBody;
      const result = pageFromBody(body);
      return result ? { success: true, data: result, message: body.message } : { success: false, error: body.error || "The server returned invalid issues." };
    } catch (error) { return errorResult(error, "Failed to fetch public issues"); }
  },
};
