import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { formatDate } from "@/services/apis/functions";
import { IssueService } from "@/services/apis/issueServices";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Issue, IssueStatus } from "@/services/apis/types";

const tabs = ["Submitted", "Acknowledged", "Pending", "Resolved"];

export default function IssuesScreen() {
     const mainStyles = useStylesGlobal()
     const [activeTab, setActiveTab] = useState(tabs[0])
     const navigate = useRouter()

     const [issues, setIssues] = useState<Record<string, Issue[]>>({
          Submitted: [],
          Acknowledged: [],
          Pending: [],
          Resolved: []
     });
     const [pages, setPages] = useState<Record<string, number>>({
          Submitted: 1,
          Acknowledged: 1,
          Pending: 1,
          Resolved: 1
     });
     const [hasMore, setHasMore] = useState<Record<string, boolean>>({
          Submitted: true,
          Acknowledged: true,
          Pending: true,
          Resolved: true
     });
     const [loadingMore, setLoadingMore] = useState(false);
     const [loadingInitial, setLoadingInitial] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const fetchIssues = async (tabName: string, page: number = 1, isLoadMore: boolean = false) => {
          const statusMap: Record<string, IssueStatus> = {
               Submitted: "submitted",
               Acknowledged: "acknowledged",
               Pending: "pending",
               Resolved: "resolved"
          };
          
          const status = statusMap[tabName];
          const res = await IssueService.getMyIssues({ status, page, limit: 10 });
          
          if (res.success && res.data) {
               const pageData = res.data;
               const newIssues = pageData.issues;
               setIssues(prev => ({
                    ...prev,
                    [tabName]: isLoadMore ? [...prev[tabName], ...newIssues] : newIssues
               }));
               setHasMore(prev => ({
                    ...prev,
                    [tabName]: pageData.pagination.page < pageData.pagination.totalPages
               }));
               setPages(prev => ({ ...prev, [tabName]: pageData.pagination.page }));
               return true;
          }
          setError(res.error || "Unable to load issues.");
          return false;
     };

     useFocusEffect(useCallback(() => {
          const loadIssues = async () => {
               setLoadingInitial(true);
               setError(null);
               await fetchIssues(activeTab, 1, false);
               setLoadingInitial(false);
          };
          void loadIssues();
     }, [activeTab]));

     const handleLoadMore = async () => {
          if (loadingMore || !hasMore[activeTab]) return;
          
          setLoadingMore(true);
          const nextPage = pages[activeTab] + 1;
          await fetchIssues(activeTab, nextPage, true);
          setLoadingMore(false);
     };

     const handleChangeTab = (tab: string) => setActiveTab(tab);

     const TabSelection = () => {
          const counts: Record<string, number> = {
               Submitted: issues.Submitted.length,
               Acknowledged: issues.Acknowledged.length,
               Pending: issues.Pending.length,
               Resolved: issues.Resolved.length,
          };
          return (
               <View style={[styles.tabs]}>
                    {tabs.map((tab) => (
                         <Pressable key={tab} style={[styles.tab, { backgroundColor: activeTab === tab ? MainColors["Accent Green"] : MainColors["Almost Black"] }]}
                         onPress={() => handleChangeTab(tab)}>
                              <Text style={{ color: MainColors["Main Background"], fontWeight: "500" }}>{tab}</Text>
                              <Text style={{ color: MainColors["Main Background"], fontWeight: "500", fontSize: 20 }}>{counts[tab] ?? 0}</Text>
                         </Pressable>
                    ))}
               </View>
          );
     }

     const IndividualIssue = ({ item }: { item: Issue }) => {
          return (
               <Pressable style={styles.issie} onPress={() => navigate.push({ pathname: "/(tabs)/issues/details", params: { id: item._id } })}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View style={{ flex: 1 }}>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: '800' }]}>
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                         </Text>
                         <Text style={[mainStyles.normalText, { color: '#666' }]} numberOfLines={1}>
                              {item.description || 'No description'}
                         </Text>
                         <Text style={[mainStyles.normalText, { fontSize: 12, marginTop: 4 }]}>
                              Submitted at: {item.submittedAt ? formatDate(item.submittedAt) : "Unknown"}
                         </Text>
                    </View>
               </Pressable>
          )
     }

     const currentData = issues[activeTab];

     return (
          <View style={[mainStyles.pages]}>
               <TabSelection />
               <Text style={[mainStyles.authTitles, { textAlign: "left", fontFamily: "EBGaramondBold", marginTop: 20, marginBottom: 10 }]}>{activeTab} Issues</Text>
               {loadingInitial && <ActivityIndicator color={MainColors["Primary Blue"]} />}
               {error && <Text style={{ color: MainColors["Error red"] }}>{error}</Text>}
               {currentData.length <= 0 ? (
                    <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                         <Text style={{ fontSize: 18, textAlign: 'center', color: '#999' }}>There are no issues yet!</Text>
                    </View>
               ) : (
                    <FlatList
                         data={currentData}
                         renderItem={({ item }) => <IndividualIssue item={item} />}
                         keyExtractor={(item) => item._id}
                         contentContainerStyle={{ paddingBottom: 20 }}
                         ListFooterComponent={() => (
                              hasMore[activeTab] ? (
                                   <Pressable 
                                        style={styles.loadMoreButton} 
                                        onPress={handleLoadMore}
                                        disabled={loadingMore}
                                   >
                                        <Text style={styles.loadMoreText}>
                                             {loadingMore ? "Loading..." : "Load More"}
                                        </Text>
                                   </Pressable>
                              ) : null
                         )}
                    />
               )}
          </View>
     )
}

const styles = StyleSheet.create({
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
     },
     tabs: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 5,
     },
     tab: {
          borderRadius: 20,
          paddingVertical: 10,
          paddingHorizontal: 10,
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: 'auto'
     },
     loadMoreButton: {
          backgroundColor: MainColors["Almost Black"],
          borderRadius: 15,
          paddingVertical: 12,
          marginVertical: 20,
          alignItems: 'center',
     },
     loadMoreText: {
          color: MainColors["Main Background"],
          fontWeight: '600',
          fontSize: 14,
     }
})
