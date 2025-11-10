import { MainColors } from "@/constants/theme";
import { UserDataInterface } from "@/constants/UserInterface";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

const tabs = ["Submitted", "Acknowledged", "Pending", "Resolved"];

export default function ProfileScreen() {
     const mainStyles = useStylesGlobal()
     const [UserData, setUserData] = useState<UserDataInterface | undefined>()
     const navigate = useRouter()
     
     useEffect(() => {
          const getUserData = async () => {
               const userData = await AuthService.getCurrentUser() as UserDataInterface
               setUserData(userData)
          }

          getUserData()
     }, [])

     const handleLogout = async () => {
          Alert.alert("Warning?",
               "Are you sure you want to log out?",
               [{
                    text: 'Ok',
                    onPress: async () => {
                         const result = await AuthService.logout();
                         if (result.success) navigate.replace("/(auth)/signin")
                    },
               }, {
                    text: 'Cancel',
                    onPress: () => {
                         console.log("canceled")
                    }
               }]
          )
     }

     const TabSelection = () => {
          return (
               <FlatList showsHorizontalScrollIndicator={false} horizontal data={tabs} renderItem={(tab) => (
                    <View style={[styles.tab]}>
                         <Text style={[mainStyles.normalText, { color: MainColors["Almost Black"], fontWeight: 500 }]}>{ tab.item }</Text>
                         <Text style={[mainStyles.normalText, { color: MainColors["Almost Black"], fontWeight: 500, fontSize: 30 }]}>0</Text>
                    </View>
               )} />
          )
     }

     return (
          <View style={[mainStyles.pages, { gap: 30 }]}>
               <View style={[styles.profile]}>
                    <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={[styles.profileImage]} />
                    <Text style={[mainStyles.normalText, styles.name]}>{ UserData?.fullName }</Text>
                    <Text style={[mainStyles.normalText, styles.role]}>{ UserData?.role }</Text>
               </View>

               <TabSelection />

               <View style={[styles.options]}>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Check for Updates</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Contact Us</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Terms and Conditions</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <View style={[styles.option, { borderBottomWidth: 1 }]}>
                         <Text style={[mainStyles.normalText]}>Privacy Policies</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
                    <Pressable style={[styles.option]} onPress={handleLogout}>
                         <Text style={[mainStyles.normalText]}>Logout</Text>
                         <Ionicons name="chevron-forward" size={20} />
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
     }
})