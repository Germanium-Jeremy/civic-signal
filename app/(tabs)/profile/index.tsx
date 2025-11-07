import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

const tabs = ["Submitted", "Acknowledged", "Pending", "Resolved"];

export default function ProfileScreen() {
     const mainStyles = useStylesGlobal()

          const TabSelection = () => {
               return (
                    <FlatList showsHorizontalScrollIndicator={false} horizontal data={tabs} renderItem={(tab) => (
                         <View style={[styles.tab]}>
                              <Text style={{ color: MainColors["Almost Black"], fontWeight: 500 }}>{ tab.item }</Text>
                              <Text style={{ color: MainColors["Almost Black"], fontWeight: 500, fontSize: 30 }}>0</Text>
                         </View>
                    )} />
               )
          }

     return (
          <View style={[mainStyles.pages, { gap: 30 }]}>
               <View style={[styles.profile]}>
                    <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={[styles.profileImage]} />
                    <Text style={[mainStyles.normalText, styles.name]}>Mugisha David</Text>
                    <Text style={[mainStyles.normalText, styles.role]}>Citizen</Text>
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
                    <View style={[styles.option]}>
                         <Text style={[mainStyles.normalText]}>Logout</Text>
                         <Ionicons name="chevron-forward" size={20} />
                    </View>
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