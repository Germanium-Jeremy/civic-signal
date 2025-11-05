import MainButton from "@/components/MainButton";
import SubMainButton from "@/components/SubmainButton";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function OnboardingScreen() {
     const mainStyles = useStylesGlobal()
     const router = useRouter()

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={[styles.logo]} />
               <Text style={[styles.civcSignal]}>CIVICSIGNAL</Text>

               <MainButton title="Sign In" isFullWidth isDark toDo={() => router.push("/(auth)/signin")} />

               <SubMainButton title="Register" isFullWidth toDo={() => router.push("/(auth)/signup")} />
          </View>
     )
}

const styles = StyleSheet.create({
     civcSignal: {
          fontSize: 30,
          textAlign: 'center',
          fontFamily: 'EBGaramondBold',
          marginBottom: 30,
          marginTop: -20,
     },
     logo: {
          width: 150,
          height: 150,
     }
})