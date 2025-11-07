import { useStylesGlobal } from "@/hooks/use-styles-global";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { View, Image, Text } from "react-native";

export default function VerifyCode() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Enter your code</Text>
               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>A code was sent to your email or phone via messages. Enter the code here. The code expired in 5 minutes.</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="Code" />
               </View>

               <MainButton title="Verify" isFullWidth isDark />

               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Didn't get the code?</Text>
          </View>
     )
}