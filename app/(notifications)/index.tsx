import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const notifications = [
     { id: 1, title: 'Title ', date: "This is a date object" },
     { id: 2, title: 'Title ', date: "This is a date object" },
     { id: 3, title: 'Title ', date: "This is a date object" },
     { id: 4, title: 'Title ', date: "This is a date object" },
     { id: 5, title: 'Title ', date: "This is a date object" },
]

export default function NotificationScreen() {
     const mainStyles = useStylesGlobal()

     const handlePress = (title: string, desc: string) => {
          Alert.alert(title, desc)
     }

     const IndividualIssue = (issue: any) => {
     
          return (
               <Pressable style={styles.issie} onPress={() => handlePress(issue.issue.item.title, issue.issue.item.date)}>
                    <Image source={require("@/assets/images/civic-signal.png")} resizeMode="contain" style={[styles.issueIcon]} />

                    <View>
                         <Text style={[mainStyles.authTitles, { fontSize: 18, fontWeight: 800, textAlign: 'left' }]}>{ issue.issue.item.title }</Text>
                         <Text style={[mainStyles.normalText]}>{ issue.issue.item.date }</Text>
                    </View>
               </Pressable>
          )
     }

     return (
          <SafeAreaView style={[mainStyles.pages]}>
               <FlatList data={notifications} renderItem={(issue) => <IndividualIssue issue={issue} />} />
          </SafeAreaView>
     )
}

const styles = StyleSheet.create({
     issueIcon: {
          width: 40,
          height: 40,
          borderRadius: 50,
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
})