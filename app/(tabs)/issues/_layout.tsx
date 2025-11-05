import { Stack } from "expo-router";

export default function IssuesLayout() {
     return (
          <Stack screenOptions={{ headerShown: false, title: "Issues" }}>
               <Stack.Screen name="index" />
          </Stack>
     )
}