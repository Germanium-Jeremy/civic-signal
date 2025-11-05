import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Tabs } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
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
                    header: (prop) => {
                         return (
                              <View style={[styles.header]}>
                                   <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={[styles.profileIcon]} />

                                   <Text style={[styles.route]}> {prop.route.name} </Text>
                                   
                                   <View style={[styles.bellContainer]}>
                                        <Ionicons name="notifications" size={30} color={MainColors["Almost Black"]} />
                                        <View style={[styles.identifier]}></View>
                                   </View>
                              </View>
                         )
                    }
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
     },
     header: {
          backgroundColor: MainColors["Main Background"],
          paddingVertical: 5,
          paddingHorizontal: 30,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: .5,
          borderColor: MainColors["Neutral Gray"]
     },
     profileIcon: {
          width: 50,
          height: 50,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: MainColors["Accent Green"],
     },
     route: {
          fontWeight: 500,
          fontFamily: 'EBGaramond',
          fontSize: 16,
          fontVariant: ['small-caps'],
     },
     bellContainer: {
          width: 45,
          height: 45,
          borderRadius: 100,
          borderWidth: .5,
          borderColor: MainColors["Neutral Gray"],
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
     },
     identifier: {
          position: 'absolute',
          width: 15,
          height: 15,
          backgroundColor: MainColors["Error red"],
          borderRadius: 20,
          top: 0,
          right: 0,
     }
})