import { MainColors } from "@/constants/theme";
import { UserDataInterface } from "@/constants/UserInterface";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { IssueService } from "@/services/apis/issueServices";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const issuesDammy = [
     { id: 1, title: 'This is a title', date: 'This is a date' },
     { id: 2, title: 'This is a title', date: 'This is a date' },
     { id: 3, title: 'This is a title', date: 'This is a date' },
]

export default function HomeScreen() {
     const mainStyles = useStylesGlobal()
     const navigate = useRouter()
     const [UserData, setUserData] = useState<UserDataInterface | undefined>()
     const [stats, setStats] = useState({ total: 0, submitted: 0, resolved: 0, inProgress: 0 })
     const [resentIssue, setRecentIssue] = useState<any[]>([])
     const [loading, setLoading] = useState(true)
     const [refreshing, setRefreshing] = useState(false)

     const fetchData = async () => {
          try {
               // Get user data
               const user = await AuthService.getCurrentUser() as UserDataInterface;
               setUserData(user);

               // Get statistics
               const statsResult = await IssueService.getMyStats();
               if (statsResult.success) {
                    if (statsResult.data) {
                         setStats(statsResult.data);
                    }
               }

               // Get recent issues (limit to 5 for home screen)
               const issuesResult = await IssueService.getMyIssues({ limit: 5 });
               if (issuesResult.success) {
                    setRecentIssue(issuesResult.data.data.issues);
               }
          } catch (error) {
               console.error('Error fetching data:', error);
          } finally {
               setLoading(false);
               setRefreshing(false);
          }
     };

     // Fetch data when screen comes into focus
     useFocusEffect(
          useCallback(() => {
               fetchData();
          }, [])
     );

     const onRefresh = () => {
          setRefreshing(true);
          fetchData();
     };

     const Statistics = () => {
          return (
               <View style={[styles.statistics]}>
                    <View>
                         <Text style={[styles.statisticsText]}>Submitted Issues</Text>
                         <Text style={[styles.statisticsText, { fontSize: 140, marginTop: -30 }]}>{ stats.total }</Text>
                    </View>

                    <View>
                         <View>
                              <Text style={[styles.statisticsText]}>Resolved Issues</Text>
                              <Text style={[styles.statisticsText, { fontSize: 50 }]}>{ stats.resolved }</Text>
                         </View>
                         <View>
                              <Text style={[styles.statisticsText]}>Pending Issues</Text>
                              <Text style={[styles.statisticsText, { fontSize: 50 }]}>{ stats.inProgress }</Text>
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
                         <Pressable style={styles.add} onPress={() => navigate.push("/(tabs)/report")}>
                              <Ionicons name="add" style={[styles.addIcon]} />
                         </Pressable>
                    </View>
               </View>
          )
     }

     const IndividualIssue = (issue: any) => {
          const getStatusColor = (status: string) => {
               switch (status) {
                    case 'submitted': return '#FFE2E2';
                    case 'acknowledged': return '#4169E1';
                    case 'in_progress': return '#FFD700';
                    case 'resolved': return '#32CD32';
                    case 'closed': return '#808080';
                    default: return '#000000';
               }
          };
          
          return (
               <Pressable style={styles.issie} onPress={() => navigate.push({ pathname: '/(tabs)/issues/details', params: { issueId: issue._id } })}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(issue.status) }]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800 }]}>{ issue.title }</Text>
                         <Text style={[mainStyles.normalText]}>{ issue.issue.item.date }</Text>
                    </View>
               </Pressable>
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

               <NoIssuesYet />
               {/* <IssuesDisplay /> */}
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
     statusDot: {
          width: 12,
          height: 12,
          borderRadius: 6,
     },
})