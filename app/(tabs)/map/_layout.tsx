import { Stack } from "expo-router";

export default function MapLayout() {
     return (
          <Stack screenOptions={{ headerShown: false, title: "Map" }}>
               <Stack.Screen name="index" />
          </Stack>
     )
}