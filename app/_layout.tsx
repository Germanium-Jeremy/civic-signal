import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    EBGaramond: require("../assets/fonts/EB_Garamond/EBGaramond-VariableFont_wght.ttf"),
    EBGaramondBold: require("../assets/fonts/EB_Garamond/static/EBGaramond-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(notifications)" options={{ headerShown: false }} />
        <StatusBar style="auto" />
      </Stack>
    </SafeAreaView>
  );
}
