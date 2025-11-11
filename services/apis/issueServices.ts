import * as Device from "expo-device"
import * as Application from "expo-application"
import api, { TokenManager } from "./config";

export const getDeviceInfo = () => {
     return {
          devideId: Device.modelId || "Unknown",
          deviceModel: `${Device.manufacturer} ${Device.modelName}`,
          osVersion: `${Device.osName} ${Device.osVersion}`,
          appVersion: Application.nativeApplicationVersion || '1.0.0'
     }
}

export const IssueService = {
     /**
      * Get all issue categories
      * No authentication required
      */
     getCategories: async () => {
          try {
               const response = await api.get("/issues/categories");
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to fetch categories",
               };
          }
     },

     /**
      * Upload photos (base64 format for mobile)
      * Returns URLs to use in issue creation
      */
     uploadPhotos: async (images: Array<{ data: string; mimeType: string }>) => {
          try {
               const response = await api.post("/issues/upload", { images });
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to upload photos",
               };
          }
     },

     /**
      * Create new issue report
      * Requires authentication
      */
     createIssue: async (issueData: { title: string; description: string; category: string; priority?: string;
          location: { latitude: number; longitude: number; address?: string; district?: string; sector?: string };
          photos?: Array<{ url: string; thumbnailUrl: string }>;
     }) => {
          try {
               const deviceInfo = getDeviceInfo();

               const response = await api.post("/issues", {...issueData, deviceInfo });

               return { success: true, data: response.data };
          } catch (error: any) {
               // Handle specific error cases
               if (error.response?.status === 403) {
                    return {
                         success: false,
                         error: error.response.data.error || "Device verification failed",
                         code: "DEVICE_VERIFICATION_FAILED",
                    };
               }

               if (error.response?.status === 429) {
                    return {
                         success: false,
                         error: "Daily submission limit reached (10 issues per day)",
                         code: "RATE_LIMIT_EXCEEDED",
                    };
               }

               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to create issue",
               };
          }
     },

     /**
      * Get user's own issues
      * Optionally filter by status
      */
     getMyIssues: async (filters?: { status?: | "submitted" | "acknowledged" | "in_progress" | "resolved" | "closed"; page?: number; limit?: number }) => {
          try {
               const user = await TokenManager.getUserData();
               if (!user) return { success: false, error: "User not authenticated" };

               const params = new URLSearchParams();
               params.append("userId", user.id);
               if (filters?.status) params.append("status", filters.status);
               if (filters?.page) params.append("page", filters.page.toString());
               if (filters?.limit) params.append("limit", filters.limit.toString());

               const response = await api.get(`/issues?${params.toString()}`);
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to fetch issues",
               };
          }
     },

     /**
      * Get issue statistics for user
      */
     getMyStats: async () => {
          try {
               const user = await TokenManager.getUserData();
               if (!user) return { success: false, error: "User not authenticated" };

               // Fetch all user's issues
               const response = await api.get(`/issues?userId=${user.id}&limit=1000`);

               if (!response.data.success) return { success: false, error: "Failed to fetch statistics" };

               const issues = response.data.data.issues;

               // Calculate statistics
               const stats = {
                    total: issues.length,
                    submitted: issues.filter((i: any) => i.status === "submitted").length,
                    acknowledged: issues.filter((i: any) => i.status === "acknowledged").length,
                    inProgress: issues.filter((i: any) => i.status === "in_progress").length,
                    resolved: issues.filter((i: any) => i.status === "resolved").length,
                    closed: issues.filter((i: any) => i.status === "closed").length,
               };

               return { success: true, data: stats };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to fetch statistics",
               };
          }
     },

     /**
      * Get single issue details by ID
      */
     getIssue: async (issueId: string) => {
          try {
               const response = await api.get(`/issues/${issueId}`);
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to fetch issue details",
               };
          }
     },

     /**
      * Get issue by tracking number
      */
     getIssueByTracking: async (trackingNumber: string) => {
          try {
               const response = await api.get(`/issues/tracking/${trackingNumber}`);
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to fetch issue",
               };
          }
     },

     /**
      * Get nearby issues (using geolocation)
      */
     getNearbyIssues: async (latitude: number, longitude: number, radius: number = 5) => {
          try {
               const response = await api.get(`/issues?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to fetch nearby issues",
               };
          }
     },

     /**
      * Upvote an issue
      */
     upvoteIssue: async (issueId: string) => {
          try {
               const response = await api.post(`/issues/${issueId}/upvote`);
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to upvote issue",
               };
          }
     },

     /**
      * Remove upvote from an issue
      */
     removeUpvote: async (issueId: string) => {
          try {
               const response = await api.delete(`/issues/${issueId}/upvote`);
               return { success: true, data: response.data };
          } catch (error: any) {
               return {
                    success: false,
                    error: error.response?.data?.error || "Failed to remove upvote",
               };
          }
     },
};
