import { Stack } from "expo-router";

export default function ProfileLayout() {
     return (
          <Stack screenOptions={{ headerShown: false, title: "Profile" }}>
               <Stack.Screen name="index" />
               <Stack.Screen name="edit" />
          </Stack>
     )
}