import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { formatDate, truncateText } from "@/services/apis/functions";
import { IssueService } from "@/services/apis/issueServices";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Issue, IssueStats } from "@/services/apis/types";
import { useUser } from "../_layout";

export default function HomeScreen() {
     const mainStyles = useStylesGlobal()
     const navigate = useRouter()
     const { user } = useUser();
     const [stats, setStats] = useState<IssueStats>({ total: 0, submitted: 0, acknowledged: 0, resolved: 0, inProgress: 0 })
     const [recentIssues, setRecentIssues] = useState<Issue[]>([])
     const [error, setError] = useState<string | null>(null)
     const [loading, setLoading] = useState(true)

     const fetchData = async () => {
          setLoading(true)
          setError(null)
          try {
               const statsResult = await IssueService.getMyStats();
               if (statsResult.success && statsResult.data) setStats(statsResult.data);

               const issuesResult = await IssueService.getMyIssues({ limit: 3 });
               if (issuesResult.success && issuesResult.data) setRecentIssues(issuesResult.data.issues);
               else setError(issuesResult.error || "Unable to load recent issues.");
          } catch {
               setError("Unable to load your issue data.");
          } finally {
               setLoading(false);
          }
     };

     // Fetch data when screen comes into focus
     useFocusEffect(
          useCallback(() => {
               fetchData();
          }, [])
     );

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
                    <Text style={[mainStyles.authTitles, { paddingBottom: 20, fontSize: 20 }]}>You haven&apos;t submitted any issue yet.</Text>

                    <View style={[styles.placeholder]}>
                         <Image source={require('@/assets/images/nothing.png')} resizeMode="contain" style={{ height: 120 }} />
                         <Pressable style={styles.add} onPress={() => navigate.push("/(tabs)/report")}>
                              <Ionicons name="add" style={[styles.addIcon]} />
                         </Pressable>
                    </View>
               </View>
          )
     }

     const IndividualIssue = ({ item }: { item: Issue }) => {
          const getStatusColor = (status: Issue["status"]) => {
               switch (status) {
                    case "submitted": return MainColors["Error red"];
                    case "acknowledged": return MainColors["Warning Yellow"];
                    case "pending": return "#FFD700";
                    case "resolved": return "#32CD32";
                    default: return "#000000";
               }
          };

          return (
               <Pressable style={styles.issie} onPress={() => navigate.push({ pathname: "/(tabs)/issues/details", params: { id: item._id } })}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800, textAlign: 'left' }]}>{item.category.charAt(0).toUpperCase() + item.category.slice(1).replace("_", " ")}, {truncateText(item.description || "", 15)}</Text>
                         <Text style={[mainStyles.normalText]}>Submitted at: {item.submittedAt ? formatDate(item.submittedAt) : "Unknown"}</Text>
                    </View>
               </Pressable>
          );
     };

     const IssuesDisplay = () => {
          if (recentIssues.length === 0) return <NoIssuesYet />
          return (
               <FlatList
                    data={recentIssues}
                    renderItem={({ item }) => <IndividualIssue item={item} />}
                    keyExtractor={(item) => item._id}
               />
          );
     };

     return (
          loading ? <ActivityIndicator size="large" color={MainColors["Almost Black"]} /> : (
               <View style={[mainStyles.pages]}>
                    <Text style={[mainStyles.authTitles, { textAlign: 'left', fontFamily: 'EBGaramondBold', marginBottom: 5 }]}>Welcome {user?.fullName?.split(" ")[0] || ""}</Text>
                    
                    <Statistics />
                    
                    <Text style={[mainStyles.authTitles, { textAlign: 'left', fontFamily: 'EBGaramondBold', marginTop: 10 }]}>Previous Issues</Text>

                    {error && <Text style={[mainStyles.normalText, { color: MainColors["Error red"] }]}>{error}</Text>}
                    {recentIssues.length > 0 ? <IssuesDisplay /> : <NoIssuesYet />}
               </View>
          )
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
          width: 18,
          height: 18,
          borderRadius: 20,
     },
})
