import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { isSixDigitCode, normalizeEmail, normalizePhone } from "@/services/apis/authInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";

export default function VerifyAccountScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; phone?: string; emailVerified?: string; phoneVerified?: string }>();
  const email = typeof params.email === "string" ? normalizeEmail(params.email) : "";
  const phone = typeof params.phone === "string" ? normalizePhone(params.phone) : "";
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [loading, setLoading] = useState<"email" | "phone" | null>(null);
  const [emailVerified, setEmailVerified] = useState(params.emailVerified === "true");
  const [phoneVerified, setPhoneVerified] = useState(params.phoneVerified === "true");
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  useEffect(() => {
    if (!email || !phone) Alert.alert("Missing verification details", "Return to sign in and try again so we can load your verification details.");
  }, [email, phone]);
  useEffect(() => {
    if (!emailCooldown) return;
    const timer = setTimeout(() => setEmailCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [emailCooldown]);
  useEffect(() => {
    if (!phoneCooldown) return;
    const timer = setTimeout(() => setPhoneCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [phoneCooldown]);

  const finishIfFullyVerified = (fullyVerified?: boolean) => {
    if (!fullyVerified) return;
    Alert.alert("Account verified", "You can now start using CivicSignal.", [{ text: "Continue", onPress: () => router.replace("/(tabs)/home") }]);
  };

  const verifyEmail = async () => {
    if (!email) { Alert.alert("Missing email", "Return to sign in and try again."); return; }
    if (!isSixDigitCode(emailCode)) { Alert.alert("Invalid code", "Enter the six-digit email code."); return; }
    setLoading("email");
    const result = await AuthService.verifyEmail(email, emailCode);
    setLoading(null);
    if (!result.success || !result.data) { setEmailCode(""); Alert.alert("Verification failed", result.error || "Please try again."); return; }
    setEmailVerified(true);
    setEmailCode("");
    finishIfFullyVerified(result.data.fullyVerified);
  };

  const verifyPhone = async () => {
    if (!phone) { Alert.alert("Missing phone number", "Return to sign in and try again."); return; }
    if (!isSixDigitCode(phoneCode)) { Alert.alert("Invalid code", "Enter the six-digit phone code."); return; }
    setLoading("phone");
    const result = await AuthService.verifyPhone(phone, phoneCode);
    setLoading(null);
    if (!result.success || !result.data) { setPhoneCode(""); Alert.alert("Verification failed", result.error || "Please try again."); return; }
    setPhoneVerified(true);
    setPhoneCode("");
    finishIfFullyVerified(result.data.fullyVerified);
  };

  const resendEmail = async () => {
    if (!email || emailCooldown) return;
    const result = await AuthService.resendEmailCode(email);
    if (!result.success) { Alert.alert("Unable to resend", result.error || "Please try again."); return; }
    setEmailCooldown(60);
    Alert.alert("Code sent", result.message || "A new code was sent to your email.");
  };
  const resendPhone = async () => {
    if (!phone || phoneCooldown) return;
    const result = await AuthService.resendPhoneCode(phone);
    if (!result.success) { Alert.alert("Unable to resend", result.error || "Please try again."); return; }
    setPhoneCooldown(60);
    Alert.alert("Code sent", result.message || "A new code was sent to your phone.");
  };

  return <View style={[mainStyles.authBackground, { gap: 24 }]}>
    <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
    <Text style={[mainStyles.authTitles, { marginTop: -20 }]}>Verify your account</Text>
    <Text style={[mainStyles.normalText, { textAlign: "center" }]}>{email}{email && phone ? "\n" : ""}{phone}</Text>
    {!emailVerified && <View style={{ width: "100%", gap: 10 }}>
      <Text style={mainStyles.normalText}>Email verification code</Text>
      <InputElement placeholder="6-digit email code" text={emailCode} onChange={setEmailCode} isPhone />
      <MainButton title={loading === "email" ? "Verifying..." : "Verify email"} isFullWidth isDark toDo={verifyEmail} disabled={loading !== null || !email} />
      <TouchableOpacity onPress={resendEmail} disabled={!email || emailCooldown > 0}><Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "center" }]}>{emailCooldown ? `Resend in ${emailCooldown}s` : "Resend email code"}</Text></TouchableOpacity>
    </View>}
    {emailVerified && <Text style={[mainStyles.normalText, { color: "green", textAlign: "center" }]}>Email verified</Text>}
    {!phoneVerified && <View style={{ width: "100%", gap: 10 }}>
      <Text style={mainStyles.normalText}>Phone verification code</Text>
      <InputElement placeholder="6-digit phone code" text={phoneCode} onChange={setPhoneCode} isPhone />
      <MainButton title={loading === "phone" ? "Verifying..." : "Verify phone"} isFullWidth isDark toDo={verifyPhone} disabled={loading !== null || !phone} />
      <TouchableOpacity onPress={resendPhone} disabled={!phone || phoneCooldown > 0}><Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "center" }]}>{phoneCooldown ? `Resend in ${phoneCooldown}s` : "Resend phone code"}</Text></TouchableOpacity>
    </View>}
    {phoneVerified && <Text style={[mainStyles.normalText, { color: "green", textAlign: "center" }]}>Phone verified</Text>}
    {loading && <ActivityIndicator size="large" color={MainColors["Primary Blue"]} />}
  </View>;
}
