import { Stack } from "expo-router";

export default function ReportLayout() {
     return (
          <Stack screenOptions={{ headerShown: false, title: "Report" }}>
               <Stack.Screen name="index" />
          </Stack>
     )
}