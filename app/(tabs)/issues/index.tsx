import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { formatDate, truncateText } from "@/services/apis/functions";
import { IssueService } from "@/services/apis/issueServices";
import { router, useFocusEffect, useRouter } from "expo-router";
import {  useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

const issuesDammy = {
     submitted: [
          { id: 1, title: 'This is a title', date: 'This is a date' },
          { id: 2, title: 'This is a title', date: 'This is a date' },
          { id: 3, title: 'This is a title', date: 'This is a date' },
     ],
     acknowledged: [
          { id: 1, title: 'This is a title', date: 'This is a date' },
          { id: 2, title: 'This is a title', date: 'This is a date' },
          { id: 3, title: 'This is a title', date: 'This is a date' },
     ],
     pending: [
          { id: 1, title: 'This is a title', date: 'This is a date' },
          { id: 2, title: 'This is a title', date: 'This is a date' },
          { id: 3, title: 'This is a title', date: 'This is a date' },     
     ],
     resolved: [
          { id: 1, title: 'This is a title', date: 'This is a date' },
          { id: 2, title: 'This is a title', date: 'This is a date' },
          { id: 3, title: 'This is a title', date: 'This is a date' },          
     ]
}

const tabs = ["Submitted", "Acknowledged", "Pending", "Resolved"];

export default function IssuesScreen() {
     const mainStyles = useStylesGlobal()
     const [activeTab, setActiveTab] = useState(tabs[0])
     const navigate = useRouter()

     const [submitted, setSubmitted] = useState<any[]>([]);
     const [acknowledged, setAcknowledged] = useState<any[]>([]);
     const [pending, setPending] = useState<any[]>([]);
     const [resolved, setResolved] = useState<any[]>([]);

     const fetchIssues = async () => {
          const fetchOne = async (status: "submitted" | "acknowledged" | "pending" | "resolved") => {
               const res = await IssueService.getMyIssues({ status, limit: 50 });
               return res.success ? (res.data?.data?.issues || []) : [];
          };
          const [s, a, p, r] = await Promise.all([
               fetchOne("submitted"),
               fetchOne("acknowledged"),
               fetchOne("pending"),
               fetchOne("resolved"),
          ]);
          setSubmitted(s);
          setAcknowledged(a);
          setPending(p);
          setResolved(r);
     };

     useFocusEffect(useCallback(() => { fetchIssues(); }, []));

     const handleChangeTab = (tab: string) => setActiveTab(tab);

     const TabSelection = () => {
          const counts: Record<string, number> = {
               Submitted: submitted.length,
               Acknowledged: acknowledged.length,
               Pending: pending.length,
               Resolved: resolved.length,
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

     const IndividualIssue = ({ item }: { item: any }) => {

          return (
               <Pressable style={styles.issie} onPress={() => navigate.push({ pathname: "/(tabs)/issues/details", params: { id: item._id } })}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800 }]}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}, {truncateText(item.description, 15)}</Text>
                         <Text style={[mainStyles.normalText]}>Submitted at: {formatDate(item.submittedAt)}</Text>
                    </View>
               </Pressable>
          )
     }

     const currentData =
          activeTab === "Submitted" ? submitted :
          activeTab === "Acknowledged" ? acknowledged :
          activeTab === "Pending" ? pending :
          resolved;

     return (
          <View style={[mainStyles.pages]}>
               <TabSelection />
               <Text style={[mainStyles.authTitles, { textAlign: "left", fontFamily: "EBGaramondBold", marginTop: 10 }]}>{activeTab} Issues</Text>
               <FlatList
                    data={currentData}
                    renderItem={({ item }) => <IndividualIssue item={item} />}
                    keyExtractor={(item: any) => item._id}
               />
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
     }
})