import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Link, useRouter } from "expo-router";
import { Image, Text, View } from "react-native";

export default function SigninScreen() {
     const mainStyles = useStylesGlobal()
     const router = useRouter()

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Log into your Account</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="Email Address / Phone" />
                    <InputElement placeholder="Password" />
               </View>

               <Link href={"/(auth)/forgot"} style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: 'right', width: '100%' }]}>Forgot Password?</Link>

               <MainButton title="Signin" isFullWidth toDo={() => router.replace("/(tabs)/home")} isDark />

               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Don't have an account? <Link href={"/(auth)/signup"} style={{ color: MainColors["Almost Black"] }}>Signup</Link></Text>
          </View>
     )
}