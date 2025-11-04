import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Image, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Enter your email or phone number</Text>
               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>You will a code that allows you recover your account and reset the password to your account.</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="Email Address / Phone" />
               </View>

               <MainButton title="Get code" isFullWidth />               
          </View>
     )
}