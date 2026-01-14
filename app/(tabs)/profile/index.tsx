import { MainColors } from "@/constants/theme";
import { UserDataInterface } from "@/constants/UserInterface";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { IssueService } from "@/services/apis/issueServices";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";

interface UserStats {
     total: number;
     submitted: number;
     acknowledged: number;
     pending: number;
     resolved: number;
}

const tabs = [
     { key: 'submitted', label: 'Submitted' },
     { key: 'acknowledged', label: 'Acknowledged' },
     { key: 'pending', label: 'Pending' },
     { key: 'resolved', label: 'Resolved' }
];

export default function ProfileScreen() {
     const mainStyles = useStylesGlobal()
     const [UserData, setUserData] = useState<UserDataInterface | undefined>()
     const [userStats, setUserStats] = useState<UserStats | null>(null)
     const [loadingStats, setLoadingStats] = useState(false)
     const [loadingLogout, setLoadingLogout] = useState(false)
     const navigate = useRouter()
     
     useEffect(() => {
          const getUserData = async () => {
               const userData = await AuthService.getCurrentUser() as UserDataInterface
               setUserData(userData)
          }

          getUserData()
     }, [])

     useEffect(() => {
          const fetchUserStats = async () => {
               if (UserData) {
                    setLoadingStats(true)
                    try {
                         const statsResponse = await IssueService.getMyStats()
                         if (statsResponse.success && statsResponse.data) {
                              setUserStats({
                                   total: statsResponse.data.total,
                                   submitted: statsResponse.data.submitted,
                                   acknowledged: statsResponse.data.acknowledged ?? 0,
                                   pending: statsResponse.data.inProgress,
                                   resolved: statsResponse.data.resolved,
                              })
                         } else {
                              setUserStats(null)
                         }
                    } catch (error) {
                         console.error('Failed to fetch user stats:', error)
                    } finally {
                         setLoadingStats(false)
                    }
               }
          }

          fetchUserStats()
     }, [UserData])

     const handleLogout = async () => {
          Alert.alert(
               "Logout",
               "Choose logout option:",
               [
                    {
                         text: 'Logout All Devices',
                         onPress: async () => {
                              setLoadingLogout(true)
                              try {
                                   const result = await AuthService.logout(true)
                                   if (result.success || !result.success) { // Navigate even if API fails
                                        navigate.replace("/(auth)/signin")
                                   }
                              } catch (error) {
                                   console.error('Logout error:', error)
                                   navigate.replace("/(auth)/signin") // Still navigate on error
                              } finally {
                                   setLoadingLogout(false)
                              }
                         },
                         style: 'destructive'
                    },
                    {
                         text: 'Logout Current Device',
                         onPress: async () => {
                              setLoadingLogout(true)
                              try {
                                   const result = await AuthService.logout(false)
                                   if (result.success || !result.success) { // Navigate even if API fails
                                        navigate.replace("/(auth)/signin")
                                   }
                              } catch (error) {
                                   console.error('Logout error:', error)
                                   navigate.replace("/(auth)/signin") // Still navigate on error
                              } finally {
                                   setLoadingLogout(false)
                              }
                         },
                         style: 'default'
                    },
                    {
                         text: 'Cancel',
                         onPress: () => console.log('Logout cancelled'),
                         style: 'cancel'
                    }
               ]
          )
     }

     const TabSelection = () => {
          if (loadingStats) {
               return (
                    <View style={[styles.loadingContainer]}>
                         <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />
                         <Text style={[mainStyles.normalText, { color: MainColors["Neutral Gray"], marginLeft: 10 }]}>Loading stats...</Text>
                    </View>
               )
          }

          return (
               <FlatList 
                    showsHorizontalScrollIndicator={false} 
                    horizontal 
                    data={tabs} 
                    renderItem={(tab) => {
                         const count = userStats?.[tab.item.key as keyof UserStats] || 0
                         return (
                              <View style={[styles.tab]}>
                                   <Text style={[mainStyles.normalText, { color: MainColors["Almost Black"], fontWeight: 500 }]}>{ tab.item.label }</Text>
                                   <Text style={[mainStyles.normalText, { color: MainColors["Almost Black"], fontWeight: 500, fontSize: 30 }]}>{ count }</Text>
                              </View>
                         )
                    }} 
               />
          )
     }

     return (
          <View style={[mainStyles.pages, { gap: 30 }]}>
               <View style={[styles.profile]}>
                    {UserData?.profileImage ? (
                         <Image
                              source={{ uri: UserData.profileImage }}
                              resizeMode="cover"
                              style={[styles.profileImage]}
                         />
                    ) : (
                         <Image
                              source={require("@/assets/images/civicsignal.png")}
                              resizeMode="contain"
                              style={[styles.profileImage]}
                         />
                    )}
                    <Text style={[mainStyles.normalText, styles.name]}>{ UserData?.fullName }</Text>
                    <Text style={[mainStyles.normalText, styles.role]}>{ UserData?.role }</Text>
               </View>

               <TabSelection />

               <View style={[styles.options]}>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Check for Updates</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <Pressable
                         style={[styles.option, { borderBottomWidth: 1 }]}
                         onPress={() => navigate.push({ pathname: "/(tabs)/profile/edit" as any })}
                    >
                         <Text style={[mainStyles.normalText]}>Edit Profile</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </Pressable>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Terms and Conditions</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Privacy Policies</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <Pressable style={[styles.option]} onPress={handleLogout} disabled={loadingLogout}>
                         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              {loadingLogout ? (
                                   <ActivityIndicator size="small" color={MainColors["Error red"]} />
                              ) : (
                                   <Text style={[mainStyles.normalText, { color: MainColors["Error red"] }]}>Logout</Text>
                              )}
                         </View>
                         <Ionicons name="chevron-forward" size={20} color={MainColors["Error red"]} />
                    </Pressable>
               </View>
          </View>
     )
}

const styles = StyleSheet.create({
     profile: {
          justifyContent: 'center',
          alignItems: 'center',
     },
     profileImage: {
          width: 150,
          height: 150,
          borderRadius: 500,
     },
     name: {
          fontSize: 22,
          fontWeight: 500,
     },
     role: {
          color: MainColors["Neutral Gray"]
     },
     tab: {
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 20,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          backgroundColor: MainColors["Light Gray"],
          marginHorizontal: 5,
     },
     options: {
          borderRadius: 20,
          backgroundColor: MainColors["Light Gray"],
          paddingHorizontal: 20,
          paddingVertical: 10,
          gap: 10
     },
     option: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: MainColors["Almost Black"],
          paddingVertical: 5,
     },
     loadingContainer: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20,
     }
})