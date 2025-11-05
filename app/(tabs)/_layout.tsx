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
                    headerShown: true,
                    
               }}>
                    <Tabs.Screen name="home" options={{
                         title: 'Home',
                         tabBarIcon: ({ focused }) => <Ionicons name={focused ? "home-sharp" : "home-outline"}
                              size={focused ? 30 : 25}
                              color={focused ? MainColors["Accent Green"] : MainColors["Main Background"]}
                         />,
                    }} />
                    <Tabs.Screen name="issues" options={{
                         title: 'Issues',
                         tabBarIcon: ({ focused }) => <Ionicons name={focused ? "document-sharp" : "document-outline"}
                              size={focused ? 30 : 25}
                              color={focused ? MainColors["Accent Green"] : MainColors["Main Background"]}
                         />,
                    }} />
                    <Tabs.Screen name="report" options={{
                         title: 'Report',
                         tabBarIcon: ({ focused }) => <Ionicons name="add"
                              color={focused ? MainColors["Main Background"] : MainColors["Almost Black"]}
                              style={[styles.report, { backgroundColor: focused ? MainColors["Accent Green"] : MainColors["Main Background"] }]}
                         />,
                    }} />
                    <Tabs.Screen name="map" options={{
                         title: 'Map',
                         tabBarIcon: ({ focused }) => <Ionicons name={focused ? "map-sharp" : "map-outline"}
                              color={focused ? MainColors["Accent Green"] : MainColors["Main Background"]}
                              size={focused ? 30 : 25}
                         />,
                    }} />
                    <Tabs.Screen name="profile" options={{
                         title: 'Profile',
                         tabBarIcon: ({ focused }) => <Ionicons name={focused ? "person-sharp" : "person-outline"}
                              color={focused ? MainColors["Accent Green"] : MainColors["Main Background"]}
                              size={focused ? 30 : 25}
                         />,
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
          backgroundColor: MainColors["Almost Black"],
          paddingTop: 5,
     },
     report: {
          borderRadius: 50,
          width: 47,
          height: 47,
          textAlign: 'center',
          verticalAlign: 'middle',
          fontSize: 40,
          fontWeight: 'bold',
     }
})