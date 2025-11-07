import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Image, Text, View } from "react-native";

export default function WaitingScreen() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Account not verified</Text>
               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], marginBottom: 50 }]}>Two verification codes have been sent to your contacts. One to your email and another to your phone number.</Text>

               <MainButton title="Verify" isFullWidth isDark />

               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>
                    Didn’t receive the codes? Resent code via
                    <Text style={{ color: MainColors["Almost Black"] }}> email</Text> or <Text style={{ color: MainColors["Almost Black"] }}> phone number</Text>.
               </Text>
          </View>
     )
}
