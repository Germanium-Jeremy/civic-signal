import { MainColors } from "@/constants/theme";
import { UserDataInterface } from "@/constants/UserInterface";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, View } from "react-native";

const issuesDammy = [
     { id: 1, title: 'This is a title', date: 'This is a date' },
     { id: 2, title: 'This is a title', date: 'This is a date' },
     { id: 3, title: 'This is a title', date: 'This is a date' },
]

export default function HomeScreen() {
     const mainStyles = useStylesGlobal()
     const [UserData, setUserData] = useState<UserDataInterface | undefined>()

     useEffect(() => {
          const getUserData = async () => {
               const userData = await AuthService.getCurrentUser() as UserDataInterface
               setUserData(userData)
          }

          getUserData()
     }, [])

     const Statistics = () => {
          return (
               <View style={[styles.statistics]}>
                    <View>
                         <Text style={[styles.statisticsText]}>Submitted Issues</Text>
                         <Text style={[styles.statisticsText, { fontSize: 140, marginTop: -30 }]}>0</Text>
                    </View>

                    <View>
                         <View>
                              <Text style={[styles.statisticsText]}>Resolved Issues</Text>
                              <Text style={[styles.statisticsText, { fontSize: 50 }]}>0</Text>
                         </View>
                         <View>
                              <Text style={[styles.statisticsText]}>Pending Issues</Text>
                              <Text style={[styles.statisticsText, { fontSize: 50 }]}>0</Text>
                         </View>
                    </View>
               </View>
          )
     }

     const NoIssuesYet = () => {
          return (
               <View style={[styles.noIssue]}>
                    <Text style={[mainStyles.authTitles, { paddingBottom: 20, fontSize: 20 }]}>You haven't submitted any issue yet.</Text>

                    <View style={[styles.placeholder]}>
                         <Image source={require('@/assets/images/nothing.png')} resizeMode="contain" style={{ height: 120 }} />
                         <View style={styles.add}>
                              <Ionicons name="add" style={[styles.addIcon]} />
                         </View>
                    </View>
               </View>
          )
     }

     const IndividualIssue = (issue: any) => {
          
          return (
               <View style={styles.issie}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800 }]}>{ issue.issue.item.title }</Text>
                         <Text style={[mainStyles.normalText]}>{ issue.issue.item.date }</Text>
                    </View>
               </View>
          )
     }

     const IssuesDisplay = () => {
          return (
               <FlatList data={issuesDammy} renderItem={(issue) => <IndividualIssue issue={issue} />} keyExtractor={(issie: any) => issie.id} />
          )
     }

     return (
          <View style={[mainStyles.pages]}>
               <Text style={[mainStyles.authTitles, { textAlign: 'left', fontFamily: 'EBGaramondBold', marginBottom: 5 }]}>Welcome {UserData?.fullName.split(" ")[1]}</Text>
               
               <Statistics />
               
               <Text style={[mainStyles.authTitles, { textAlign: 'left', fontFamily: 'EBGaramondBold', marginTop: 10 }]}>Previous Issues</Text>

               {/* <NoIssuesYet /> */}
               <IssuesDisplay />
          </View>
     )
}

const styles = StyleSheet.create({
     statistics: {
          backgroundColor: MainColors["Almost Black"],
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 20,
          flexDirection: 'row',
          gap: 20,
          justifyContent: 'space-around',
     },
     statisticsText: {
          color: MainColors["Main Background"],
          textAlign: 'center',
          fontFamily: 'EBGaramondBold',
          fontSize: 18
     },
     individualStats: {
          textAlign: 'center',
     },
     noIssue: {
          backgroundColor: MainColors["Light Gray"],
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          maxHeight: 300
          // height: '100%',
     },
     placeholder: {
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          gap: 10,
     },
     add: {
          backgroundColor: MainColors["Almost Black"],
          width: '40%',
          height: '80%',
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
     },
     addIcon: {
          color: MainColors["Almost Black"],
          backgroundColor: MainColors["Main Background"],
          fontSize: 70,
          borderRadius: 150,
     },
     issie: {
          borderRadius: 20,
          backgroundColor: MainColors["Light Gray"],
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
          paddingVertical: 5,
          paddingHorizontal: 10,
          marginVertical: 5
     },
     issueIcon: {
          width: 40,
          height: 40,
          borderRadius: 50,
     }
})