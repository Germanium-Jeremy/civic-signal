import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";

export default function SignupScreen() {
     const mainStyles = useStylesGlobal()
     const navigate = useRouter()

     const [fullNames, setFullNames] = useState('')
     const [email, setEmail] = useState('')
     const [phone, setPhone] = useState('')
     const [password, setPassword] = useState('')
     const [loading, setLoading] = useState(false)

     const handleSignup = async () => {
          // Validation
          if (!fullNames || !email || !phone || !password) {
               console.log("All fields are required");
               Alert.alert("Error", "All fields are required");
               return;
          }
          
          if (password.length < 8) {
               console.log("Password must be at least 8 characters");
               Alert.alert("Error", "Password must be at least 8 characters");
               return;
          }

          setLoading(true);

          const result = await AuthService.register({
               fullName: fullNames.trim(),
               email: email.toLowerCase(),
               phone: phone.replace(/\s/g, ""),
               password,
          });

          setLoading(false);

          if (result.success) {
               Alert.alert("Success!",
                    "Registration successful! Check your email and phone for verification codes.",
                    [{
                         text: "OK",
                         onPress: () => {
                              navigate.replace({
                                   pathname: "/(auth)/verifyaccount",
                                   params: { email: email.toLowerCase(), phone: phone.replace(/\s/g, ""), option: "Email" },
                              });
                         },
                    }]
               );
          } else {
               let errorMsg = result.error;
               if (result.details) errorMsg += "\n\n" + result.details.join("\n");
               Alert.alert("Registration Failed", errorMsg);
          }
     }

     return (
          <View style={[mainStyles.authBackground]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Create an Account</Text>

               <View style={{ width: '100%', gap: 10 }}>
                    <InputElement placeholder="Full Names" text={fullNames} onChange={setFullNames} />
                    <InputElement placeholder="Email Address" text={email} onChange={setEmail} isEmail autoCapitalize={false} />
                    <InputElement placeholder="Phone Number" text={phone} onChange={setPhone} isPhone />
                    <InputElement placeholder="Password" text={password} onChange={setPassword} isPassword />
               </View>

               <Text style={[mainStyles.normalText]}>Agree to our <Link href={"/_sitemap"}>terms of services</Link></Text>

               <MainButton title={loading ? "Signin up..." : "Signup"} isFullWidth isDark toDo={handleSignup} disabled={loading} />
               
               {loading && <ActivityIndicator size={'small'} color={MainColors["Almost Black"]} />}

               <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Already have an account? <Link href={"/(auth)/signin"} style={{ color: MainColors["Almost Black"] }}>Signin</Link></Text>
          </View>
     )
}