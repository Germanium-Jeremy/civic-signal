import { useStylesGlobal } from "@/hooks/use-styles-global";
import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { View, Image, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { useState, useEffect } from "react";
import { AuthService } from "@/services/apis/authServices";

export default function VerifyAccountScreen() {
     const mainStyles = useStylesGlobal()
     const searchParams = useLocalSearchParams()
     const navigate = useRouter()
     
     const option = searchParams.option ? searchParams.option : 'Account'
     const email = searchParams.email as string
     const phoneNumber = searchParams.phone as string

     // Check if fields are already verified (from login response)
     const initialEmailVerified = searchParams.emailVerified === 'true';
     const initialPhoneVerified = searchParams.phoneVerified === 'true';

     const [emailCode, setEmailCode] = useState("")
     const [phoneCode, setPhoneCode] = useState("")
     const [loading, setLoading] = useState(false)
     const [emailVerified, setEmailVerified] = useState(false)
     const [phoneVerified, setPhoneVerified] = useState(false)
     const [emailCooldown, setEmailCooldown] = useState(0)
     const [phoneCooldown, setPhoneCooldown] = useState(0)

     useEffect(() => {
          if (initialEmailVerified && !initialPhoneVerified) {
               Alert.alert("Email Already Verified", "Please verify your phone number to continue");
          } else if (initialPhoneVerified && !initialEmailVerified) {
               Alert.alert("Phone Already Verified", "Please verify your email to continue");
          }
     }, [initialEmailVerified, initialPhoneVerified]);

     useEffect(() => {
          if (emailCooldown > 0) setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
     }, [emailCooldown]);

     useEffect(() => {
          if (phoneCooldown > 0) setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
     }, [phoneCooldown]);

     const handleVerifyEmail = async () => {
          if (emailCode.length !== 6) {
               Alert.alert("Error", "Enter 6-digit code");
               return;
          }

          setLoading(true);
          const result = await AuthService.verifyEmail(email, emailCode);
          setLoading(false);

          if (result.success) {
               setEmailVerified(true);
               Alert.alert("Success!", "Email verified!");

               // Check if fully verified (both email and phone)
               if (result.data.fullyVerified) {
                    Alert.alert("Account Verified!", "You can now start using the app!", [
                         {
                              text: "OK",
                              onPress: () => navigate.replace("/(tabs)/home"),
                         },
                    ]);
               } else if (phoneVerified) {
                    // Phone was already verified, now both are done
                    Alert.alert("Account Verified!", "You can now start using the app!", [
                         {
                              text: "OK",
                              onPress: () => navigate.replace("/(tabs)/home"),
                         },
                    ]);
               }
          } else {
               Alert.alert("Failed", result.error);
               setEmailCode("");
          }
     };

     const handleVerifyPhone = async () => {
          if (phoneCode.length !== 6) {
               Alert.alert("Error", "Enter 6-digit code");
               return;
          }

          setLoading(true);
          const result = await AuthService.verifyPhone(phoneNumber, phoneCode);
          setLoading(false);

          if (result.success) {
               setPhoneVerified(true);
               Alert.alert("Success!", "Phone verified!");

               // Check if fully verified (both email and phone)
               if (result.data.fullyVerified) {
                    Alert.alert("Account Verified!", "You can now start using the app!", [
                         {
                              text: "OK",
                              onPress: () => navigate.replace("/(tabs)/home"),
                         },
                    ]);
               } else if (emailVerified) {
                    // Email was already verified, now both are done
                    Alert.alert("Account Verified!", "You can now start using the app!", [
                         {
                              text: "OK",
                              onPress: () => navigate.replace("/(tabs)/home"),
                         }
                    ]);
               }
          } else {
               Alert.alert("Failed", result.error);
               setPhoneCode("");
          }
     };

     const handleResendEmail = async () => {
          if (emailCooldown > 0) return;
          
          const result = await AuthService.resendEmailCode(email);
          if (result.success) {
               setEmailCooldown(60);
               Alert.alert("Success!", "New code sent to email");
          } else {
               Alert.alert("Error", result.error);
          }
     };

     const handleResendPhone = async () => {
          if (phoneCooldown > 0) return;
          
          const result = await AuthService.resendPhoneCode(phoneNumber);
          if (result.success) {
               setPhoneCooldown(60);
               Alert.alert("Success!", "New code sent to phone");
          } else {
               Alert.alert("Error", result.error);
          }
     };
          
     return (
          <View style={[mainStyles.authBackground, { gap: 50 }]}>
               <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
               <Text style={[mainStyles.authTitles, { marginTop: -50 }]}>Verify your {option}</Text>
               
               <Text style={[mainStyles.normalText, { textAlign: "center" }]}>
                    {email && `📧 ${email}`}
                    {email && phoneNumber && "\n"}
                    {phoneNumber && `📱 ${phoneNumber}`}
               </Text>

               {/* Email Verification - Only show if NOT already verified */}
               {!emailVerified ? (
                    <View style={{ width: "100%", gap: 10 }}>
                         <Text style={[mainStyles.normalText, { fontWeight: "bold" }]}>Email Verification Code</Text>
                         <InputElement placeholder="6-digit email code" text={emailCode} onChange={setEmailCode} isPhone />
                         <MainButton title={loading ? "Verifying..." : "Verify Email"} isFullWidth isDark
                              toDo={handleVerifyEmail} disabled={loading || emailCode.length !== 6} 
                         />
                         <TouchableOpacity onPress={handleResendEmail} disabled={emailCooldown > 0}>
                              <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "center" }]}>
                                   {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Resend Email Code"}
                              </Text>
                         </TouchableOpacity>
                    </View>
               ) : (
                    <View style={{ width: "100%", gap: 10 }}>
                         <Text style={[mainStyles.normalText, { fontWeight: "bold", color: 'green', textAlign: 'center' }]}>
                              ✅ Email Already Verified
                         </Text>
                    </View>
               )}

               {/* Phone Verification - Only show if NOT already verified */}
               {!phoneVerified ? (
                    <View style={{ width: "100%", gap: 10 }}>
                         <Text style={[mainStyles.normalText, { fontWeight: "bold" }]}>Phone Verification Code</Text>
                         <InputElement placeholder="6-digit phone code" text={phoneCode} onChange={setPhoneCode} isPhone />
                         <MainButton title={loading ? "Verifying..." : "Verify Phone"} isFullWidth isDark 
                              toDo={handleVerifyPhone} disabled={loading || phoneCode.length !== 6} 
                         />
                         <TouchableOpacity onPress={handleResendPhone} disabled={phoneCooldown > 0}>
                              <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "center" }]}>
                                   {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : "Resend Phone Code"}
                              </Text>
                         </TouchableOpacity>
                    </View>
               ) : (
                    <View style={{ width: "100%", gap: 10 }}>
                         <Text style={[mainStyles.normalText, { fontWeight: "bold", color: 'green', textAlign: 'center' }]}>
                              ✅ Phone Already Verified
                         </Text>
                    </View>
               )}

               {loading && <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />}

               {(emailVerified || phoneVerified) && !(emailVerified && phoneVerified) && (
                    <Text style={[mainStyles.normalText, { textAlign: 'center', color: MainColors["Primary Blue"] }]}>
                         {emailVerified ? "1/2 Complete - Verify phone to continue" : "1/2 Complete - Verify email to continue"}
                    </Text>
               )}
          </View>
     )
}
