import { useStylesGlobal } from "@/hooks/use-styles-global";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { View, Image, Text } from "react-native";

export default function ResetPasswordScreen() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.authBackground, { gap: 50 }]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -50 }]}>Reset your password</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="New password" />
                    <InputElement placeholder="Confirm password" />
               </View>

               <MainButton title="Reset Password" isFullWidth isDark />
          </View>
     )
}
