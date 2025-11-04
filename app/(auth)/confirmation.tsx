import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ConfirmationResetPasswordScreen() {
     const mainStyles = useStylesGlobal()
     
     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[styles.civcSignal]}>CIVICSIGNAL</Text>
               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], marginBottom: 50 }]}>Your password has been updated. You can now log in to your account.</Text>

               <MainButton title="Go to signin" isFullWidth />
          </View>
     )
}

const styles = StyleSheet.create({
     civcSignal: {
          fontSize: 30,
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "EBGaramond",
          marginBottom: 30,
          marginTop: -20,
     },
});