import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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

export default function IssueDetailsScreen() {
     const mainStyles = useStylesGlobal()

     const CurrentStatus = () => {
          return (
               <View style={[styles.currentStatus]}>
                    <View style={[styles.status]}></View>
                    <Text style={[mainStyles.normalText]}>Resolved</Text>
               </View>
          )
     }

     const IndividualIssue = (issue: any) => {
          return (
               <Pressable style={styles.issie}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800 }]}>{ issue.issue.title }</Text>
                         <Text style={[mainStyles.normalText]}>{ issue.issue.date }</Text>
                    </View>
               </Pressable>
          )
     }
     
     const IndividualHistory = (issue: any) => {
          return (
               <Pressable style={[styles.hist]}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800 }]}>{ issue.issue.title }</Text>
                         <Text style={[mainStyles.normalText]}>{ issue.issue.date }</Text>
                    </View>
               </Pressable>
          )
     }

     const Comments = () => {
          return (
               <View style={[styles.comments]}>
                    <Text style={[mainStyles.authTitles, styles.title]}>Comments Given By Authorities</Text>

                    <View>
                         {issuesDammy.resolved.map((issue) => (
                              <IndividualIssue issue={issue} />
                         ))}
                    </View>
               </View>
          )
     }
     
     const History = () => {
          return (
               <View style={[styles.history]}>
                    <Text style={[mainStyles.authTitles, styles.title2]}>Comments Given By Authorities</Text>

                    <View>
                         {issuesDammy.resolved.map((issue) => (
                              <IndividualHistory issue={issue} />
                         ))}
                    </View>
               </View>
          )
     }

     return (
          <ScrollView style={[mainStyles.pages, styles.container]}>
               <Text style={[mainStyles.authTitles]}>Issue type or title</Text>

               <Text style={[mainStyles.normalText, { marginVertical: 30 }]}>
                    This is the description of a certain issue that was submitted by a certain user who is supposed to be seeing it only because he is
                    the one who reported it. There can be long text given here...
               </Text>

               <CurrentStatus />

               <Comments />
               
               <History />

               <View style={{ paddingVertical: 20 }}></View>
          </ScrollView>
     )
}

const styles = StyleSheet.create({
     container: {
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
     },
     currentStatus: {
          borderRadius: 50,
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: MainColors["Light Gray"],
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
     },
     status: {
          height: 20,
          width: 20,
          borderRadius: 10,
          backgroundColor: MainColors['Error red']
     },
     comments: {
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 20,
          backgroundColor: MainColors["Almost Black"],
          marginVertical: 20,
     },
     history: {
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 20,
          backgroundColor: MainColors["Light Gray"],
          marginBottom: 10,
     },
     title: {
          color: MainColors["Main Background"],
          fontSize: 22,
          borderBottomWidth: 1,
          borderColor: MainColors["Main Background"],
          paddingBottom: 5,
     },
     title2: {
          color: MainColors["Almost Black"],
          fontSize: 22,
          borderBottomWidth: 1,
          borderColor: MainColors["Almost Black"],
          paddingBottom: 5,
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
     hist: {
          borderRadius: 20,
          backgroundColor: MainColors["Main Background"],
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
})