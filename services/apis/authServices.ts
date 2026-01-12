import api, { TokenManager } from "./config";

export const AuthService = {
  register: async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      const response = await api.post("/auth/register", data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("error during register: ", error);
      return {
        success: false,
        error:
          error.response?.data?.error || error.message || "Registration failed",
        details: error.response?.data?.details,
      };
    }
  },

  verifyEmail: async (email: string, code: string) => {
    try {
      const response = await api.post("/auth/verify-email", { email, code });

      // Save tokens if both verifications complete
      if (response.data.tokens) {
        await TokenManager.saveTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        await TokenManager.saveUserData(response.data.user);
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("Failed to verify email: ", error);
      return {
        success: false,
        error: error.response?.data?.error || "Verification failed",
      };
    }
  },

  verifyPhone: async (phone: string, code: string) => {
    try {
      const response = await api.post("/auth/verify-phone", { phone, code });

      // Save tokens if both verifications complete
      if (response.data.tokens) {
        await TokenManager.saveTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        await TokenManager.saveUserData(response.data.user);
      }

      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("Failed to verify phone: ", error);
      return {
        success: false,
        error: error.response?.data?.error || "Verification failed",
      };
    }
  },

  resendEmailCode: async (email: string) => {
    try {
      const response = await api.patch("/auth/verify-email", { email });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("Failed to resend Email code: ", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to resend code",
      };
    }
  },

  resendPhoneCode: async (phone: string) => {
    try {
      const response = await api.patch("/auth/verify-phone", { phone });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("Failed to resend phone code: ", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to resend code",
      };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      await TokenManager.saveTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      await TokenManager.saveUserData(response.data.user);

      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("Failed to login: ", error);
      if (
        error.response?.status === 403 &&
        error.response?.data?.requiresVerification
      ) {
        return {
          success: false,
          requiresVerification: true,
          emailVerified: error.response.data.emailVerified,
          phoneVerified: error.response.data.phoneVerified,
          email: error.response.data.email,
          phone: error.response.data.phone,
          message: error.response.data.message,
          codesSent: error.response.data.codesSent,
          error: "Account not verified",
        };
      }
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  logout: async (logoutAll: boolean = false) => {
    try {
      const refreshToken = await TokenManager.getRefreshToken();
      const response = await api.post("/auth/logout", {
        refreshToken,
        logoutAll,
      });

      // Clear local tokens
      await TokenManager.clearTokens();
      return { success: true, data: response.data };
    } catch (error: any) {
      console.warn("Failed to logout:", error);
      // Still clear local tokens even if API call fails
      await TokenManager.clearTokens();
      return {
        success: false,
        error: error.response?.data?.error || "Logout failed",
      };
    }
  },

  isLoggedIn: async () => {
    const token = await TokenManager.getAccessToken();
    return !!token;
  },

  getCurrentUser: async () => {
    return await TokenManager.getUserData();
  },

  forgotPassword: async (identifier: string, method: "email" | "phone") => {
    try {
      const response = await api.post("/auth/forgot-password", {
        identifier,
        method,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.warn("Forgot password error: ", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to send reset code",
      };
    }
  },

  resetPassword: async (
    identifier: string,
    resetCode: string,
    newPassword: string,
    method: "email" | "phone"
  ) => {
    try {
      const response = await api.post("/auth/reset-password", {
        identifier,
        resetCode,
        newPassword,
        method,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.warn("Reset password error: ", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to reset password",
      };
    }
  },
};
