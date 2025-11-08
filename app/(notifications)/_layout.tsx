import { MainColors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function NotificationLayout() {
     return (
          <Stack screenOptions={{
               header: (props) => {
                    return (
                         <View style={[styles.header]}>
                              <Ionicons name="chevron-back" size={20} color={MainColors["Almost Black"]} onPress={() => props.navigation.goBack()} />

                              <Text style={[styles.route]}> Notifications </Text>
                              
                              <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={[styles.profileIcon]} />
                         </View>
                    )
               }
          }}>
               <Stack.Screen name="index" />
          </Stack>
     )
}

const styles = StyleSheet.create({
     header: {
          backgroundColor: MainColors["Main Background"],
          paddingVertical: 5,
          paddingHorizontal: 30,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: .5,
          borderColor: MainColors["Neutral Gray"]
     },
     profileIcon: {
          width: 50,
          height: 50,
          borderRadius: 100,
          resizeMode: 'contain',
     },
     route: {
          fontWeight: 500,
          fontFamily: 'EBGaramond',
          fontSize: 16,
          fontVariant: ['small-caps'],
     },
     bellContainer: {
          width: 45,
          height: 45,
          borderRadius: 100,
          borderWidth: .5,
          borderColor: MainColors["Neutral Gray"],
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
     },
     identifier: {
          position: 'absolute',
          width: 15,
          height: 15,
          backgroundColor: MainColors["Error red"],
          borderRadius: 20,
          top: 0,
          right: 0,
     }
})