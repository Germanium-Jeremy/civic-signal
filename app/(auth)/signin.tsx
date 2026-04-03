import InputElement from "@/components/InputElement";
import MainButton from "@/components/MainButton";
import { MainColors } from "@/constants/theme";
import { useStylesGlobal } from "@/hooks/use-styles-global";
import { AuthService } from "@/services/apis/authServices";
import { normalizeEmail } from "@/services/apis/authInput";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";

export default function SigninScreen() {
  const mainStyles = useStylesGlobal();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      Alert.alert("Missing details", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    const result = await AuthService.login(normalizedEmail, password);
    setLoading(false);

    if (result.success) {
      router.replace("/(tabs)/home");
      return;
    }

    if (result.requiresVerification) {
      if (!result.email || !result.phone) {
        Alert.alert("Verification required", "Your account needs verification, but the required account details were not returned. Please try again.");
        return;
      }
      Alert.alert("Verification required", result.message || "Complete account verification to continue.", [
        {
          text: "Verify now",
          onPress: () => router.push({
            pathname: "/(auth)/verifyaccount",
            params: {
              email: result.email,
              phone: result.phone,
              emailVerified: String(Boolean(result.emailVerified)),
              phoneVerified: String(Boolean(result.phoneVerified)),
            },
          }),
        },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    Alert.alert("Login failed", result.error || "Unable to sign in. Please try again.");
  };

  return (
    <ScrollView style={{ flexGrow: 1, backgroundColor: MainColors["Main Background"] }}>
      <View style={mainStyles.authBackground}>
        <Image source={require("@/assets/images/civicsignal.png")} resizeMode="contain" style={{ width: 150, height: 150 }} />
        <Text style={[mainStyles.authTitles, { marginTop: -10 }]}>Log into your Account</Text>
        <View style={{ width: "100%", gap: 10 }}>
          <InputElement placeholder="Email Address" text={email} onChange={setEmail} isEmail autoCapitalize={false} />
          <InputElement placeholder="Password" text={password} onChange={setPassword} isPassword />
        </View>
        <Link href="/(auth)/forgot" style={[mainStyles.normalText, { color: MainColors["Primary Blue"], textAlign: "right", width: "100%" }]}>Forgot Password?</Link>
        <MainButton title={loading ? "Signing in..." : "Sign in"} isFullWidth toDo={handleSignin} disabled={loading} isDark />
        {loading && <ActivityIndicator size="small" color={MainColors["Primary Blue"]} />}
        <Text style={[mainStyles.normalText, { color: MainColors["Primary Blue"] }]}>Don&apos;t have an account? <Link href="/(auth)/signup" style={{ color: MainColors["Almost Black"] }}>Sign up</Link></Text>
      </View>
    </ScrollView>
  );
}
