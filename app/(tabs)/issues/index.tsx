import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { router, useRouter } from "expo-router";
import { useState } from "react";
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

     const handleChangeTab = (tab: string) => {
          setActiveTab(tab)
     }

     const TabSelection = () => {
          return (
               <View style={[styles.tabs]}>
                    {tabs.map((tab) => (
                         <Pressable style={[styles.tab, { backgroundColor: activeTab == tab ? MainColors["Accent Green"] : MainColors["Almost Black"] }]}
                              onPress={() => handleChangeTab(tab)} key={tab}
                         >
                              <Text style={{ color: MainColors["Main Background"], fontWeight: 500 }}>{ tab }</Text>
                              <Text style={{ color: MainColors["Main Background"], fontWeight: 500, fontSize: 30 }}>0</Text>
                         </Pressable>
                    ))}
               </View>
          )
     }

     const IndividualIssue = (issue: any) => {

          return (
               <Pressable style={styles.issie} onPress={() => navigate.push("/(tabs)/issues/details")}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800 }]}>{ issue.issue.item.title }</Text>
                         <Text style={[mainStyles.normalText]}>{ issue.issue.item.date }</Text>
                    </View>
               </Pressable>
          )
     }
     
          const IssuesDisplay = () => {
               return (
                    <FlatList data={issuesDammy.pending} renderItem={(issue) => <IndividualIssue issue={issue} />} keyExtractor={(issie: any) => issie.id} />
               )
          }

     return (
          <View style={[mainStyles.pages]}>
               <TabSelection />
               <Text style={[mainStyles.authTitles, { textAlign: 'left', fontFamily: 'EBGaramondBold', marginTop: 10 }]}>{ activeTab } Issues</Text>
               <IssuesDisplay />
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