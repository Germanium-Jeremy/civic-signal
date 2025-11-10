import api, { TokenManager } from "./config";

export const AuthService = {
     register: async (data: { fullName: string; email: string; phone: string; password: string }) => {
          try {
               const response = await api.post("/auth/register", data);
               return { success: true, data: response.data }
          } catch (error: any) {
               console.warn("error during register: ", error)
               return {
                    success: false,
                    error: error.response?.data?.error || error.message ||  'Registration failed',
                    details: error.response?.data?.details,
               }
          }
     },

     verifyEmail: async (email: string, code: string) => {
          try {
               const response = await api.post('/auth/verify-email', { email, code });
               
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
               console.warn("Failed to verify email: ", error)
               return { success: false, error: error.response?.data?.error || 'Verification failed' };
          }
     },

     verifyPhone: async (phone: string, code: string) => {
          try {
               const response = await api.post('/auth/verify-phone', { phone, code });
               
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
               console.warn("Failed to verify phone: ", error)
               return { success: false, error: error.response?.data?.error || 'Verification failed' };
          }
     },

     resendEmailCode: async (email: string) => {
          try {
               const response = await api.patch('/auth/verify-email', { email });
               return { success: true, data: response.data };
          } catch (error: any) {
               console.warn("Failed to resend Email code: ", error)
               return { success: false, error: error.response?.data?.error || 'Failed to resend code' };
          }
     },

     resendPhoneCode: async (phone: string) => {
          try {
               const response = await api.patch('/auth/verify-phone', { phone });
               return { success: true, data: response.data };
          } catch (error: any) {
               console.warn("Failed to resend phone code: ", error)
               return { success: false, error: error.response?.data?.error || 'Failed to resend code' };
          }
     },

     login: async (email: string, password: string) => {
          try {
               const response = await api.post('/auth/login', { email, password });
               
               await TokenManager.saveTokens(
                    response.data.tokens.accessToken,
                    response.data.tokens.refreshToken
               );
               await TokenManager.saveUserData(response.data.user);
               
               return { success: true, data: response.data };
          } catch (error: any) {
               console.warn("Failed to login: ", error)
               if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
                    return {
                         success: false,
                         requiresVerification: true,
                         error: 'Account not verified',
                    };
               }
               return { success: false, error: error.response?.data?.error || 'Login failed' };
          }
     },

     logout: async () => {
          await TokenManager.clearTokens();
          return { success: true };
     },

     isLoggedIn: async () => {
          const token = await TokenManager.getAccessToken();
          return !!token;
     },

     getCurrentUser: async () => {
          return await TokenManager.getUserData();
     },
}