import type { UserDataInterface } from "@/constants/UserInterface";
import api, { TokenManager } from "./config";
import { normalizeEmail, normalizePhone, type ResetMethod } from "./authInput";
import type { ApiResult, AuthPayload, AuthResult, Tokens } from "./types";

type VerificationResponse = AuthPayload;

function errorResult(error: unknown, fallback: string): ApiResult<never> {
  const response = (error as { response?: { data?: { error?: string; message?: string; details?: string[] } } })?.response?.data;
  return {
    success: false,
    error: response?.error || response?.message || (error instanceof Error ? error.message : fallback),
    details: response?.details,
  };
}

async function saveSession(tokens?: Tokens, user?: UserDataInterface) {
  if (!tokens?.accessToken || !tokens.refreshToken || !user) return;
  await TokenManager.saveTokens(tokens.accessToken, tokens.refreshToken);
  await TokenManager.saveUserData(user);
}

function toAuthResult(payload: AuthPayload, message?: string): AuthResult {
  return {
    success: true,
    data: payload,
    message,
    requiresVerification: payload.requiresVerification,
    email: payload.email,
    phone: payload.phone,
    emailVerified: payload.emailVerified,
    phoneVerified: payload.phoneVerified,
  };
}

export const AuthService = {
  async register(data: { fullName: string; email: string; phone: string; password: string }): Promise<AuthResult> {
    try {
      const response = await api.post("/auth/register", {
        ...data,
        fullName: data.fullName.trim(),
        email: normalizeEmail(data.email),
        phone: normalizePhone(data.phone),
      });
      const body = response.data as { message?: string; user?: UserDataInterface };
      return toAuthResult({ user: body.user, email: body.user?.email, phone: body.user?.phone }, body.message);
    } catch (error) {
      return errorResult(error, "Registration failed");
    }
  },

  async verifyEmail(email: string, code: string): Promise<ApiResult<VerificationResponse>> {
    try {
      const response = await api.post("/auth/verify-email", { email: normalizeEmail(email), code: code.trim() });
      const body = response.data as VerificationResponse & { message?: string };
      await saveSession(body.tokens, body.user);
      return { success: true, data: body, message: body.message };
    } catch (error) {
      return errorResult(error, "Verification failed");
    }
  },

  async verifyPhone(phone: string, code: string): Promise<ApiResult<VerificationResponse>> {
    try {
      const response = await api.post("/auth/verify-phone", { phone: normalizePhone(phone), code: code.trim() });
      const body = response.data as VerificationResponse & { message?: string };
      await saveSession(body.tokens, body.user);
      return { success: true, data: body, message: body.message };
    } catch (error) {
      return errorResult(error, "Verification failed");
    }
  },

  async resendEmailCode(email: string): Promise<ApiResult<never>> {
    try {
      const response = await api.patch("/auth/verify-email", { email: normalizeEmail(email) });
      return { success: true, message: response.data?.message };
    } catch (error) {
      return errorResult(error, "Failed to resend code");
    }
  },

  async resendPhoneCode(phone: string): Promise<ApiResult<never>> {
    try {
      const response = await api.patch("/auth/verify-phone", { phone: normalizePhone(phone) });
      return { success: true, message: response.data?.message };
    } catch (error) {
      return errorResult(error, "Failed to resend code");
    }
  },

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await api.post("/auth/login", { email: normalizeEmail(email), password });
      const body = response.data as AuthPayload & { message?: string };
      if (!body.tokens || !body.user) return { success: false, error: "The login response did not include a session." };
      await saveSession(body.tokens, body.user);
      return toAuthResult(body, body.message);
    } catch (error) {
      const body = (error as { response?: { data?: AuthPayload & { error?: string; message?: string; details?: string[] } } })?.response?.data;
      if (body?.requiresVerification) {
        return {
          success: false, error: body.error, message: body.message, details: body.details,
          requiresVerification: true, email: body.email, phone: body.phone,
          emailVerified: body.emailVerified, phoneVerified: body.phoneVerified,
        };
      }
      return errorResult(error, "Login failed");
    }
  },

  async logout(logoutAll = false): Promise<ApiResult<never>> {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      const response = await api.post("/auth/logout", { refreshToken, logoutAll });
      await TokenManager.clearTokens();
      return { success: true, message: response.data?.message };
    } catch (error) {
      return errorResult(error, "Logout failed");
    }
  },

  async isLoggedIn() { return Boolean(await TokenManager.getAccessToken()); },

  async getCurrentUser(): Promise<UserDataInterface | null> {
    return TokenManager.getUserData<UserDataInterface>();
  },

  async forgotPassword(identifier: string, method: ResetMethod): Promise<ApiResult<never>> {
    try {
      const value = method === "email" ? normalizeEmail(identifier) : normalizePhone(identifier);
      const response = await api.post("/auth/forgot-password", { identifier: value, method });
      return { success: true, message: response.data?.message };
    } catch (error) {
      return errorResult(error, "Failed to send reset code");
    }
  },

  async resetPassword(identifier: string, resetCode: string, newPassword: string, method: ResetMethod): Promise<ApiResult<never>> {
    try {
      const value = method === "email" ? normalizeEmail(identifier) : normalizePhone(identifier);
      const response = await api.post("/auth/reset-password", { identifier: value, resetCode: resetCode.trim(), newPassword, method });
      return { success: true, message: response.data?.message };
    } catch (error) {
      return errorResult(error, "Failed to reset password");
    }
  },

  async uploadProfileImage(image: { data: string; mimeType: string }): Promise<ApiResult<{ url: string }>> {
    try {
      const response = await api.post("/user/profile/upload", { image });
      const url = response.data?.data?.url;
      if (typeof url !== "string") return { success: false, error: "The server did not return a profile image URL." };
      const user = await TokenManager.getUserData<UserDataInterface>();
      if (user) await TokenManager.saveUserData({ ...user, profileImage: url });
      return { success: true, data: { url }, message: response.data?.message };
    } catch (error) {
      return errorResult(error, "Failed to upload profile image");
    }
  },
};
