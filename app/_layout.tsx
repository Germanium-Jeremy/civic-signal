import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font'
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import api, { API_BASE_URL } from '@/services/apis/config';
import { AuthService } from "@/services/apis/authServices";

export const unstable_settings = {
  anchor: '(tabs)',
};


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [expoToken, setExpoToken] = useState("");

  async function registerPushToken() {
    if (!Device.isDevice) {
      Alert.alert("Must use physical device for notifications");
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied");
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Prefer authenticated registration
    const user = await AuthService.getCurrentUser();
    try {
      if (user) {
        await api.post("/register-token", { token }); // Authorization added by interceptor
        console.log("Notification token registered for authenticated user");
      } else if (user?.email) {
        await fetch(`${API_BASE_URL}/register-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email: user.email }),
        });
        console.log("Notification token registered for unauthenticated user");
      }
    } catch (e) {
      console.log("Failed to register push token:", e);
    }
  }

  // useEffect(() => {
  //   registerPushToken();
  // }, []);
  
  const [fontsLoaded] = useFonts({
    'EBGaramond': require('../assets/fonts/EB_Garamond/EBGaramond-VariableFont_wght.ttf'),
    'EBGaramondBold': require('../assets/fonts/EB_Garamond/static/EBGaramond-Bold.ttf'),
  })

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(notifications)" options={{ headerShown: false }} />
        <StatusBar style="auto"  />
      </Stack>
    </SafeAreaView>
  );
}
