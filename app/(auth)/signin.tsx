import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";

export default function SigninScreen() {
     const mainStyles = useStylesGlobal()
     const router = useRouter()

     const [email, setEmail] = useState('')
     const [password, setPassword] = useState('')
     const [loading, setLoading] = useState(false)

     const handleSignin = async () => {
          if (!email || !password) {
               Alert.alert("Error", "Please enter both email and password");
               return;
          }

          setLoading(true);
          const result = await AuthService.login(email.toLowerCase(), password);
          setLoading(false);

          if (result.success) {
               Alert.alert("Welcome!", `Hello ${result.data.user.fullName}!`, [
                    { text: "OK", onPress: () => router.replace("/(tabs)/home") }
               ]);
          } else if (result.requiresVerification) {
               const alertMessage = result.message || "Complete account verification to continue";
               Alert.alert("Verification Required", alertMessage, [
                    {
                         text: "Verify Now",
                         onPress: () => {
                              router.push({
                                   pathname: "/(auth)/verifyaccount",
                                   params: {
                                        email: result.email,
                                        phone: result.phone,
                                        emailVerified: result.emailVerified ? 'true' : 'false',
                                        phoneVerified: result.phoneVerified ? 'true' : 'false',
                                        option: "Account"
                                   }
                              });
                         }
                    },
                    { text: "Cancel", style: "cancel" }
               ]);
          } else {
               Alert.alert("Login Failed", result.error);
          }
     };

     return (
          <ScrollView style={{ flexGrow: 1, backgroundColor: MainColors["Main Background"] }}>
               <View style={[mainStyles.authBackground]}>
                    <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
                    <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Log into your Account</Text>

                    <View style={{ width: '100%', gap: 10 }}>
                         <InputElement placeholder="Email Address" text={email} onChange={setEmail} isEmail autoCapitalize />
                         <InputElement placeholder="Password" text={password} onChange={setPassword} isPassword />
                    </View>

                    <Link href={"/(auth)/forgot"} style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: 'right', width: '100%' }]}>Forgot Password?</Link>

                    <MainButton title={loading ? 'Signing in...' : 'Signin'} isFullWidth toDo={handleSignin} disabled={loading} isDark />

                    {loading && <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />}

                    <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Don't have an account? <Link href={"/(auth)/signup"} style={{ color: MainColors["Almost Black"] }}>Signup</Link></Text>
               </View>
          </ScrollView>
     )
}