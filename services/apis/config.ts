import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const API_BASE_URL = "http://169.254.224.202:3000/api";
// export const API_BASE_URL = "https://civic-signal.vercel.app/api";

const api = axios.create({
     baseURL: API_BASE_URL,
     timeout: 50000,
     headers: { 'Content-Type': 'application/json' }
})

export const TokenManager = {
     saveTokens: async (accessToken: string, refreshToken: string) => {
          await AsyncStorage.multiSet([
               ['@access_token', accessToken],
               ['@refresh_token', refreshToken],
          ])
     },

     getAccessToken: () => AsyncStorage.getItem("@access_token"),
     getRefreshToken: () => AsyncStorage.getItem("@refresh_token"),

     clearTokens: async () => {
          await AsyncStorage.multiRemove([
               '@access_token', '@refresh_token', '@user_data'
          ])
     },

     saveUserData: (data: any) => AsyncStorage.setItem('@user_data', JSON.stringify(data)),
     getUserData: async () => {
          const data = await AsyncStorage.getItem("@user_data");
          return data ? JSON.parse(data) : null
     },
}

api.interceptors.request.use(async (config) => {
     const token = await TokenManager.getAccessToken()
     if (token) config.headers.Authorization = `Bearer ${token}`
     return config
})

export default api