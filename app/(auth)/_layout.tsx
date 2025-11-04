import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
     const mainStyles = useStylesGlobal()

     return (
          <SafeAreaView style={[mainStyles.mainBackground]}>
               <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="signup" />
                    <Stack.Screen name="signin" />
                    <Stack.Screen name="forgot" />
                    <Stack.Screen name="verifycode" />
                    <Stack.Screen name="reset" />
                    <Stack.Screen name="waiting" />
                    <Stack.Screen name="verifyaccount" />
                    <Stack.Screen name="confirmation" />
               </Stack>
          </SafeAreaView>
     )
}