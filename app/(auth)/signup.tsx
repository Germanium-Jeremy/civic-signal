import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { Link } from "expo-router";
import { Image, Text, View } from "react-native";

export default function SignupScreen() {
     const mainStyles = useStylesGlobal()

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Create an Account</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="Full Names" />
                    <InputElement placeholder="Email Address" />
                    <InputElement placeholder="Phone Number" />
                    <InputElement placeholder="Password" />
               </View>

               <Text style={[mainStyles.normalText]}>Agree to our <Link href={"/_sitemap"}>terms of services</Link></Text>

               <MainButton title="Signup" isFullWidth />

               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Already have an account? <Link href={"/(auth)/signin"} style={{ color: MainColors["Almost Black"] }}>Signin</Link></Text>
          </View>
     )
}