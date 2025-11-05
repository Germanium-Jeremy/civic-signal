import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Tabs } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"
import { MainColors } from "@/constants/theme";

export default function TabLayout() {
     const mainStyles = useStylesGlobal()

     return (
          <SafeAreaView style={[mainStyles.tabs]}>
               <Tabs screenOptions={{
                    tabBarStyle: styles.bottonNav,
                    tabBarShowLabel: false,
               }}>
                    <Tabs.Screen name="home" options={{
                         title: 'Home',
                         tabBarShowLabel: false,
                         headerShown: true,
                         tabBarIcon: ({ focused }) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30} color={focused ? MainColors["Accent Green"] : MainColors["Main Background"]} />,
                    }} />
                    <Tabs.Screen name="issue" options={{
                         title: 'Issues',
                         tabBarShowLabel: false,
                         headerShown: true,
                         tabBarIcon: ({ focused }) => <Ionicons name="document-sharp" size={30} />,
                    }} />
               </Tabs>
          </SafeAreaView>
     )
}

const styles = StyleSheet.create({
     bottonNav: {
          marginHorizontal: 20,
          borderRadius: 50,
          paddingHorizontal: 20,
          backgroundColor: MainColors["Almost Black"]
     }
})